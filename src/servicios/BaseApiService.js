// /src/data/base-api-service.js

import { CONFIG } from '../config/config';          // Configuración global (ej: USE_MOCK_DATA, API_URL)
import { MOCKED_DB, generateMockId } from '../data/mock-data'; // Datos simulados y lógica de ID

class BaseApiService {
    constructor() {
        this.baseURL = CONFIG.API_URL;
    }

    async #realApiFetch(method, url, options) {
        console.log(`REAL API: [${method}] ${url}`);
        
        try {
            const response = await fetch(url, options);

            if (!response.ok) {

                const errorBody = await response.json().catch(() => ({ message: response.statusText }));
                const errorMessage = errorBody.message || `Error ${response.status}: ${response.statusText}`;
                
                throw new Error(errorMessage);
            }
            
            if (response.status === 204) {
                return { success: true, message: "Operación exitosa sin contenido." };
            }

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


    async #executeRequest(method, entityName, id = null, data = null) {
        if (CONFIG.USE_MOCK_DATA) {
            return await this.#mockDataFetch(method, entityName, id, data);
        } else {
            const url = `${this.baseURL}/${entityName}${id ? '/' + id : ''}`;
            const options = {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: data ? JSON.stringify(data) : null,
            };
            return await this.#realApiFetch(method, url, options);
        }
    }

    // --- MÉTODOS PÚBLICOS (El Contrato) ---
    async get(entityName, id = null) {
        return await this.#executeRequest('GET', entityName, id);
    }
    
    async post(entityName, data) {
        return await this.#executeRequest('POST', entityName, null, data);
    }

    async put(entityName, id, data) {
        return await this.#executeRequest('PUT', entityName, id, data);
    }
    
    async delete(entityName, id) {
        return await this.#executeRequest('DELETE', entityName, id);
    }
}

// Exportamos una única instancia (Singleton) para toda la aplicación
export const ApiService = new BaseApiService();