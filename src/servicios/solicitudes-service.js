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

                // ✨ MAPEO / ADAPTACIÓN DE DATOS ✨
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
     * Actualiza el estado de la solicitud.
     */
    async updateStatus(id, nuevoEstado, motivo = null) {
        try {
            const updateData = {
                estado: nuevoEstado, // 'aprobada' | 'rechazada'
                motivo_rechazo: motivo, // Snake_case para el backend
                fecha_actualizacion: new Date().toISOString()
            };

            if (CONFIG.USE_MOCK_DATA) {
                // Adaptamos para el mock si usa camelCase
                return await ApiService.update('solicitudes', id, {
                    estado: nuevoEstado,
                    motivoRechazo: motivo,
                    fechaActualizacion: updateData.fecha_actualizacion
                });
            }

            return await ApiService.update('solicitudes', id, updateData);
        } catch (error) {
            console.error("Error al actualizar estado de solicitud:", error);
            throw error;
        }
    }

    /**
     * Método privado para normalizar los datos que vienen del backend (Snake_case -> camelCase)
     * @private
     */
    _adaptSolicitud(s) {
        return {
            id: String(s.id),
            userId: s.user_id || s.userId,
            tipo: s.tipo,
            estado: s.estado || s.status,
            fechaCreacion: s.fecha_creacion || s.fechaCreacion || s.created_at,
            fechaActualizacion: s.fecha_actualizacion || s.fechaActualizacion,
            motivoRechazo: s.motivo_rechazo || s.motivoRechazo,
            // El payload se suele dejar como any/objeto plano
            payload: s.payload || {}
        };
    }
}

export const solicitudesService = new SolicitudesService();