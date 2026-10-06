import { ApiService } from './BaseApiService';
import { CONFIG } from '../config/config';
import { providerToLegacy, requestStatusToLegacy, courseToLegacy, formulationType } from './adapters';

// En Go cada tipo de solicitud tiene su propia tabla e IDs, así que el ID que ve la UI lleva el
// tipo como prefijo: "prov-5", "curso-3", "cierre-7".
const ID_PREFIX = { 'codigo-proveedor': 'prov', curso: 'curso', 'cierre-cohorte': 'cierre' };

function prefixedId(tipo, id) {
    const key = tipo === 'codigo-proveedor' || tipo === 'cierre-cohorte' ? tipo : 'curso';
    return `${ID_PREFIX[key]}-${id}`;
}

function parseId(id) {
    const [prefix, ...rest] = String(id).split('-');
    return { prefix, rawId: rest.join('-') || prefix };
}

function providerToSolicitud(p) {
    const legacy = providerToLegacy(p);
    return {
        id: prefixedId('codigo-proveedor', p.id),
        user_id: String(p.usuario_id),
        tipo: 'codigo-proveedor',
        estado: p.estado === 'under_review' ? 'pendiente' : legacy.estado,
        fecha_creacion: p.creado_en || new Date().toISOString(),
        payload: {
            ...legacy,
            nombre_proveedor: p.nombre_proveedor,
            biografia: p.biografia,
            codigo_proveedor: p.codigo_proveedor,
            interno: p.interno,
        }
    };
}

function courseRequestToSolicitud(r) {
    const curso = r.curso ? courseToLegacy({ ...r.curso, usuario_id: r.usuario_id }) : {};
    return {
        id: prefixedId('curso', r.id),
        user_id: String(r.usuario_id || '0'),
        tipo: formulationType(r.curso),
        estado: requestStatusToLegacy(r.estado),
        fecha_creacion: r.creado_en || new Date().toISOString(),
        fecha_actualizacion: r.actualizado_en,
        motivo_rechazo: r.comentarios,
        payload: {
            ...curso,
            ...r,
            titulo: curso.titulo,
            // Mientras la solicitud no esté aprobada, el curso sigue en revisión.
            estado_gestion: r.estado === 'approved' ? curso.estado_gestion : 'under_review',
            calificacion: r.calificacion,
            clasificacion: r.clasificacion,
            archivo_evaluacion_url: r.archivo_evaluacion_url,
        }
    };
}

function closeRequestToSolicitud(c) {
    return {
        id: prefixedId('cierre-cohorte', c.id),
        user_id: String(c.enviado_por_id),
        tipo: 'cierre-cohorte',
        estado: requestStatusToLegacy(c.estado),
        fecha_creacion: c.creado_en || new Date().toISOString(),
        payload: {
            ...c,
            titulo_curso: c.curso?.nombre,
            nombre_cohorte: c.nombre_cohorte,
            observaciones: c.observaciones,
            archivos: c.archivos || {},
        }
    };
}

/** @typedef {import('@/data/types').Solicitud} Solicitud */

class SolicitudesService {

