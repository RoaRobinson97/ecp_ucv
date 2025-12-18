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
     * Obtiene un curso por ID.
     */
    async getCourseById(courseId) {
        try {
            // MODO MOCK
            if (CONFIG.USE_MOCK_DATA) {
                const course = await ApiService.get('courses', courseId);
                if (!course) throw new Error(`Curso ${courseId} no encontrado.`);
                // ... lógica de mock para publicaciones ...
                return course;
            }

            // MODO REAL
            const backendCourse = await ApiService.get('courses', courseId);
            if (!backendCourse) throw new Error(`Curso ${courseId} no encontrado.`);

            // ✨ También aplicamos el Mapeo aquí para un solo curso
            const courseAdapted = {
                id: String(backendCourse.id),
                titulo: backendCourse.nombre || backendCourse.titulo,
                descripcion: backendCourse.descripcion,
                image: backendCourse.imagen || null,
                slug: backendCourse.slug || `curso-${backendCourse.id}`,
                
                // Agrega el resto de campos detallados
                contenido: backendCourse.contenido,
                objetivos: backendCourse.objetivos,
                duracion: backendCourse.duracion,
                // ... mapear el resto según lo que necesite tu página de detalle
                publications: [] // Si el backend aún no manda publicaciones, array vacío
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

        // MODO REAL (Probablemente un POST multipart/form-data)
        // Nota: BaseApiService.post por defecto es JSON. 
        // Para archivos necesitarías un método especial o ajustar headers, 
        // pero por ahora lo dejamos simple.
        throw new Error("Endpoint real de subida de archivos no configurado aún.");
    }

    async getCoursesByUserId(userId, { page = 1, limit = 9 } = {}) {
        // ... (Lógica similar a getAllCourses, agregando filtro si la API lo soporta)
        // Por ahora, reutilizamos la lógica genérica o lanzamos error si no hay endpoint
        return this.getAllCourses({ page, limit }); 
    }

    async getCoursesByProviderCode(providerCode, { page = 1, limit = 9 } = {}) {
         // ... (Igual que arriba)
         return this.getAllCourses({ page, limit });
    }
}

export const courseService = new CourseService();