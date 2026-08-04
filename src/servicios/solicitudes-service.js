import { ApiService } from './BaseApiService';
import { CONFIG } from '../config/config';

/** @typedef {import('@/data/types').Solicitud} Solicitud */

class SolicitudesService {

    /**
     * Obtiene todas las solicitudes con paginación y adaptación de datos.
     * @param {{ page?: number, limit?: number, status?: string }} [options={}]
     */
    async getAllSolicitudes({ page = 1, limit = 100, status = 'under_review' } = {}) {
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
            // ✨ CORRECCIÓN: Le devolvemos la variable 'status' para que pida los 'under_review'
           const [providersRes, coursesRes, closuresRes] = await Promise.allSettled([
                ApiService.get('admin/providers', { type: 'courses', status }), 
                // ✨ CORRECCIÓN CRUCIAL BASADA EN TU POSTMAN:
                ApiService.get('admin/course-requests', { faculty: 'Ingeniería', page: page }),
                ApiService.get('admin/closures/requests', { status })   
            ]);

            let rawData = [];

            // 1. Extraer y normalizar solicitudes de Proveedores
            if (providersRes.status === 'fulfilled' && providersRes.value?.proveedores) {
                const provs = providersRes.value.proveedores.map(p => ({
                    id: String(p.id),
                    user_id: String(p.usuario_id), 
                    tipo: 'codigo-proveedor',
                    estado: p.estado === 'under_review' ? 'pendiente' : (p.estado || 'pendiente'),
                    fecha_creacion: new Date().toISOString(), 
                    payload: {
                        nombre_proveedor: p.nombre_proveedor,
                        biografia: p.biografia,
                        codigo_proveedor: p.codigo_proveedor,
                        archivos: p.archivos,
                        interno: p.interno
                    }
                }));
                rawData = rawData.concat(provs);
            }

            // 2. Extraer y normalizar solicitudes de Cursos (✨ Actualizado a 'solicitudes' que manda Go)
            if (coursesRes.status === 'fulfilled' && coursesRes.value?.solicitudes) {
                const courses = coursesRes.value.solicitudes.map(c => ({
                    id: String(c.id),
                    user_id: String(c.usuario_id || c.user_id || '0'), 
                    tipo: c.tipo_curso || 'formulacion-curso-directa', // Si Go especifica el tipo, lo usa, si no, usa directa
                    estado: c.estado === 'under_review' ? 'pendiente' : (c.estado || 'pendiente'),
                    fecha_creacion: c.creado_en || new Date().toISOString(),
                    payload: {
                        ...c,
                        titulo: c.nombre || c.titulo, 
                    } 
                }));
                rawData = rawData.concat(courses);
            }

            // 3. Extraer y normalizar solicitudes de Cierre de Cohorte
            if (closuresRes.status === 'fulfilled' && closuresRes.value?.cierres) {
                const closures = closuresRes.value.cierres.map(c => ({
                    id: String(c.id),
                    user_id: String(c.usuario_id || c.user_id),
                    tipo: 'cierre-cohorte',
                    estado: c.estado === 'under_review' ? 'pendiente' : (c.estado || 'pendiente'),
                    fecha_creacion: c.fecha || new Date().toISOString(),
                    payload: c 
                }));
                rawData = rawData.concat(closures);
            }
            // Ordenamos por ID de mayor a menor
            rawData.sort((a, b) => Number(b.id) - Number(a.id));

            return {
                solicitudes: rawData, 
                totalPages: 1, 
                totalSolicitudes: rawData.length
            };

        } catch (error) {
            console.error("Error crítico en SolicitudesService.getAllSolicitudes:", error);
            throw error;
        }
    }

    async getSolicitudById(id) {
        try {
            if (CONFIG.USE_MOCK_DATA) {
                return await ApiService.get('solicitudes', id);
            }

            // 1. Intentamos buscar en proveedores primero
            try {
                // ✨ CORRECCIÓN: Le pasamos 'status' y 'type' por si Go los necesita para encontrarlo
                const provReq = await ApiService.get(`providers/${id}`, { 
                    status: 'under_review', 
                    type: 'courses' 
                });
                
                const data = provReq.proveedor || provReq;

                if (data && data.id) {
                    data.tipo_inyectado = 'codigo-proveedor';
                    return this._adaptSolicitud(data);
                }
            } catch (e) { 
                console.log(`❌ Falló buscar proveedor ID ${id}:`, e.message); 
            }

            // 2. Si no era proveedor, intentamos en cursos
            try {
                // Hacemos lo mismo para cursos por si acaso
                const courseReq = await ApiService.get(`courses/${id}`, { 
                    status: 'under_review' 
                });
                
                const data = courseReq.curso || courseReq;

                if (data && data.id) {
                    data.tipo_inyectado = 'formulacion-curso-directa';
                    return this._adaptSolicitud(data);
                }
            } catch (e) { 
                console.log(`❌ Falló buscar curso ID ${id}:`, e.message);
            }

            return null;
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
            const isFormData = data instanceof FormData;
            // Extraemos el tipo de la solicitud para saber a qué endpoint apuntar
            const tipoSolicitud = isFormData ? data.get('tipo') : data.tipo;

            // --- MODO MOCK ---
            if (CONFIG.USE_MOCK_DATA) {
                return { success: true }; 
            }

            // --- MODO REAL (PRODUCCIÓN) ---
            switch (tipoSolicitud) {
                
                // 1. RUTA: CREACIÓN DE PROVEEDORES
                case 'codigo-proveedor': {
                    if (!isFormData) throw new Error("Los proveedores exigen enviar archivos (FormData)");
                    
                    const goFormData = new FormData();
                    
                    // Textos
                    goFormData.append('userId', data.get('userId'));
                    goFormData.append('tipo_proveedor', 'courses'); 
                    
                    const tipoPersona = data.get('tipo_persona') === 'juridica' ? 'juridical' : 'natural';
                    goFormData.append('tipo_persona', tipoPersona);
                    goFormData.append('tipo_lucro', 'no_lucrativo'); 
                    goFormData.append('nombre', data.get('nombre_proveedor')); 
                    goFormData.append('bio', data.get('biografia'));          
                    goFormData.append('es_interno', data.get('es_interno'));   

                    // Archivos
                    if (data.has('avatar')) goFormData.append('logo', data.get('avatar'));
                    if (data.has('cedula')) goFormData.append('ci', data.get('cedula')); 
                    if (data.has('rif')) goFormData.append('rif', data.get('rif'));
                    if (data.has('islr')) goFormData.append('islr', data.get('islr'));
                    if (data.has('curriculum')) goFormData.append('resumes', data.get('curriculum'));
                    if (data.has('registro_mercantil')) goFormData.append('others', data.get('registro_mercantil'));
                    if (data.has('titulo')) goFormData.append('others', data.get('titulo'));
                    
                    return await ApiService.post('providers', goFormData, true);
                }

                // 2. RUTA: CREACIÓN DE CURSOS
                case 'formulacion-curso-directa':
                case 'formulacion-curso-indirecta': {
                    if (isFormData) {
                        return await ApiService.post('courses', data, true);
                    } else {
                        return await ApiService.post('courses', data);
                    }
                }

                // 3. RUTA: CIERRE DE COHORTE
                case 'cierre-cohorte': {
                    if (!isFormData) throw new Error("El cierre de cohorte requiere subir archivos (Notas, Vouchers)");
                    return await ApiService.post('course-cycle-closures', data, true);
                }

                // FALLBACK DE SEGURIDAD
                default: {
                    if (isFormData) {
                        console.warn(`Enviando FormData a /solicitudes genérico para el tipo: ${tipoSolicitud}`);
                        return await ApiService.post('solicitudes', data, true);
                    } else {
                        const nuevaSolicitud = {
                            user_id: data.userId || data.user_id,
                            tipo: tipoSolicitud,
                            estado: data.estado || 'pendiente',
                            payload: data.payload,
                            fecha_creacion: new Date().toISOString()
                        };
                        return await ApiService.post('solicitudes', nuevaSolicitud);
                    }
                }
            }
            
        } catch (error) {
            console.error(`Error al crear solicitud tipo ${data instanceof FormData ? data.get('tipo') : data?.tipo}:`, error);
            throw error;
        }
    }

    /**
     * Actualiza el estado de la solicitud consumiendo las rutas reales de Go.
     * @param {string} id - El ID de la solicitud
     * @param {string} tipo - 'codigo-proveedor' o 'formulacion-curso...' 
     * @param {string} nuevoEstado - 'aprobada' | 'rechazada' | 'remitida'
     * @param {string | null} motivo - Motivo opcional
     */
    async updateStatus(id, tipo, nuevoEstado, motivo = null) {
        try {
            if (CONFIG.USE_MOCK_DATA) {
                const updateData = {
                    estado: nuevoEstado, 
                    motivo_rechazo: motivo, 
                    fecha_actualizacion: new Date().toISOString()
                };
                return await ApiService.put('solicitudes', id, updateData);
            }

            // --- MODO REAL ---
            const action = nuevoEstado === 'aprobada' ? 'approve' : 'reject';
            const payload = { observaciones: motivo || "" };
            
            let basePath = '';
            if (tipo === 'codigo-proveedor') {
                basePath = 'provider-requests';
            } else if (tipo?.includes('curso')) {
                basePath = 'course-requests';
                payload.tipo_curso = "unassigned"; 
            } else if (tipo === 'cierre-cohorte') {
                basePath = 'course-cycle-closures';
            } else {
                throw new Error("No se puede determinar la ruta del backend para el tipo: " + tipo);
            }

            return await ApiService.post(`${basePath}/${id}/${action}`, payload);

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
            if (CONFIG.USE_MOCK_DATA) {
                const estado = formData.get('estado');
                const updateData = {
                    estado: estado,
                    fecha_actualizacion: new Date().toISOString()
                };
                return await ApiService.put('solicitudes', id, updateData);
            }

            // --- MODO REAL ---
            const tipo = formData.get('tipo_inyectado') || formData.get('tipo');
            const nuevoEstado = formData.get('estado');
            const action = nuevoEstado === 'aprobada' ? 'approve' : 'reject';
            
            let basePath = '';
            if (tipo === 'codigo-proveedor') {
                basePath = 'provider-requests';
            } else if (tipo?.includes('curso')) {
                basePath = 'course-requests';
                formData.append('tipo_curso', 'unassigned');
            } else if (tipo === 'cierre-cohorte') {
                basePath = 'course-cycle-closures';
            } else {
                throw new Error("No se puede determinar la ruta del backend para el tipo: " + tipo);
            }

            return await ApiService.post(`${basePath}/${id}/${action}`, formData, true);
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
        const tipoReal = s.tipo_inyectado || s.tipo || 'formulacion-curso-directa'; 
        
        // Normalizamos el estado a minúsculas para que no falle nunca
        const rawEstado = String(s.estado || s.status || 'pendiente').toLowerCase();
        let estadoReal = 'pendiente';
        if (rawEstado === 'under_review' || rawEstado === 'pendiente') estadoReal = 'pendiente';
        if (rawEstado === 'approved' || rawEstado === 'aprobada') estadoReal = 'aprobada';
        if (rawEstado === 'rejected' || rawEstado === 'rechazada') estadoReal = 'rechazada';

        const cursoData = s.curso || {};

        return {
            id: String(s.id),
            // Si el backend no lo manda, le ponemos '1' (o el ID que corresponda) para que no muestre 0
            user_id: String(s.usuario_id || s.user_id || cursoData.usuario_id || '1'), 
            tipo: tipoReal,
            estado: estadoReal,
            fecha_creacion: s.creado_en || s.created_at || new Date().toISOString(),
            fecha_actualizacion: s.actualizado_en || s.updated_at, 
            motivo_rechazo: s.comentarios || s.motivo_rechazo, 
            
            payload: {
                ...cursoData,
                ...s,
                titulo: cursoData.nombre || s.nombre || s.titulo || 'No especificado',
                proposito: cursoData.objetivos || s.objetivos || s.proposito || 'No especificado',
                duracion: cursoData.duracion || s.duracion || 'No especificado',
                fundamentacion: cursoData.descripcion || s.descripcion || s.fundamentacion || 'No especificado',
                archivo_proyecto_url: cursoData.ubicacion || s.ubicacion || null
            }
        };
    }
}

export const solicitudesService = new SolicitudesService();