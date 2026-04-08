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
            // Llamamos a los endpoints reales en paralelo
            const [providersRes, coursesRes] = await Promise.allSettled([
                ApiService.get('provider-requests', { page, pageSize: limit }),
                ApiService.get('course-requests', { page, pageSize: limit })
            ]);

            let rawData = [];

            // Extraer y normalizar solicitudes de Proveedores
            if (providersRes.status === 'fulfilled' && providersRes.value?.solicitudes) {
                const provs = providersRes.value.solicitudes.map(s => ({
                    ...s,
                    tipo_inyectado: 'codigo-proveedor' // Ayuda al frontend a saber qué es
                }));
                rawData = rawData.concat(provs);
            }

            // Extraer y normalizar solicitudes de Cursos
            if (coursesRes.status === 'fulfilled' && coursesRes.value?.solicitudes) {
                const courses = coursesRes.value.solicitudes.map(s => ({
                    ...s,
                    tipo_inyectado: 'formulacion-curso-directa' 
                }));
                rawData = rawData.concat(courses);
            }

            // Ordenamos por fecha de creación (las más nuevas primero)
            rawData.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));

            // MAPEO / ADAPTACIÓN DE DATOS
            const adapted = rawData.map(s => this._adaptSolicitud(s));

            return {
                solicitudes: adapted,
                totalPages: 1, // Nota: Paginación combinada real requiere lógica extra en frontend
                totalSolicitudes: adapted.length
            };

        } catch (error) {
            console.error("Error crítico en SolicitudesService.getAllSolicitudes:", error);
            throw error;
        }
    }

    /**
     * Obtiene una solicitud por su ID. 
     * En el modo real, como no sabemos de qué tabla es solo con el ID, buscamos en ambas.
     * @param {string} id
     */
    async getSolicitudById(id) {
        try {
            if (CONFIG.USE_MOCK_DATA) {
                return await ApiService.get('solicitudes', id);
            }

            // Intentamos buscar en proveedores primero
            try {
                const provReq = await ApiService.get(`provider-requests/${id}`);
                if (provReq && provReq.id) {
                    provReq.tipo_inyectado = 'codigo-proveedor';
                    return this._adaptSolicitud(provReq);
                }
            } catch (e) { /* Si falla (404), ignoramos y probamos con cursos */ }

            // Si no era proveedor, intentamos en cursos
            try {
                const courseReq = await ApiService.get(`course-requests/${id}`);
                if (courseReq && courseReq.id) {
                    courseReq.tipo_inyectado = 'formulacion-curso-directa';
                    return this._adaptSolicitud(courseReq);
                }
            } catch (e) { /* Si falla, no existe */ }

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
                    
                    // ✨ ESTO ES LO QUE ESTABA FALLANDO. FÓRZALO AQUÍ.
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
                    console.log('el form data para proveedores', goFormData)
                    const debugData = Object.fromEntries(goFormData.entries());
                    console.log("¿Está vacío de verdad?", debugData);
                    return await ApiService.post('providers', goFormData, true);
                }

                // 2. RUTA: CREACIÓN DE CURSOS
                case 'formulacion-curso-directa':
                case 'formulacion-curso-indirecta': {
                    // Aquí envías la data al endpoint de cursos de Go. 
                    // Nota: Si Go espera llaves diferentes, tendrás que hacer un mapeo igual al de proveedores.
                    if (isFormData) {
                        return await ApiService.post('courses', data, true);
                    } else {
                        return await ApiService.post('courses', data);
                    }
                }

                // 3. RUTA: CIERRE DE COHORTE
                case 'cierre-cohorte': {
                    if (!isFormData) throw new Error("El cierre de cohorte requiere subir archivos (Notas, Vouchers)");
                    
                    // Asumiendo que el dev de Go crea una ruta específica para esto.
                    // Ej: POST /course-cycles/closure-requests
                    return await ApiService.post('course-cycle-closures', data, true);
                }

                // FALLBACK DE SEGURIDAD
                default: {
                    // Si mandas un tipo de solicitud que no está en el switch, hacemos una petición genérica
                    // (Aunque lo ideal es que todos los tipos pasen por su propia ruta).
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
     * @param {string} tipo - 'codigo-proveedor' o 'formulacion-curso...' (CRÍTICO AHORA)
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
                payload.tipo_curso = "unassigned"; // Requisito de tu struct de Go para aprobar cursos
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

            // Nota: Si el backend real exige subir archivos en la aprobación, 
            // tendrás que mapear este FormData al endpoint POST adecuado igual que en updateStatus.
            console.warn("updateStatusWithFile en MODO REAL no está adaptado a las rutas de Go todavía.");
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
        // En modo mock, s.tipo ya viene bien. En modo real, usamos el inyectado.
        const tipoReal = s.tipo_inyectado || s.tipo; 
        
        // Mapeo del estado de Go al estado de tu Frontend
        let estadoReal = s.estado || s.status || 'pendiente';
        if (estadoReal === 'under_review') estadoReal = 'pendiente';
        if (estadoReal === 'approved') estadoReal = 'aprobada';
        if (estadoReal === 'rejected') estadoReal = 'rechazada';

        return {
            id: String(s.id),
            user_id: s.proveedor?.user_id || s.curso?.user_id || s.user_id || s.userId, 
            tipo: tipoReal,
            estado: estadoReal,
            fecha_creacion: s.creado_en || s.fecha_creacion || s.fechaCreacion || s.created_at,
            fecha_actualizacion: s.actualizado_en || s.fecha_actualizacion || s.updated_at, 
            motivo_rechazo: s.comentarios || s.motivo_rechazo, 
            payload: s.proveedor || s.curso || s.payload || {}
        };
    }
}

export const solicitudesService = new SolicitudesService();