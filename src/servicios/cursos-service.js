import { ApiService } from './BaseApiService';
import { CONFIG } from '../config/config';

/** @typedef {import('@/data/types').Course} Course */

class CourseService {

    /**
     * Obtiene una lista de cursos paginada y ADAPTADA al frontend.
     * @param {{ page?: number, limit?: number }} [options={}]
     */
    async getAllCourses({ page = 1, limit = 9 } = {}) {
        try {
            // --- MODO MOCK ---
            if (CONFIG.USE_MOCK_DATA) {
                const allCourses = await ApiService.get('courses') || [];
                const totalCourses = allCourses.length;
                const totalPages = Math.ceil(totalCourses / limit);
                const start = (page - 1) * limit;
                const end = start + limit;
                return { courses: allCourses.slice(start, end), totalPages, totalCourses };
            } 
            
            // --- MODO REAL ---
            try {
                // 1. Llamada a la API
                const response = await ApiService.get('courses', { page, limit });
                console.log('Backend Response (Raw):', response);

                let rawCourses = [];
                let totalCourses = 0;

                // 2. Normalizar respuesta (dependiendo de si viene en .data o directo)
                if (response.data && Array.isArray(response.data)) {
                    rawCourses = response.data;
                    totalCourses = response.total || response.data.length; // Fallback si no hay total
                } else if (Array.isArray(response)) {
                    rawCourses = response;
                    totalCourses = response.length;
                } else if (response.cursos && Array.isArray(response.cursos)) {
                    // Por si acaso tu backend devuelve { cursos: [...] }
                    rawCourses = response.cursos;
                    totalCourses = response.total || rawCourses.length;
                }

                // 3. ✨ MAPEO / CASTEO DE DATOS ✨
                // Transformamos "Backend Snake_Case" a "Frontend CamelCase"
                const coursesAdapted = rawCourses.map(backendCourse => ({
                    id: String(backendCourse.id), // Aseguramos que sea string
                    
                    // Frontend 'titulo' <--- Backend 'nombre'
                    titulo: backendCourse.nombre || backendCourse.titulo || "Curso Sin Título",
                    
                    // Frontend 'descripcion' <--- Backend 'descripcion'
                    descripcion: backendCourse.descripcion || "Sin descripción disponible.",
                    
                    // Frontend 'image' <--- Backend 'imagen' / 'image_url' / null
                    // Si el backend no manda imagen, pasamos null para que el componente use el placeholder
                    image: backendCourse.imagen || backendCourse.image_url || backendCourse.cover || null,
                    
                    // Frontend 'slug' <--- Backend 'slug' o generado
                    slug: backendCourse.slug || `curso-${backendCourse.id}`, 
                    
                    // Otros campos que podrían servirte
                    costo: backendCourse.costo,
                    tipo: backendCourse.tipo
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

    /**
     * Obtiene un curso por ID y le inyecta sus publicaciones.
     */
    async getCourseById(courseId) {
        try {
            // --- MODO MOCK ---
            if (CONFIG.USE_MOCK_DATA) {
                const course = await ApiService.get('courses', courseId);
                if (!course) throw new Error(`Curso ${courseId} no encontrado.`);
                
                // ✨ INYECCIÓN DE PUBLICACIONES PARA MODO MOCK
                try {
                    const allPublications = await ApiService.get('publications') || [];
                    // Filtramos las que pertenecen a este curso
                    course.publications = allPublications.filter(pub => String(pub.courseId) === String(courseId));
                } catch (pubError) {
                    console.warn("No se pudieron cargar las publicaciones en mock:", pubError);
                    course.publications = [];
                }

                return course;
            }

            // --- MODO REAL ---
            const backendCourse = await ApiService.get('courses', courseId);
            if (!backendCourse) throw new Error(`Curso ${courseId} no encontrado.`);

            // ✨ Aplicamos el Mapeo aquí para un solo curso
            const courseAdapted = {
                id: String(backendCourse.id),
                titulo: backendCourse.nombre || backendCourse.titulo,
                descripcion: backendCourse.descripcion,
                image: backendCourse.imagen || null,
                slug: backendCourse.slug || `curso-${backendCourse.id}`,
                
                // Agrega el resto de campos detallados
                proposito: backendCourse.proposito,
                fundamentacion: backendCourse.fundamentacion,
                duracion: backendCourse.duracion,
                estructura_costos: backendCourse.estructura_costos,
                perfil_docente: backendCourse.perfil_docente,
                perfiles: backendCourse.perfiles,
                exigencias: backendCourse.exigencias,
                estructura_curricular: backendCourse.estructura_curricular,
                evaluacion: backendCourse.evaluacion,
                cronograma: backendCourse.cronograma,
                codigo_proveedor: backendCourse.codigo_proveedor,
                user_id: backendCourse.user_id || backendCourse.user_id,
                estado_gestion: backendCourse.estado_gestion || backendCourse.status,
                
                // Asumimos que el backend real devolverá las publicaciones anidadas o un array vacío
                publications: backendCourse.publications || backendCourse.publicaciones || [] 
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
             // ... lógica mock ...
             return { success: true };
        }

        // --- MODO REAL ---
        // Enviamos el FormData con los archivos (notas, vouchers) al endpoint del backend de Go.
        // El tercer parámetro "true" indica que es multipart/form-data
        return await ApiService.post(`courses/${courseId}/closures`, files, true);
    }

    async getCoursesByUserId(user_id, { page = 1, limit = 9 } = {}) {
        try {
            // --- MODO MOCK ---
            if (CONFIG.USE_MOCK_DATA) {
                const allCourses = await ApiService.get('courses') || [];
                
                // Filtrar por el código del proveedor
                const filteredCourses = allCourses.filter(
                    course => course.user_id === user_id
                );

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

            // --- MODO REAL ---
            return this.getAllCourses({ page, limit, user_id });

        } catch (error) {
            console.error("Error en getCoursesBycodigo_proveedor:", error);
            throw error;
        }
    }

    async getCoursesBycodigo_proveedor(codigo_proveedor, { page = 1, limit = 9 } = {}) {
        console.log('este es el codigo de ', codigo_proveedor)
        try {
            // --- MODO MOCK ---
            if (CONFIG.USE_MOCK_DATA) {
                const allCourses = await ApiService.get('courses') || [];
                
                // Filtrar por el código del proveedor
                const filteredCourses = allCourses.filter(
                    course => course.codigo_proveedor === codigo_proveedor
                );

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

            // --- MODO REAL ---
            return this.getAllCourses({ page, limit, codigo_proveedor });

        } catch (error) {
            console.error("Error en getCoursesBycodigo_proveedor:", error);
            throw error;
        }
    }
}

export const courseService = new CourseService();