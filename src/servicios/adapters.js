// Traducen las respuestas del backend Go a la forma que ya usan los componentes.

const PROVIDER_STATUS = {
    under_review: 'under_review',
    active: 'aprobada',
    rejected: 'rechazada',
    inactive: 'inactivo',
};

const REQUEST_STATUS = {
    created: 'pendiente',
    under_review: 'pendiente',
    approved: 'aprobada',
    rejected: 'rechazada',
    redirected: 'pendiente',
};

export function requestStatusToLegacy(estado) {
    return REQUEST_STATUS[String(estado || '').toLowerCase()] || 'pendiente';
}

/** Proveedor de Go -> proveedor del mock (archivos con nombres del mock y legal_status). */
export function providerToLegacy(p) {
    if (!p) return null;
    const archivos = p.archivos || {};
    const otros = archivos.otros || [];
    const contratos = p.contratos_legales || [];
    const inicial = contratos.find(c => c.tipo === 'inicial');
    const adendas = contratos.filter(c => c.tipo === 'adenda');

    return {
        ...p,
        id: String(p.id),
        usuario_id: String(p.usuario_id),
        estado: PROVIDER_STATUS[p.estado] || p.estado,
        es_interno: !!p.interno,
        // Go dirige las solicitudes por facultad, no por coordinador.
        coordinador_id: p.facultad || null,
        archivos: {
            logo: p.provider_avatar_url || null,
            ci: archivos.ci || null,
            rif: archivos.rif || null,
            islr: archivos.islr || null,
            curriculum: (archivos.resumenes || [])[0] || null,
            // Los proveedores registrados antes de que Go tuviera estos campos los guardaron como "otros".
            titulo: archivos.titulo || otros[0] || null,
            registro_mercantil: archivos.registro_mercantil || otros[1] || null,
        },
        legal_status: {
            tiene_carta_intencion: !!inicial,
            carta_intencion_url: inicial?.archivos?.[0] || null,
            carta_compromiso_url: inicial?.archivos?.[1] || null,
            adendas: adendas.map(a => ({
                id_adenda: `ADENDA-${a.id}`,
                archivo_url: a.archivos?.[0] || null,
                compromiso_url: a.archivos?.[1] || null,
                fecha: a.creado_en,
                cursos_amparados: a.cursos_amparados || [],
            })),
        },
    };
}

/** Curso de Go -> curso del mock. `estado_gestion` refleja si aún está en revisión. */
/**
 * Formulación indirecta: la solicitud fue remitida a otra facultad para su aval, así que la
 * facultad que la revisa (facultad) difiere de la que la formuló (facultad_origen).
 */
export function formulationType(c) {
    return c?.facultad_origen && c.facultad && c.facultad_origen !== c.facultad
        ? 'formulacion-curso-indirecta'
        : 'formulacion-curso-directa';
}

export function courseToLegacy(c) {
    if (!c) return null;
    // INTENCION-<id> o ADENDA-<id>: el contrato que ampara el curso.
    const contrato = c.documento_legal_id || null;
    return {
        ...c,
        id: String(c.id),
        titulo: c.nombre || 'Curso Sin Título',
        descripcion: c.descripcion || 'Sin descripción disponible.',
        image: c.image_url || null,
        slug: `curso-${c.id}`,
        proposito: c.objetivos || null,
        fundamentacion: c.fundamentacion || null,
        duracion: c.duracion || null,
        estructura_costos: c.estructura_costos || null,
        perfil_docente: c.perfil_docente || null,
        perfiles: c.perfiles || null,
        exigencias: c.exigencias || null,
        estructura_curricular: c.estructura_curricular || null,
        evaluacion: c.evaluacion || null,
        cronograma: c.cronograma || null,
        contenido_competencias: c.contenido_competencias || null,
        bibliografia: c.bibliografia || null,
        cv_facilitador_url: c.cv_facilitador_url || null,
        codigo_proveedor: c.codigo_proveedor || null,
        user_id: c.usuario_id || null,
        usuario_id: c.usuario_id || null,
        // Un curso no activo sigue en revisión; uno aprobado sin cohorte aún no tiene estado de gestión.
        estado_gestion: c.activo === false ? 'under_review' : (c.estado_gestion || 'aprobada'),
        contrato_id: contrato,
        documento_legal_id: contrato,
        costo: c.estructura_costos || null,
        tipo: formulationType(c),
        link_certificados: null,
        providerDetails: c.proveedor
            ? { nombre_proveedor: c.proveedor.nombre, archivos: { logo: c.proveedor.logo_url || null } }
            : null,
    };
}

/** Período de Go -> cohorte del mock (activa mientras no tenga cierre). */
export function periodToCohort(p, courseId) {
    if (!p) return null;
    return {
        ...p,
        id: String(p.id),
        course_id: String(courseId),
        nombre_cohorte: p.nombre_cohorte || '',
        fecha_inicio: p.fecha_inicio,
        fecha_fin: p.fecha_fin,
        capacidad: p.capacidad,
        // GET /courses/:id/periods solo devuelve períodos activos (no cerrados).
        estado: 'activa',
        creado_en: p.creado_el,
        publicaciones: (p.publicaciones || []).map(pub => ({
            ...pub,
            id: String(pub.id),
            course_id: String(courseId),
            cohort_id: String(p.id),
            fecha: pub.creado_el,
        })),
    };
}
