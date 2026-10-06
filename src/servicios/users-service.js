import Cookies from 'js-cookie';
import { ApiService } from './BaseApiService'; 
import { CONFIG } from '../config/config';
import { providerToLegacy } from './adapters';
import { FACULTADES } from '../data/facultades';
import { sessionFromToken } from '../utils/session';

// Sesión del usuario que navega, en el navegador o en el servidor (SSR).
async function getCurrentSession() {
    if (typeof window !== 'undefined') {
        return sessionFromToken(Cookies.get('auth_token'));
    }
    try {
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        return sessionFromToken(cookieStore.get('auth_token')?.value);
    } catch {
        return null;
    }
}

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

    /**
     * Busca el proveedor (de cursos) de un usuario. El propio usuario lo obtiene por el ID de
     * proveedor de su token; los administradores, en el listado de proveedores. Sin sesión no hay
     * acceso a los proveedores, así que devuelve null.
     */
    async findProviderByUserId(user_id) {
        const session = await getCurrentSession();
        if (!session) return null;

        if (String(session.id) === String(user_id)) {
            if (!session.provider_id) return null;
            return await ApiService.get('providers', session.provider_id);
        }

        const response = await ApiService.get('providers', { type: 'courses', per_page: 1000 });
        const found = (response?.proveedores || []).find(p => String(p.usuario_id) === String(user_id));
        // El listado no trae los contratos legales; el detalle sí.
        return found ? await ApiService.get('providers', found.id) : null;
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
            const proveedor = await this.findProviderByUserId(user_id);
            return !!(proveedor?.contratos_legales || []).some(c => c.tipo === 'inicial');
        } catch (error) {
            return false; 
        }
    }

    /**
     * Registra el contrato inicial (carta de intención + compromiso) o una adenda del proveedor
     * del usuario. Go ampara todos sus cursos aprobados que aún no tenían contrato.
     */
    async submitLegalDocuments(user_id, formData) {
        const provider = await this.findProviderByUserId(user_id);
        if (!provider) throw new Error("No se encontró el proveedor del usuario.");

        const goFormData = new FormData();
        for (const key of ['carta_intencion', 'carta_compromiso', 'adenda']) {
            if (formData.has(key)) goFormData.append(key, formData.get(key));
        }
        return await ApiService.post(`admin/providers/${provider.id}/legal-contracts`, goFormData, true);
    }

    async getProviderDetails(user_id) {
        try {
            const user = await ApiService.get('users', user_id);
            
            if (user && (user.rol === 'proveedor' || (user.roles && user.roles.includes('proveedor'))) && user.codigo_proveedor) {
                const allProviders = await ApiService.get('providers'); 
                
                // ✨ FIX ANTI-CRASHEO: Asegurarnos de que sea un array antes de hacer .find()
                let providersArray = [];
                if (Array.isArray(allProviders)) {
                    providersArray = allProviders;
                } else if (allProviders && Array.isArray(allProviders.proveedores)) {
                    providersArray = allProviders.proveedores;
                } else if (allProviders && Array.isArray(allProviders.data)) {
                    providersArray = allProviders.data;
                }
                
                const providerData = providersArray.find(
                    p => String(p.id) === String(user.codigo_proveedor) || String(p.usuario_id) === String(user.id)
                );

            const provider = await this.findProviderByUserId(user_id).catch(() => null);
            if (!provider) return user;

            const providerData = providerToLegacy(provider);
            // Go no devuelve el rol del usuario consultado: un proveedor activo es 'proveedor'.
            const isApprovedProvider = provider.estado === 'active';

            return { 
                ...providerData, 
                ...user, 
                rol: isApprovedProvider ? 'proveedor' : (user.rol || 'visitante'),
                roles: isApprovedProvider ? ['proveedor'] : (user.roles || ['visitante']),
                codigo_proveedor: provider.codigo_proveedor,
                provider_table_id: providerData.id 
            };
        } catch (error) {
            console.error("Error en getProviderDetails:", error);
            throw error;
        }
    }

    async getPublicProviderProfile(codigo_proveedor) {
        return await ApiService.get(`providers/public/${codigo_proveedor}`);
    }

    /**
     * En Go hay un coordinador por facultad y las solicitudes se dirigen por facultad, así que la
     * "lista de coordinadores" es la lista fija de facultades: `id` es el valor que espera la API.
     */
    async getCoordinadores() {
        return FACULTADES.map(f => ({ id: f.value, facultad: f.label }));
    }

    /** Sesión derivada del JWT de Go, con los nombres de rol que usa la UI. */
    getUserFromToken(token) {
        return sessionFromToken(token);
    }

    async checkPendingProviderRequest(user_id) {
        if (!user_id || user_id === '0' || user_id === 'undefined') return false;
        
        try {
            // Usamos ApiService que maneja las URLs automáticamente
            const proveedores = await ApiService.get('providers', { usuario_id: user_id });
            
            if (proveedores && Array.isArray(proveedores) && proveedores.length > 0) {
                return proveedores.some(req => 
                    req.estado === 'under_review' || req.estado === 'pendiente'
                );
            }
            return false;
        } catch (error) {
            console.error("Error al verificar solicitud pendiente en UserService:", error);
            return false;
        }
    }
}

export const userService = new UserService();