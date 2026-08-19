import { ApiService } from './BaseApiService';
import { CONFIG } from '../config/config';

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

            const paramsAdminProviders = { type: 'courses', status, _t: timestamp };
            const paramsAdminCourses = { status, page, _t: timestamp };
            const paramsAdminClosures = { estado: status === 'under_review' ? 'under_review' : status, _t: timestamp };

            // ✨ FIX: Evitamos mandar la palabra "undefined" a la API
            if (coordinador_id && coordinador_id !== 'undefined') {
                paramsAdminProviders.coordinador_id = coordinador_id;
                paramsAdminCourses.coordinador_id = coordinador_id;
                paramsAdminClosures.coordinador_id = coordinador_id;
            }

            const [providersRes, coursesRes, closuresRes] = await Promise.allSettled([
                ApiService.get('admin/providers', paramsAdminProviders), 
                ApiService.get('admin/courses', paramsAdminCourses),
                ApiService.get('admin/closures', paramsAdminClosures) 
            ]); 
            
            let rawData = [];

            // 1. PROVEEDORES
            if (providersRes.status === 'fulfilled' && providersRes.value?.proveedores) {
                const provs = providersRes.value.proveedores.map(p => ({
                    id: String(p.id),
                    user_id: String(p.usuario_id), 
                    tipo: 'codigo-proveedor',
                    estado: p.estado === 'under_review' ? 'pendiente' : (p.estado || 'pendiente'),
                    fecha_creacion: p.fecha_creacion || new Date().toISOString(), 
                    payload: {
                        nombre_proveedor: p.nombre_proveedor,
                        biografia: p.biografia,
                        codigo_proveedor: p.codigo_proveedor,
                        archivos: p.archivos,
                        interno: p.es_interno || p.interno,
                        coordinador_id: p.coordinador_id 
                    }
                }));
                rawData = rawData.concat(provs);
            }

            // 2. CURSOS
            if (coursesRes.status === 'fulfilled' && coursesRes.value?.solicitudes) {
                const courses = coursesRes.value.solicitudes.map(c => ({
                    id: String(c.id),
                    user_id: String(c.usuario_id || c.user_id || '0'), 
                    tipo: c.tipo_curso || 'formulacion-curso-directa',
                    estado: c.estado === 'under_review' ? 'pendiente' : (c.estado || 'pendiente'),
                    fecha_creacion: c.creado_en || new Date().toISOString(),
                    payload: {
                        ...c,
                        titulo: c.nombre || c.titulo, 
                    } 
                }));
                rawData = rawData.concat(courses);
            }

            // 3. CIERRES DE COHORTE
            if (closuresRes.status === 'fulfilled' && closuresRes.value) {
                const cierresArray = Array.isArray(closuresRes.value) ? closuresRes.value : (closuresRes.value.cierres || []);
                const closures = cierresArray.map(c => ({
                    id: String(c.id),
                    user_id: String(c.usuario_id || c.user_id),
                    tipo: 'cierre-cohorte',
                    estado: c.estado === 'under_review' ? 'pendiente' : (c.estado || 'pendiente'),
                    fecha_creacion: c.fecha || new Date().toISOString(),
                    payload: c 
                }));
                rawData = rawData.concat(closures);
            }
            
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

            // 1. Buscar en Proveedores
            try {
                const provReq = await fetch(`http://localhost:8080/providers/${id}`).then(r => r.ok ? r.json() : null);
                if (provReq && provReq.id) {
                    provReq.tipo_inyectado = 'codigo-proveedor';
                    return this._adaptSolicitud(provReq);
                }
            } catch (e) {}

            // 2. Buscar en Cursos (Aprobados/Cerrados)
            try {
                const courseReq = await fetch(`http://localhost:8080/courses/${id}`).then(r => r.ok ? r.json() : null);
                if (courseReq && courseReq.id) {
                    courseReq.tipo_inyectado = 'formulacion-curso-directa';
                    return this._adaptSolicitud(courseReq);
                }
            } catch (e) {}

            // ✨ 3. EL FIX: Buscar en Solicitudes de Cursos (course-requests)
            try {
                const courseRequestReq = await fetch(`http://localhost:8080/course-requests/${id}`).then(r => r.ok ? r.json() : null);
                if (courseRequestReq && courseRequestReq.id) {
                    courseRequestReq.tipo_inyectado = 'formulacion-curso-directa';
                    return this._adaptSolicitud(courseRequestReq);
                }
            } catch (e) {}

            // 4. Buscar en Cierres de Cohorte
            try {
                const cierreReq = await fetch(`http://localhost:8080/course-cycle-closures/${id}`).then(r => r.ok ? r.json() : null);
                if (cierreReq && cierreReq.id) {
                    return {
                        id: String(cierreReq.id),
                        user_id: String(cierreReq.usuario_id),
                        tipo: 'cierre-cohorte',
                        estado: cierreReq.estado === 'under_review' ? 'pendiente' : (cierreReq.estado || 'pendiente'),
                        fecha_creacion: cierreReq.fecha || new Date().toISOString(),
                        payload: cierreReq
                    };
                }
            } catch (e) {}

            // Si después de buscar en las 4 tablas no está, devolvemos null (Ahí sí es un 404 real)
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
                    
                    goFormData.append('userId', data.get('userId'));
                    goFormData.append('tipo_proveedor', 'courses'); 
                    
                    const tipoPersona = data.get('tipo_persona') === 'juridica' ? 'juridical' : 'natural';
                    goFormData.append('tipo_persona', tipoPersona);
                    goFormData.append('tipo_lucro', data.get('tipo_lucro') || 'no_lucrativo');
                    goFormData.append('nombre', data.get('nombre_proveedor')); 
                    goFormData.append('bio', data.get('biografia'));          
                    goFormData.append('es_interno', data.get('es_interno'));   
                    goFormData.append('coordinador_id', data.get('coordinador_id')); 

                    if (data.has('avatar')) goFormData.append('logo', data.get('avatar'));
                    if (data.has('cedula')) goFormData.append('ci', data.get('cedula')); 
                    if (data.has('rif')) goFormData.append('rif', data.get('rif'));
                    if (data.has('islr')) goFormData.append('islr', data.get('islr'));
                    if (data.has('curriculum')) goFormData.append('resumes', data.get('curriculum'));
                    if (data.has('titulo')) goFormData.append('titulo', data.get('titulo'));
                    if (data.has('registro_mercantil')) goFormData.append('registro_mercantil', data.get('registro_mercantil'));
                    
                    return await ApiService.post('providers', goFormData, true);
                }
                
                case 'formulacion-curso-directa':
                case 'formulacion-curso-indirecta': {
                    if (isFormData) {
                        return await ApiService.post('courses', data, true);
                    } else {
                        return await ApiService.post('courses', data);
                    }
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
            // ✨ FIX MAESTRO: Si es cierre de cohorte, lo mandamos a la API de Next.js
            // para que ejecute la lógica compleja (cerrar curso, cerrar ciclos, etc.)
            if (tipo === 'cierre-cohorte') {
                const action = nuevoEstado === 'aprobada' ? 'approve' : 'reject';
                
                const res = await fetch(`/api/course-cycle-closures/${id}/${action}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        observaciones: motivo,
                        ...extraData 
                    })
                });

                if (!res.ok) {
                    throw new Error(`Fallo al procesar el cierre de cohorte en la API interna.`);
                }
                
                return await res.json();
            }

            // 🧠 Para Proveedores y Cursos normales, sí podemos ir directo a JSON-Server
            let tablesToTry = [];
            
            if (tipo === 'codigo-proveedor') {
                tablesToTry = ['providers'];
            } else if (tipo?.includes('curso') || tipo?.includes('directa') || tipo?.includes('indirecta')) {
                tablesToTry = ['course-requests', 'courses'];
            } else {
                throw new Error("No se puede determinar la tabla para el tipo: " + tipo);
            }

            const updatePayload = {
                estado: nuevoEstado,
                estado_gestion: nuevoEstado,
                motivo_rechazo: motivo || null,
                fecha_actualizacion: new Date().toISOString(),
                ...extraData
            };

            let updatedRecord = null;

            // 🎯 Intentamos actualizar en las tablas posibles
            for (const tableName of tablesToTry) {
                const res = await fetch(`http://localhost:8080/${tableName}/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload)
                });

                if (res.ok) {
                    updatedRecord = await res.json();
                    break;
                }
            }

            if (!updatedRecord) {
                throw new Error(`Fallo en la BD: No se encontró el registro ${id} para actualizar.`);
            }

            // Ascenso de Proveedor
            if (tipo === 'codigo-proveedor' && nuevoEstado === 'aprobada') {
                await fetch(`http://localhost:8080/users/${updatedRecord.usuario_id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        rol: 'proveedor',
                        roles: ['proveedor'],
                        codigo_proveedor: updatedRecord.id
                    })
                });
            }

            return updatedRecord;
            
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            throw error;
        }
    }

    // ✨ ESTA FUNCIÓN INTACTA: Sigue manejando el APROBAR perfectamente
    async updateStatusWithFile(id, tipo, formData) {
        const isCourse = tipo.toLowerCase().includes('curso') || tipo.toLowerCase().includes('directa');
        const endpointPrefix = isCourse ? 'course-requests' : 'provider-requests';
        const action = 'approve'; 
        const url = `/api/${endpointPrefix}/${id}/${action}`; 

        try {
            const response = await fetch(url, { method: 'POST', body: formData });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Fallo al subir archivo');
            }
            return await response.json();
        } catch (error) {
            console.error(`Error al actualizar estado con archivo:`, error);
            throw error;
        }
    }

    _adaptSolicitud(s) {
        const tipoReal = s.tipo_inyectado || s.tipo || 'formulacion-curso-directa'; 
        
        const rawEstado = String(s.estado || s.status || 'pendiente').toLowerCase();
        let estadoReal = 'pendiente';
        if (rawEstado === 'under_review' || rawEstado === 'pendiente') estadoReal = 'pendiente';
        if (rawEstado === 'approved' || rawEstado === 'aprobada') estadoReal = 'aprobada';
        if (rawEstado === 'rejected' || rawEstado === 'rechazada') estadoReal = 'rechazada';

        const cursoData = s.curso || {};

        return {
            id: String(s.id),
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