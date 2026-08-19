import { ApiService } from './BaseApiService'; 
import { CONFIG } from '../config/config';

class UserService {
    
    async getUserById(user_id) {
        if (!user_id || user_id === '0' || user_id === 'undefined') {
            return null;
        }

        try {
            const user = await ApiService.get('users', user_id);
            return user || null;
        } catch (error) {
            return null; 
        }
    }

    async hasInitialContract(user_id) {
        if (CONFIG.USE_MOCK_DATA) {
            console.warn(`[MOCK] Validando estado legal aleatorio para: ${user_id}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const randomResult = Math.random() < 0.5;
            console.log(`[MOCK RESULT] ¿Tiene contrato previo?: ${randomResult}`);
            return randomResult;
        }

        try {
            const proveedores = await ApiService.get('providers', { usuario_id: user_id });
            
            if (proveedores && proveedores.length > 0) {
                const proveedor = proveedores[0];
                return !!(proveedor.legal_status && proveedor.legal_status.tiene_carta_intencion);
            }
            return false;
        } catch (error) {
            return false; 
        }
    }

    async getProviderDetails(user_id) {
        try {
            const user = await ApiService.get('users', user_id);
            
            if (user && (user.rol === 'proveedor' || (user.roles && user.roles.includes('proveedor'))) && user.codigo_proveedor) {
                const allProviders = await ApiService.get('providers'); 
                
                // ✨ FIX: Ahora busca comparando con el 'id' del proveedor o el 'usuario_id'
                const providerData = allProviders.find(
                    p => (p.id === user.codigo_proveedor) || (p.usuario_id === user.id)
                );

                if (!providerData) {
                    console.warn(`No se encontró data extra para el proveedor: ${user.codigo_proveedor}`);
                    return user;
                }

                return { 
                    ...providerData, 
                    ...user, 
                    provider_table_id: providerData.id 
                };
            }
            
            return user;
        } catch (error) {
            console.error("Error en getProviderDetails:", error);
            throw error;
        }
    }

    async getPublicProviderProfile(codigo_proveedor) {
        return await ApiService.get(`providers/public/${codigo_proveedor}`);
    }

    async getCoordinadores() {
        try {
            const coordinadores = await ApiService.get('users', { rol: 'coordinador' });
            if (!coordinadores || !Array.isArray(coordinadores)) {
                return [];
            }
            return coordinadores;
        } catch (error) {
            console.error("Error obteniendo coordinadores en UserService:", error);
            return [];
        }
    }

    getUserFromToken(token) {
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            if (!base64Url) return null;
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error("Error al decodificar el token JWT:", error);
            return null;
        }
    }
}

export const userService = new UserService();