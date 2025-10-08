// /src/services/cursos-service.js

import { ApiService } from '../servicios/BaseApiService'; // Importa la instancia Singleton

class CourseService {
    
    /**
     * Obtiene una lista de cursos. Si hay lógica de negocio (filtrado, orden, caché), 
     * debería ir aquí.
     */
    async getAllCourses() {
        try {
            // Usa el BaseApiService con el nombre de la entidad 'courses'
            const courses = await ApiService.get('courses');
            
            // Lógica de negocio: Por ejemplo, ordenar por título o filtrar si es necesario
            // return courses.filter(c => c.isVisible);
            
            return courses;
        } catch (error) {
            console.error("Error en CourseService.getAllCourses:", error);
            // Puedes relanzar el error o devolver un array vacío
            throw new Error("Fallo al obtener los cursos.");
        }
    }
    
    // Podrías añadir otros métodos aquí: getCourseById(id), searchCourses(query), etc.
}

// Exportamos la instancia del servicio de negocio
export const courseService = new CourseService();