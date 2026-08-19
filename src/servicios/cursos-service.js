import { ApiService } from './BaseApiService';
import { CONFIG } from '../config/config';

class CourseService {

    async getPublicCourses(limit = 15) {
        try {
            const res = await fetch('http://localhost:8080/course-requests', { cache: 'no-store' });
            if (!res.ok) return { courses: [] };

            const allCourses = await res.json();

            // Filtramos en el servicio para que solo pasen los que tengan contrato
            const filteredCourses = allCourses.filter(c => c.contrato_id || c.documento_legal_id);

            const adapted = filteredCourses.slice(0, limit).map(c => ({
                id: String(c.id),
                titulo: c.nombre || c.titulo || "Curso Sin Título",
                descripcion: c.descripcion || c.fundamentacion || "",
                image: c.image_url || c.imagen || c.cover || null,
                estado_gestion: c.estado || c.estado_gestion || 'pendiente',
                documento_legal_id: c.contrato_id || c.documento_legal_id || null
            }));

            return { courses: adapted };
        } catch (error) {
            console.error("Error en getPublicCourses:", error);
            return { courses: [] };
        }
    }

    async getAllCourses({ page = 1, limit = 9, user_id, codigo_proveedor, estado } = {}) {
        try {
            if (CONFIG.USE_MOCK_DATA) {
                const allCourses = await ApiService.get('courses') || [];
                const totalCourses = allCourses.length;
                const totalPages = Math.ceil(totalCourses / limit);
                const start = (page - 1) * limit;
                const end = start + limit;
                return { courses: allCourses.slice(start, end), totalPages, totalCourses };
            } 
            
            try {
                const queryParams = { 
                    _page: page, 
                    _limit: limit,
                    _t: Date.now() // ✨ FIX CRÍTICO: Esto obliga al navegador a no usar el caché
                };
                
                if (user_id) queryParams.usuario_id = user_id;
                if (codigo_proveedor) queryParams.codigo_proveedor = codigo_proveedor;
                if (estado) queryParams.estado = estado; 

                const response = await ApiService.get('courses', queryParams);

                let rawCourses = [];
                let totalCourses = 0;

                if (response.data && Array.isArray(response.data)) {
                    rawCourses = response.data;
                    totalCourses = response.total || response.data.length; 
                } else if (Array.isArray(response)) {
                    rawCourses = response;
                    totalCourses = response.length;
                } else if (response.cursos && Array.isArray(response.cursos)) {
                    rawCourses = response.cursos;
                    totalCourses = response.total || rawCourses.length;
                }

                const coursesAdapted = rawCourses.map(backendCourse => ({
                    id: String(backendCourse.id), 
                    titulo: backendCourse.nombre || backendCourse.titulo || "Curso Sin Título",
                    descripcion: backendCourse.descripcion || backendCourse.fundamentacion || "Sin descripción disponible.",
                    image: backendCourse.imagen || backendCourse.image_url || backendCourse.cover || null,
                    slug: backendCourse.slug || `curso-${backendCourse.id}`, 
                    
                    proposito: backendCourse.proposito || null,
                    fundamentacion: backendCourse.fundamentacion || backendCourse.descripcion || null,
                    duracion: backendCourse.duracion || null,
                    estructura_costos: backendCourse.estructura_costos || null,
                    perfil_docente: backendCourse.perfil_docente || null,
                    perfiles: backendCourse.perfiles || null,
                    exigencias: backendCourse.exigencias || null,
                    estructura_curricular: backendCourse.estructura_curricular || null,
                    evaluacion: backendCourse.evaluacion || null,
                    cronograma: backendCourse.cronograma || null,
                    
                    // Metadata administrativa
                    codigo_proveedor: backendCourse.codigo_proveedor || null,
                    user_id: backendCourse.usuario_id || backendCourse.user_id || null,
                    estado_gestion: backendCourse.estado || backendCourse.estado_gestion || backendCourse.status || 'under_review',
                    
                    // ✨ FIX VITAL: Inyectamos el ID legal para que el frontend lo reconozca
                    documento_legal_id: backendCourse.contrato_id || backendCourse.documento_legal_id || null, 

                    costo: backendCourse.costo || null,
                    tipo: backendCourse.tipo_curso || backendCourse.tipo || 'formulacion-curso-directa',
                    link_certificados: backendCourse.link_certificados || null
                }));

                const totalPages = Math.ceil(totalCourses / limit) || 1;

                return { 
                    courses: coursesAdapted, 
                    totalPages, 
                    totalCourses 
                };

            } catch (apiError) {
                console.warn("⚠️ El Backend falló o devolvió datos inválidos. Retornando lista vacía.");
                console.error(apiError);
                return { courses: [], totalPages: 0, totalCourses: 0 };
            }

        } catch (error) {
            console.error("Error crítico en CourseService.getAllCourses:", error);
            throw error; 
        }
    }

