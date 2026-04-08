// /src/data/base-api-service.js

import Cookies from 'js-cookie'; 
import { CONFIG } from '../config/config';
import { MOCKED_DB, generateMockId } from '../data/mock-data';

class BaseApiService {

    constructor() {
        this.baseURL = CONFIG.API_URL;
    }

    // Método privado para configurar headers
    #getHeaders(customHeaders = {}, isMultipart = false) {
        const headers = { ...customHeaders };

        // 🚨 SI ES MULTIPART: El navegador DEBE poner el Content-Type solo.
        // Si no lo es, forzamos JSON.
        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }

        if (typeof window !== 'undefined') {
            const token = Cookies.get('auth_token'); 
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return headers;
    }

    // Método privado para la petición real
    async #realApiFetch(method, url, options = {}) {
        const { isMultipart, ...fetchOptionsWithoutMultipart } = options;
        
        try {
            const fetchOptions = {
                ...fetchOptionsWithoutMultipart,
                headers: this.#getHeaders(options.headers, isMultipart)
            };

            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                if (response.status === 401 && typeof window !== 'undefined') {
                    Cookies.remove('auth_token');
                    window.location.href = '/login?error=expired'; 
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

    // ✨ EL MÉTODO QUE TE DABA ERROR: Ahora dentro de la clase
    async #mockDataFetch(method, entityName, id = null, data = null) {
        console.log(`MOCK FILE: [${method}] Leyendo data para ${entityName}`);
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const collection = MOCKED_DB[entityName];
        if (!collection) {
            throw new Error(`MOCK 404: Archivo de mock para '${entityName}' no encontrado.`);
        }
                
        if (method === 'GET') {
             return id ? collection.find(item => item.id === id) || null : collection;
        }
        
        if (method === 'POST') {
             const newId = generateMockId(entityName.slice(0, 1).toUpperCase());
             const newItem = { ...data, id: newId };
             collection.push(newItem);
             return newItem;
        }

        const index = collection.findIndex(item => item.id === id);
        if (index === -1) {
             throw new Error(`MOCK 404: No encontrado.`);
        }

        if (method === 'PUT') {
            MOCKED_DB[entityName][index] = { ...collection[index], ...data, id };
            return MOCKED_DB[entityName][index];
        }
        
        if (method === 'DELETE') {
            collection.splice(index, 1);
            return { success: true };
        }

        throw new Error(`MOCK: Método ${method} no soportado.`);
    }

    async #executeRequest(method, entityName, id = null, data = null, queryParams = null, isFormData = false) {
        if (CONFIG.USE_MOCK_DATA) {
            return await this.#mockDataFetch(method, entityName, id, data);
        } else {
            let url = `${this.baseURL}/${entityName}${id ? '/' + id : ''}`;
            
            if (queryParams) {
                const searchParams = new URLSearchParams(queryParams);
                url += `?${searchParams.toString()}`;
            }

            // 🎯 SI ES FORMDATA: Mandamos el objeto 'data' directo, sin JSON.stringify
            const options = {
                method: method,
                isMultipart: isFormData,
                body: isFormData ? data : (data ? JSON.stringify(data) : null),
            };

            return await this.#realApiFetch(method, url, options);
        }
    }

    // --- MÉTODOS PÚBLICOS ---
    async get(entityName, idOrParams = null) {
        if (typeof idOrParams === 'object' && idOrParams !== null) {
            return await this.#executeRequest('GET', entityName, null, null, idOrParams);
        }
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
} // <--- ESTE CIERRE DE CLASE ES CRÍTICO

export const ApiService = new BaseApiService();