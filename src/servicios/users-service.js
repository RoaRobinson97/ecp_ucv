import { ApiService } from './BaseApiService'; 
import { CONFIG } from '../config/config';

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

    async hasInitialContract(userId) {
            // --- BLOQUE DE SIMULACIÓN (MOCK) ---
            if (CONFIG.USE_MOCK_DATA) {
                console.warn(`[MOCK] Validando estado legal aleatorio para: ${userId}`);
                
                // Simulamos latencia de red para ver el Skeleton/Spinner en el frontend
                await new Promise(resolve => setTimeout(resolve, 1000));
    
                // Retorna TRUE el 50% de las veces, FALSE el otro 50%
                const randomResult = Math.random() < 0.5;
                
                console.log(`[MOCK RESULT] ¿Tiene contrato previo?: ${randomResult}`);
                return randomResult;
            }
    
            // --- LLAMADA REAL AL API (Producción) ---
            try {
                const status = await ApiService.get('legal-status', userId);
                // El backend debería retornar un objeto con esta propiedad
                return !!(status && status.tiene_carta_intencion);
            } catch (error) {
                console.error("Error real en hasInitialContract:", error);
                return false; 
            }
        }


    async getProviderDetails(userId) {
        try {
            const user = await ApiService.get('users', userId);
            
            if (user && user.rol === 'proveedor' && user.codigo_proveedor) {
                // 1. Obtenemos TODOS los proveedores (en modo Mock esto trae el array completo)
                const allProviders = await ApiService.get('providers'); 
                
                // 2. Buscamos el que coincida con el código
                const providerData = allProviders.find(
                    p => (p.codigo_proveedor === user.codigo_proveedor) || (p.codigo === user.codigo_proveedor)
                );

                if (!providerData) {
                    console.warn(`No se encontró data extra para el proveedor: ${user.codigo_proveedor}`);
                    return user; // Devolvemos solo el user si no hay data de provider
                }

                console.log("Datos de proveedor encontrados:", providerData);
                
                // 3. Fusión final
                return { ...user, ...providerData };
            }
            
            return user;
        } catch (error) {
            console.error("Error en getProviderDetails:", error);
            throw error;
        }
    }

    async getPublicProviderProfile(codigo_proveedor) {
        // Este endpoint debería ser público y devolver solo:
        // nombre_proveedor, biografia, avatarUrl, tipo_proveedor e ID.
        return await ApiService.get(`providers/public/${codigo_proveedor}`);
    }
}



export const userService = new UserService();