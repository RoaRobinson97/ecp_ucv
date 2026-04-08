import { ApiService } from './BaseApiService'; 
import { CONFIG } from '../config/config';

class UserService {
    
    /**
     * Obtiene el objeto de usuario completo (User) por su ID.
     * @param {string} user_id - El ID del usuario a buscar.
     * @returns {Promise<Object | null>} El objeto User o null si no se encuentra.
     */
    async getUserById(user_id) {
        try {
            // Llama al método 'get' del BaseApiService para la entidad 'users'
            const user = await ApiService.get('users', user_id);
            
            return user || null;
        } catch (error) {
            console.error(`Error en UserService.getUserById(${user_id}):`, error);
            throw new Error("Fallo al obtener los datos del usuario."); 
        }
    }

    async hasInitialContract(user_id) {
            // --- BLOQUE DE SIMULACIÓN (MOCK) ---
            if (CONFIG.USE_MOCK_DATA) {
                console.warn(`[MOCK] Validando estado legal aleatorio para: ${user_id}`);
                
                // Simulamos latencia de red para ver el Skeleton/Spinner en el frontend
                await new Promise(resolve => setTimeout(resolve, 1000));
    
                // Retorna TRUE el 50% de las veces, FALSE el otro 50%
                const randomResult = Math.random() < 0.5;
                
                console.log(`[MOCK RESULT] ¿Tiene contrato previo?: ${randomResult}`);
                return randomResult;
            }
    
            // --- LLAMADA REAL AL API (Producción) ---
            try {
                const status = await ApiService.get('legal-status', user_id);
                // El backend debería retornar un objeto con esta propiedad
                return !!(status && status.tiene_carta_intencion);
            } catch (error) {
                console.error("Error real en hasInitialContract:", error);
                return false; 
            }
        }


    async getProviderDetails(user_id) {
        try {
            const user = await ApiService.get('users', user_id);
            
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
        // nombre_proveedor, biografia, avatar_url, tipo_proveedor e ID.
        return await ApiService.get(`providers/public/${codigo_proveedor}`);
    }

    /**
     * Obtiene todos los usuarios que tienen el rol de coordinador (Facultades).
     * Funciona tanto con Mock como con API Real.
     */
    async getCoordinadores() {
        try {
            // Si el API real tiene un endpoint específico para coordinadores, 
            // podrías cambiar esto a ApiService.get('users?rol=coordinador').
            // Por seguridad y compatibilidad con tu BaseApiService actual, 
            // traemos los usuarios y los filtramos.
            const allUsers = await ApiService.get('users');

            if (!allUsers || !Array.isArray(allUsers)) {
                console.warn("No se pudo obtener la lista de usuarios para extraer coordinadores.");
                return [];
            }

            // Filtramos estrictamente los que tienen rol 'coordinador'
            const coordinadores = allUsers.filter(user => user.rol === 'coordinador');
            
            return coordinadores;
        } catch (error) {
            console.error("Error obteniendo coordinadores en UserService:", error);
            return [];
        }
    }

    /**
     * ✨ NUEVO: Decodifica un JWT en el servidor.
     * @param {string | undefined} token El JWT en formato string
     * @returns {Object | null} El payload del token como objeto, o null si es inválido
     */
    getUserFromToken(token) {
        if (!token) return null;
        
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) return null;

            // Normalizamos el base64
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            
            // Usamos Buffer, que es la herramienta nativa de Node.js para esto
            const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
            
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Error al decodificar el token JWT:", error);
            return null;
        }
    }
}

export const userService = new UserService();