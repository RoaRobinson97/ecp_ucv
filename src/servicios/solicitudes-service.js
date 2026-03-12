import { ApiService } from './BaseApiService';
import { CONFIG } from '../config/config';

/** @typedef {import('@/data/types').Solicitud} Solicitud */

class SolicitudesService {

    /**
     * Obtiene todas las solicitudes con paginación y adaptación de datos.
     * @param {{ page?: number, limit?: number }} [options={}]
     */
    async getAllSolicitudes({ page = 1, limit = 10 } = {}) {
        try {
            // --- MODO MOCK ---
            if (CONFIG.USE_MOCK_DATA) {
                const all = await ApiService.get('solicitudes') || [];
                const total = all.length;
                const totalPages = Math.ceil(total / limit) || 1;
                const start = (page - 1) * limit;
                const end = start + limit;
                
                return { 
                    solicitudes: all.slice(start, end), 
                    totalPages, 
                    totalSolicitudes: total 
                };
            }

            // --- MODO REAL ---
            try {
                const response = await ApiService.get('solicitudes', { page, limit });
                
                let rawData = [];
                let totalCount = 0;

                // Normalización de la respuesta del servidor
                if (response.data && Array.isArray(response.data)) {
                    rawData = response.data;
                    totalCount = response.total || response.data.length;
                } else if (Array.isArray(response)) {
                    rawData = response;
                    totalCount = response.length;
                }

                // MAPEO / ADAPTACIÓN DE DATOS
                const adapted = rawData.map(s => this._adaptSolicitud(s));

                return {
                    solicitudes: adapted,
                    totalPages: Math.ceil(totalCount / limit) || 1,
                    totalSolicitudes: totalCount
                };

            } catch (apiError) {
                console.warn("⚠️ Fallo al conectar con el backend de solicitudes.");
                return { solicitudes: [], totalPages: 0, totalSolicitudes: 0 };
            }

        } catch (error) {
            console.error("Error crítico en SolicitudesService.getAllSolicitudes:", error);
            throw error;
        }
    }

    /**
     * Obtiene una solicitud por su ID.
     * @param {string} id
     */
    async getSolicitudById(id) {
        try {
            if (CONFIG.USE_MOCK_DATA) {
                return await ApiService.get('solicitudes', id);
            }

            const raw = await ApiService.get('solicitudes', id);
            return raw ? this._adaptSolicitud(raw) : null;
        } catch (error) {
            console.error(`Error en SolicitudesService.getSolicitudById(${id}):`, error);
            throw error;
        }
    }

    /**
     * Crea una nueva solicitud soportando JSON y FormData (archivos)
     * @param {Object | FormData} data - Los datos a enviar
     */
    async createSolicitud(data) {
        try {
            // 1. Verificamos si la data es un FormData (viene de un formulario con archivos)
            const isFormData = data instanceof FormData;

            // --- MODO MOCK ---
            if (CONFIG.USE_MOCK_DATA) {
                if (isFormData) {
                    // Para el Mock DB, convertimos el FormData a un JSON falso para que no explote
                    const mockPayload = {};
                    data.forEach((value, key) => {
                        // Si es un archivo, solo guardamos el nombre para simular
                        mockPayload[key] = value instanceof File ? `[Archivo: ${value.name}]` : value;
                    });
                    
                    const nuevaSolicitudMock = {
                        user_id: data.get('userId'),
                        tipo: data.get('tipo'),
                        estado: data.get('estado') || 'pendiente',
                        payload: mockPayload, 
                        fecha_creacion: new Date().toISOString()
                    };
                    console.log("[MOCK] Creando solicitud (con archivos):", nuevaSolicitudMock);
                    return await ApiService.post('solicitudes', nuevaSolicitudMock);
                } else {
                    // Mock normal (JSON)
                    const nuevaSolicitud = {
                        user_id: data.userId || data.user_id,
                        tipo: data.tipo,
                        estado: data.estado || 'pendiente',
                        payload: data.payload,
                        fecha_creacion: new Date().toISOString()
                    };
                    console.log("[MOCK] Creando solicitud (JSON):", nuevaSolicitud);
                    return await ApiService.post('solicitudes', nuevaSolicitud);
                }
            }

            // --- MODO REAL (PRODUCCIÓN) ---
            if (isFormData) {
                // Le inyectamos la fecha de creación directamente al FormData
                data.append('fecha_creacion', new Date().toISOString());
                
                // Le pasamos 'true' como tercer parámetro a ApiService
                // para que no le ponga Content-Type: application/json
                return await ApiService.post('solicitudes', data, true);
            } else {
                // Petición JSON normal
                const nuevaSolicitud = {
                    user_id: data.userId || data.user_id,
                    tipo: data.tipo,
                    estado: data.estado || 'pendiente',
                    payload: data.payload,
                    fecha_creacion: new Date().toISOString()
                };
                return await ApiService.post('solicitudes', nuevaSolicitud);
            }
            
        } catch (error) {
            console.error("Error al crear solicitud:", error);
            throw error;
        }
    }

    /**
     * Actualiza el estado de la solicitud.
     * @param {string} id - El ID de la solicitud
     * @param {string} nuevoEstado - 'aprobada' | 'rechazada' | 'remitida'
     * @param {string | null} motivo - Motivo opcional
     */
    async updateStatus(id, nuevoEstado, motivo = null) {
        try {
            const updateData = {
                estado: nuevoEstado, 
                motivo_rechazo: motivo, 
                fecha_actualizacion: new Date().toISOString()
            };

            // ✨ CORRECCIÓN: Era ApiService.put, NO ApiService.update
            return await ApiService.put('solicitudes', id, updateData);
        } catch (error) {
            console.error("Error al actualizar estado de solicitud:", error);
            throw error;
        }
    }

    /**
     * Actualiza el estado de la solicitud enviando FormData (para archivos)
     * @param {string} id - El ID de la solicitud
     * @param {FormData} formData - Los datos incluyendo el archivo PDF
     */
    async updateStatusWithFile(id, formData) {
        try {
            // --- MODO MOCK ---
            if (CONFIG.USE_MOCK_DATA) {
                const estado = formData.get('estado');
                const updateData = {
                    estado: estado,
                    fecha_actualizacion: new Date().toISOString()
                };
                console.log("[MOCK] Archivo de evaluación recibido:", formData.get('archivo_evaluacion')?.name);
                return await ApiService.put('solicitudes', id, updateData);
            }

            return await ApiService.put('solicitudes', id, formData, true);
        } catch (error) {
            console.error("Error al actualizar estado con archivo:", error);
            throw error;
        }
    }

    /**
     * Método privado para normalizar los datos que vienen del backend
     * @private
     */
    _adaptSolicitud(s) {
        return {
            id: String(s.id),
            user_id: s.user_id || s.userId, 
            tipo: s.tipo,
            estado: s.estado || s.status,
            fecha_creacion: s.fecha_creacion || s.fechaCreacion || s.created_at,
            fecha_actualizacion: s.fecha_actualizacion || s.fecha_actualizacion, 
            motivo_rechazo: s.motivo_rechazo || s.motivo_rechazo, 
            payload: s.payload || {}
        };
    }
}



export const solicitudesService = new SolicitudesService();