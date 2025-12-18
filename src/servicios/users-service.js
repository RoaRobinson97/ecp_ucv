import { ApiService } from './BaseApiService'; 

class UserService {
    
    /**
     * Obtiene el objeto de usuario completo (User) por su ID.
     * @param {string} userId - El ID del usuario a buscar.
     * @returns {Promise<Object | null>} El objeto User o null si no se encuentra.
     */
    async getUserById(userId) {
        try {
            // Llama al método 'get' del BaseApiService para la entidad 'users'
            const user = await ApiService.get('users', userId);
            
            return user || null;
        } catch (error) {
            console.error(`Error en UserService.getUserById(${userId}):`, error);
            throw new Error("Fallo al obtener los datos del usuario."); 
        }
    }
}

export const userService = new UserService();