    async getCourseById(courseId) {
        try {
            // 1. Buscamos el curso base
            const backendCourse = await ApiService.get('courses', courseId);
            if (!backendCourse) throw new Error(`Curso ${courseId} no encontrado.`);

            // 2. Buscamos las cohortes de este curso
            let cohortes = [];
            try {
                const queryCohortes = await fetch(`http://localhost:8080/course-cycles?course_id=${courseId}&_t=${Date.now()}`);
                if (queryCohortes.ok) {
                    cohortes = await queryCohortes.json();
                    // Ordenamos de la más reciente a la más antigua
                    cohortes.sort((a, b) => new Date(b.creado_en || 0).getTime() - new Date(a.creado_en || 0).getTime());
                }
            } catch (err) { console.warn("No se pudieron cargar las cohortes"); }

            // 3. Buscamos las publicaciones globales
            let publicaciones = [];
            try {
                const queryPubs = await fetch(`http://localhost:8080/publications?course_id=${courseId}&_t=${Date.now()}`);
                if (queryPubs.ok) publicaciones = await queryPubs.json();
            } catch (err) { console.warn("No se pudieron cargar publicaciones"); }

            // 4. ENSAMBLAJE MAGISTRAL: Repartimos las publicaciones en sus respectivas cohortes
            cohortes = cohortes.map(cohorte => {
                return {
                    ...cohorte,
                    // Filtramos las pubs que le pertenecen a esta cohorte específica
                    publicaciones: publicaciones.filter(pub => String(pub.cohort_id) === String(cohorte.id))
                };
            });

            // 5. Adaptamos el curso para el frontend
            const courseAdapted = {
                id: String(backendCourse.id),
                titulo: backendCourse.nombre || backendCourse.titulo || "Curso Sin Título",
                descripcion: backendCourse.descripcion || backendCourse.fundamentacion || "Sin descripción disponible.",
                image: backendCourse.imagen || backendCourse.image_url || backendCourse.cover || null,
                slug: backendCourse.slug || `curso-${backendCourse.id}`,
                
                proposito: backendCourse.proposito,
                fundamentacion: backendCourse.fundamentacion || backendCourse.descripcion,
                duracion: backendCourse.duracion,
                estructura_costos: backendCourse.estructura_costos,
                perfil_docente: backendCourse.perfil_docente,
                perfiles: backendCourse.perfiles,
                exigencias: backendCourse.exigencias,
                estructura_curricular: backendCourse.estructura_curricular,
                evaluacion: backendCourse.evaluacion,
                cronograma: backendCourse.cronograma,
                
                codigo_proveedor: backendCourse.codigo_proveedor,
                user_id: backendCourse.usuario_id || backendCourse.user_id,
                estado_gestion: backendCourse.estado || backendCourse.estado_gestion || backendCourse.status,
                documento_legal_id: backendCourse.contrato_id || backendCourse.documento_legal_id || null, 
                
                costo: backendCourse.costo || null,
                tipo: backendCourse.tipo_curso || backendCourse.tipo || 'formulacion-curso-directa',
                link_certificados: backendCourse.link_certificados || null,

                // ✨ INYECTAMOS LAS COHORTES ENSAMBLADAS
                cohortes: cohortes
            };

            return courseAdapted;

        } catch (error) {
            console.error(`Error en CourseService.getCourseById(${courseId}):`, error);
            throw error; 
        }
    }