    async getAllSolicitudes({ page = 1, limit = 100, status = 'under_review', coordinador_id } = {}) {
        try {
            if (CONFIG.USE_MOCK_DATA) {
                const all = await ApiService.get('solicitudes') || [];
                const total = all.length;
                const totalPages = Math.ceil(total / limit) || 1;
                const start = (page - 1) * limit;
                const end = start + limit;
                return { solicitudes: all.slice(start, end), totalPages, totalSolicitudes: total };
            }

            const timestamp = Date.now();
            // Mandamos el status tal cual viene
            const paramsAdminProviders = { type: 'courses', status, _t: timestamp };
            const paramsAdminCourses = { status, page, _t: timestamp };
            const paramsAdminClosures = { estado: status, _t: timestamp };
            
            // ✨ FIX: Evitamos mandar la palabra "undefined" a la API
            if (coordinador_id && coordinador_id !== 'undefined') {
                paramsAdminProviders.coordinador_id = coordinador_id;
                paramsAdminCourses.coordinador_id = coordinador_id;
                paramsAdminClosures.coordinador_id = coordinador_id;
            }

            const [providersRes, coursesRes, closuresRes] = await Promise.allSettled([
                ApiService.get('admin/providers', { type: 'courses', status, per_page: 100 }),
                ApiService.get('admin/course-requests', { pageSize: 100 }),
                ApiService.get('admin/course-cycle-close-requests', { per_page: 100 })
            ]); 
            
            let rawData = [];

            // 1. PROVEEDORES
            if (providersRes.status === 'fulfilled') {
                rawData = rawData.concat((providersRes.value?.proveedores || []).map(providerToSolicitud));
            }

            // 2. CURSOS: en revisión, o aprobados que aún no tienen contrato (pendientes de documentos legales)
            if (coursesRes.status === 'fulfilled') {
                const courses = (coursesRes.value?.solicitudes || []).filter(r =>
                    r.estado === 'under_review' || (r.estado === 'approved' && !r.curso?.tiene_documentacion_legal)
                );
                rawData = rawData.concat(courses.map(courseRequestToSolicitud));
            }

            // 3. CIERRES DE COHORTE
            if (closuresRes.status === 'fulfilled') {
                const closures = (closuresRes.value?.solicitudes || []).filter(c => c.estado === status);
                rawData = rawData.concat(closures.map(closeRequestToSolicitud));
            }
            
            rawData.sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime());

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

            const { prefix, rawId } = parseId(id);
            try {
                if (prefix === 'prov') {
                    return providerToSolicitud(await ApiService.get('providers', rawId));
                }
                if (prefix === 'curso') {
                    return courseRequestToSolicitud(await ApiService.get('admin/course-requests', rawId));
                }
                if (prefix === 'cierre') {
                    return closeRequestToSolicitud(await ApiService.get('admin/course-cycle-close-requests', rawId));
                }
            } catch (e) {
                console.warn(`Solicitud ${id} no encontrada:`, e);
            }
            return null;
        } catch (error) {
            console.error(`Error crítico en SolicitudesService.getSolicitudById(${id}):`, error);
            throw error;
        }
    }
    
    async createSolicitud(data) {
        try {
            const isFormData = data instanceof FormData;
            const tipoSolicitud = isFormData ? data.get('tipo') : data.tipo;

            if (CONFIG.USE_MOCK_DATA) {
                return { success: true }; 
            }

            switch (tipoSolicitud) {
                case 'codigo-proveedor': {
                    if (!isFormData) throw new Error("Los proveedores exigen enviar archivos (FormData)");
                    const goFormData = new FormData();
                    
                    goFormData.append('tipo_proveedor', 'courses'); 
                    
                    const tipoPersona = data.get('tipo_persona') === 'juridica' ? 'juridica' : 'natural';
                    goFormData.append('tipo_persona', tipoPersona);
                    goFormData.append('tipo_lucro', data.get('tipo_lucro') || 'no_lucrativo');
                    goFormData.append('nombre', data.get('nombre_proveedor')); 
                    goFormData.append('bio', data.get('biografia'));          
                    goFormData.append('es_interno', data.get('es_interno'));   
                    // El selector de "coordinador" trae la facultad a la que se dirige la solicitud.
                    goFormData.append('facultad', data.get('coordinador_id')); 

                    if (data.has('avatar')) goFormData.append('logo', data.get('avatar'));
                    if (data.has('cedula')) goFormData.append('ci', data.get('cedula')); 
                    if (data.has('rif')) goFormData.append('rif', data.get('rif'));
                    if (data.has('islr')) goFormData.append('islr', data.get('islr'));
                    if (data.has('curriculum')) goFormData.append('resumes', data.get('curriculum'));
                    // Go no tiene campos propios para el título ni el registro mercantil: van como "otros".
                    if (data.has('titulo')) goFormData.append('others', data.get('titulo'));
                    if (data.has('registro_mercantil')) goFormData.append('others', data.get('registro_mercantil'));
                    
                    return await ApiService.post('providers', goFormData, true);
                }
                
                case 'formulacion-curso-directa':
                case 'formulacion-curso-indirecta': {
                    return await ApiService.post('courses', this._courseFormData(data, isFormData), true);
                }

                case 'cierre-cohorte': {
                    if (!isFormData) throw new Error("El cierre de cohorte requiere subir archivos");
                    return await ApiService.post('course-cycle-closures', data, true);
                }

                default: {
                    if (isFormData) {
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
            console.error(`Error al crear solicitud:`, error);
            throw error;
        }
    }

    async updateStatus(id, tipo, nuevoEstado, motivo = null, extraData = {}) {
        try {
            const { rawId } = parseId(id);
            const isApproval = nuevoEstado === 'aprobada';

            if (tipo === 'cierre-cohorte') {
                // Aprobar cierra las cohortes del curso y encola los certificados.
                const action = isApproval ? 'approve' : 'reject';
                return await ApiService.post(`admin/course-cycle-close-requests/${rawId}/${action}`, { observaciones: motivo || '' });
            }

            if (tipo === 'codigo-proveedor') {
                // Aprobar asciende al usuario a proveedor (course_admin) en el backend.
                const action = isApproval ? 'approve' : 'reject';
                return await ApiService.post(`admin/providers/${rawId}/${action}`, { observaciones: motivo || '' });
            }

            if (tipo?.includes('curso') || tipo?.includes('directa') || tipo?.includes('indirecta')) {
                if (nuevoEstado === 'under_review' && extraData.coordinador_id) {
                    // Remitir: el ID del "coordinador" elegido es la facultad destino.
                    return await ApiService.post(`admin/course-requests/${rawId}/redirect`, {
                        facultad: extraData.coordinador_id,
                        motivo: motivo || 'Remitido',
                    });
                }
                if (isApproval) {
                    return await ApiService.post(`admin/course-requests/${rawId}/approve`, {
                        observaciones: motivo || '',
                        clasificacion: extraData.clasificacion || '',
                    });
                }
                return await ApiService.post(`admin/course-requests/${rawId}/reject`, { observaciones: motivo || '' });
            }

            throw new Error("No se puede determinar la solicitud para el tipo: " + tipo);
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            throw error;
        }
    }

    // Aprueba una solicitud de curso con su evaluación (calificación, clasificación y archivo).
    async updateStatusWithFile(id, tipo, formData) {
        const { rawId } = parseId(id);
        try {
            return await ApiService.post(`admin/course-requests/${rawId}/approve`, formData, true);
        } catch (error) {
            console.error(`Error al actualizar estado con archivo:`, error);
            throw error;
        }
    }

    /** Arma el multipart de POST /courses a partir del formulario de propuesta de curso. */
    _courseFormData(data, isFormData) {
        const get = (key) => (isFormData ? data.get(key) : data[key]);
        let payload = get('payload');
        if (typeof payload === 'string') {
            try { payload = JSON.parse(payload); } catch { payload = {}; }
        }
        payload = payload || {};

        const fields = {
            nombre: payload.titulo || payload.denominacion,
            // Go guarda la fundamentación como descripción y fundamentación a la vez.
            descripcion: payload.fundamentacion,
            objetivos: payload.proposito,
            fundamentacion: payload.fundamentacion,
            duracion: payload.duracion,
            estructura_costos: payload.estructura_costos,
            perfil_docente: payload.perfil_docente,
            perfiles: payload.perfiles,
            exigencias: payload.exigencias,
            estructura_curricular: payload.estructura_curricular,
            evaluacion: payload.evaluacion,
            cronograma: payload.cronograma,
            contenido_competencias: payload.contenido_competencias,
            bibliografia: payload.bibliografia,
        };

        const goFormData = new FormData();
        for (const [key, value] of Object.entries(fields)) {
            if (value !== undefined && value !== null) goFormData.append(key, value);
        }
        const cover = get('cover') || get('archivo_proyecto') || get('archivo');
        if (cover) goFormData.append('portada', cover);
        const cv = get('cv_facilitador');
        if (cv) goFormData.append('cv_facilitador', cv);
        return goFormData;
    }
}

export const solicitudesService = new SolicitudesService();