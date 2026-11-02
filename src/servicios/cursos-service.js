import { ApiService } from './BaseApiService';
import { CONFIG } from '../config/config';
import { courseToLegacy, periodToCohort } from './adapters';
import { sessionFromToken } from '../utils/session';

// Go rechaza la apertura (409) en tres casos que el mock de Node resumía en un solo mensaje.
const OPEN_COHORT_REJECTIONS = [
    'course is not covered by a legal contract',
    'a course period is already open for this course',
    'course has a pending closure request',
];
const OPEN_COHORT_REJECTED_MESSAGE =
    'El curso debe estar amparado legalmente (aprobado con contrato o cerrado) para poder abrir una cohorte.';

class CourseService {

    async getPublicCourses(limit = 15) {
        try {
            // Cursos aprobados, amparados por contrato y que ya abrieron alguna cohorte.
            const response = await ApiService.get('courses/public', { per_page: limit });
            const adapted = (response?.cursos || []).map(c => {
                const course = courseToLegacy(c);
                return {
                    id: course.id,
                    titulo: course.titulo,
                    descripcion: course.descripcion,
                    image: course.image,
                    estado_gestion: course.estado_gestion,
                    documento_legal_id: course.documento_legal_id
                };
            });

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
                    page, 
                    per_page: limit,
                    _t: Date.now() // ✨ FIX CRÍTICO: Esto obliga al navegador a no usar el caché
                };
                
                if (user_id) queryParams.usuario_id = user_id;
                if (codigo_proveedor) queryParams.codigo_proveedor = codigo_proveedor;
                if (estado) queryParams.estado = estado; 

                const response = await ApiService.get('courses', queryParams);
                let coursesAdapted = (response?.cursos || []).map(courseToLegacy);

                // GET /courses solo trae cursos aprobados. El dueño también ve sus propuestas en
                // revisión o rechazadas, que salen de sus solicitudes de curso.
                if (user_id && !estado) {
                    coursesAdapted = coursesAdapted.concat(await this._pendingCoursesOf(user_id, coursesAdapted));
                }

                // Go no devuelve el total: si la página vino llena, puede haber otra.
                const totalCourses = (page - 1) * limit + coursesAdapted.length;
                const totalPages = coursesAdapted.length >= limit ? page + 1 : page;

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

    /** Propuestas del usuario que aún no son cursos aprobados (en revisión o rechazadas). */
    async _pendingCoursesOf(user_id, approvedCourses) {
        try {
            const session = sessionFromToken(await this._token());
            if (!session || String(session.id) !== String(user_id)) return [];

            const response = await ApiService.get('course-requests', { pageSize: 100 });
            const approvedIds = new Set(approvedCourses.map(c => String(c.id)));
            return (response?.solicitudes || [])
                .filter(r => r.curso && !approvedIds.has(String(r.curso.id)) && r.estado !== 'approved')
                .map(r => ({
                    ...courseToLegacy({ ...r.curso, usuario_id: user_id }),
                    estado_gestion: r.estado === 'rejected' ? 'rechazada' : 'under_review',
                }));
        } catch (error) {
            console.warn("No se pudieron cargar las propuestas en revisión:", error);
            return [];
        }
    }

    async _token() {
        if (typeof window !== 'undefined') {
            const { default: Cookies } = await import('js-cookie');
            return Cookies.get('auth_token');
        }
        const { cookies } = await import('next/headers');
        return (await cookies()).get('auth_token')?.value;
    }

    async getCourseById(courseId) {
        try {
            const backendCourse = await ApiService.get('courses', courseId);
            if (!backendCourse) throw new Error(`Curso ${courseId} no encontrado.`);

            // Cohortes activas con sus publicaciones, de la más nueva a la más vieja.
            let cohortes = [];
            try {
                const periods = await ApiService.get(`courses/${courseId}/periods`, { per_page: 100, _t: Date.now() });
                cohortes = (periods?.periodos || []).map(p => periodToCohort(p, courseId));
                cohortes.sort((a, b) => new Date(b.creado_en || 0).getTime() - new Date(a.creado_en || 0).getTime());
            } catch (err) {
                console.warn("No se pudieron cargar las cohortes del curso", err);
            }

            return {
                ...courseToLegacy(backendCourse),
                cohorteActiva: cohortes.length > 0 ? cohortes[0] : null,
                cohortes
            };

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

        // Go cierra la cohorte (período) activa del curso: el formulario trae los 3 archivos y las
        // observaciones, y aquí se agrega el ID de la cohorte.
        const course = await this.getCourseById(courseId);
        if (!course.cohorteActiva) throw new Error("El curso no tiene una cohorte activa para cerrar.");

        const goFormData = new FormData();
        goFormData.append('course_cycle_id', course.cohorteActiva.id);
        goFormData.append('observaciones', files.get('observaciones') || '');
        for (const key of ['archivo_participantes', 'archivo_vouchers', 'archivo_encuesta']) {
            if (files.has(key)) goFormData.append(key, files.get(key));
        }
        return await ApiService.post('course-cycle-close-requests', goFormData, true);
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
            
            return await ApiService.post(`courses/${courseId}/periods`, {
                nombre_cohorte: cohortData.cohortName,
                fecha_inicio: cohortData.startDate,
                fecha_fin: cohortData.endDate,
                capacidad: Number(cohortData.capacity)
            });
        } catch (error) {
            console.error(`Error abriendo cohorte para curso ${courseId}:`, error);
            if (OPEN_COHORT_REJECTIONS.some(m => error.message?.includes(m))) {
                throw new Error(OPEN_COHORT_REJECTED_MESSAGE);
            }
            throw new Error(error.message.replace('Fallo en la comunicación API: ', ''));
        }
    }

    // Las publicaciones son anuncios de cada cohorte (período) y vienen dentro de ella.
    async getPublicationsByCourse(courseId) {
        try {
            if (CONFIG.USE_MOCK_DATA) return [];
            const course = await this.getCourseById(courseId);
            return course.cohortes.flatMap(c => c.publicaciones);
        } catch (error) {
            console.error("Error al obtener publicaciones:", error);
            return []; // Si falla, devolvemos un array vacío para no romper la vista
        }
    }

    async getPublicationsByCohort(courseId, cohortId) {
        try {
            if (CONFIG.USE_MOCK_DATA) return [];
            const course = await this.getCourseById(courseId);
            return course.cohortes.find(c => String(c.id) === String(cohortId))?.publicaciones || [];
        } catch (error) {
            console.error("Error al obtener publicaciones:", error);
            return []; 
        }
    }

    async addPublication(publicationData) {
        try {
            if (CONFIG.USE_MOCK_DATA) return { success: true, data: publicationData };
            
            const created = await ApiService.post(`course-periods/${publicationData.cohort_id}/announcements`, {
                titulo: publicationData.titulo,
                contenido: publicationData.contenido
            });
            // Go solo devuelve el ID: la vista muestra la publicación tal como se envió.
            return { ...publicationData, id: String(created?.id ?? publicationData.id) };
        } catch (error) {
            console.error("Error al crear publicación en la API:", error);
            throw error;
        }
    }
}


export const courseService = new CourseService();