    async requestCohortClosure(courseId, files) {
        console.log(`API: Solicitando cierre para ${courseId}...`);
        
        if (CONFIG.USE_MOCK_DATA) {
             return { success: true };
        }

        return await ApiService.post(`courses/${courseId}/closures`, files, true);
    }

    async getCoursesByUserId(user_id, { page = 1, limit = 9 } = {}) {
        try {
            if (CONFIG.USE_MOCK_DATA) {
                const allCourses = await ApiService.get('courses') || [];
                const filteredCourses = allCourses.filter(course => String(course.usuario_id || course.user_id) === String(user_id));
                const totalCourses = filteredCourses.length;
                const totalPages = Math.ceil(totalCourses / limit) || 1;
                const start = (page - 1) * limit;
                const end = start + limit;

                return { 
                    courses: filteredCourses.slice(start, end), 
                    totalPages, 
                    totalCourses 
                };
            }

            return this.getAllCourses({ page, limit, user_id });

        } catch (error) {
            console.error("Error en getCoursesByUserId:", error);
            throw error;
        }
    }

    async getCoursesBycodigo_proveedor(codigo_proveedor, { page = 1, limit = 9 } = {}) {
        try {
            if (CONFIG.USE_MOCK_DATA) {
                const allCourses = await ApiService.get('courses') || [];
                const filteredCourses = allCourses.filter(course => course.codigo_proveedor === codigo_proveedor);
                const totalCourses = filteredCourses.length;
                const totalPages = Math.ceil(totalCourses / limit) || 1;
                const start = (page - 1) * limit;
                const end = start + limit;

                return { 
                    courses: filteredCourses.slice(start, end), 
                    totalPages, 
                    totalCourses 
                };
            }

            return this.getAllCourses({ page, limit, codigo_proveedor });

        } catch (error) {
            console.error("Error en getCoursesBycodigo_proveedor:", error);
            throw error;
        }
    }

    async openCohort(courseId, cohortData) {
        try {
            if (CONFIG.USE_MOCK_DATA) return { success: true };
            
            // Enviamos la data al nuevo endpoint de Next.js
            return await ApiService.post(`courses/${courseId}/open`, cohortData);
        } catch (error) {
            console.error(`Error abriendo cohorte para curso ${courseId}:`, error);
            throw error;
        }
    }

    async getPublicationsByCourse(courseId) {
        try {
            if (CONFIG.USE_MOCK_DATA) return [];
            // Llama a nuestro nuevo GET pasando el ID del curso
            return await ApiService.get('publications', { course_id: courseId });
        } catch (error) {
            console.error("Error al obtener publicaciones:", error);
            return []; // Si falla, devolvemos un array vacío para no romper la vista
        }
    }

    // ✨ FIX: Ahora pedimos curso y cohorte explícitamente
    async getPublicationsByCohort(courseId, cohortId) {
        try {
            if (CONFIG.USE_MOCK_DATA) return [];
            return await ApiService.get('publications', { 
                course_id: courseId, 
                cohort_id: cohortId 
            });
        } catch (error) {
            console.error("Error al obtener publicaciones:", error);
            return []; 
        }
    }

    async addPublication(publicationData) {
        try {
            if (CONFIG.USE_MOCK_DATA) return { success: true, data: publicationData };
            
            // Enviamos el POST a la tabla "publications"
            return await ApiService.post('publications', publicationData);
        } catch (error) {
            console.error("Error al crear publicación en la API:", error);
            throw error;
        }
    }
}


export const courseService = new CourseService();