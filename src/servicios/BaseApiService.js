// /src/data/base-api-service.js

// ✨ 1. Importamos la librería para leer cookies en el cliente
import Cookies from 'js-cookie'; 
import { CONFIG } from '../config/config';          // Configuración global (ej: USE_MOCK_DATA, API_URL)
import { MOCKED_DB, generateMockId } from '../data/mock-data'; // Datos simulados y lógica de ID

class BaseApiService {

    constructor() {
        this.baseURL = CONFIG.API_URL;
    }

    #getHeaders(customHeaders = {}) {
        const headers = { 
            'Content-Type': 'application/json',
            ...customHeaders 
        };

        // ✨ 2. Extraemos el token directamente de la cookie segura
        if (typeof window !== 'undefined') {
            const token = Cookies.get('auth_token'); 
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return headers;
    }

    async #realApiFetch(method, url, options = {}) {
        console.log(`REAL API: [${method}] ${url}`);
        
        try {
            
            const fetchOptions = {
                ...options,
                headers: this.#getHeaders(options.headers)
            };

            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                // Manejo especial para 401 (Token vencido o inválido)
                if (response.status === 401) {
                    console.error("Token inválido o expirado.");
                    // Si el token expira, limpiamos y mandamos al login
                    if (typeof window !== 'undefined') {
                        Cookies.remove('auth_token');
                        window.location.href = '/login?error=expired'; 
                    }
                }

                const errorBody = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorBody.message || `Error ${response.status}: ${response.statusText}`);
            }
            
            if (response.status === 204) return { success: true };

            return await response.json();
            
        } catch (error) {
            throw new Error(`Fallo en la comunicación API: ${error.message}`);
        }
    }

    async #mockDataFetch(method, entityName, id = null, data = null) {
        console.log(`MOCK FILE: [${method}] Leyendo data para ${entityName}`);
        await new Promise(resolve => setTimeout(resolve, 300)); // Simula latencia
        
        const collection = MOCKED_DB[entityName];
        if (!collection) {
            throw new Error(`MOCK 404: Archivo de mock para '${entityName}' no encontrado.`);
        }
                
        // GET (Leer)
        if (method === 'GET') {
             return id ? collection.find(item => item.id === id) || null : collection;
        }
        
        // POST (Crear)
        if (method === 'POST') {
             const newId = generateMockId(entityName.slice(0, 1).toUpperCase());
             const newItem = { ...data, id: newId };
             collection.push(newItem); // Almacenamiento simulado
             return newItem;
        }

        // Requiere ID para las operaciones siguientes
        const index = collection.findIndex(item => item.id === id);
        
        if (index === -1) {
             throw new Error(`MOCK 404: No se puede ${method}. ${entityName} ID ${id} no encontrado.`);
        }

        // PUT (Actualizar)
        if (method === 'PUT') {
            // Simula la actualización: mantiene el ID y fusiona los datos
            MOCKED_DB[entityName][index] = { ...collection[index], ...data, id };
            return MOCKED_DB[entityName][index];
        }
        
        // DELETE (Eliminar)
        if (method === 'DELETE') {
            collection.splice(index, 1); // Elimina 1 elemento en la posición 'index'
            return { success: true, message: `${entityName} ${id} eliminado.` };
        }

        throw new Error(`MOCK: Método ${method} no soportado.`);
    }

    async #executeRequest(method, entityName, id = null, data = null, queryParams = null) {
        if (CONFIG.USE_MOCK_DATA) {
            return await this.#mockDataFetch(method, entityName, id, data);
        } else {
            // Construcción de URL mejorada para soportar query params
            let url = `${this.baseURL}/${entityName}${id ? '/' + id : ''}`;
            
            // Si hay queryParams (ej: { page: 1, limit: 3 }), los añadimos a la URL
            if (queryParams) {
                const searchParams = new URLSearchParams(queryParams);
                url += `?${searchParams.toString()}`;
            }

            const options = {
                method: method,
                // headers: se generan dentro de #realApiFetch ahora
                body: data ? JSON.stringify(data) : null,
            };
            return await this.#realApiFetch(method, url, options);
        }
    }

    // --- MÉTODOS PÚBLICOS (El Contrato) ---
    async get(entityName, idOrParams = null) {
        // Si el segundo argumento es un objeto pero no un string, son params
        if (typeof idOrParams === 'object' && idOrParams !== null) {
            return await this.#executeRequest('GET', entityName, null, null, idOrParams);
        }
        // Si es string o number, es un ID
        return await this.#executeRequest('GET', entityName, idOrParams);
    }
    
    async post(entityName, data, isFormData = false) {
        return await this.#executeRequest('POST', entityName, null, data, null, isFormData);
    }

    async put(entityName, id, data, isFormData = false) {
        return await this.#executeRequest('PUT', entityName, id, data, null, isFormData);
    }
    
    async delete(entityName, id) {
        return await this.#executeRequest('DELETE', entityName, id);
    }
}

// Exportamos una única instancia (Singleton) para toda la aplicación
export const ApiService = new BaseApiService();