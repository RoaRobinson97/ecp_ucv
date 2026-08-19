import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        if (!id || id === 'undefined') {
            return NextResponse.json({ error: 'ID de curso no proporcionado' }, { status: 400 });
        }

        // Recuperamos la cookie del navegador para enviarla al backend de Go
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const headers: HeadersInit = { 'Cache-Control': 'no-cache' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            headers['Cookie'] = `auth_token=${token}`;
        }

        let backendCourse = null;

        // 1. Intentar buscar en la tabla oficial de cursos con las credenciales puestas
        try {
            const res = await fetch(`http://localhost:8080/courses/${id}`, { headers, cache: 'no-store' });
            if (res.ok) backendCourse = await res.json();
        } catch (e) {}

        // 2. Si no está, buscar en course-requests
        if (!backendCourse) {
            try {
                const reqRes = await fetch(`http://localhost:8080/course-requests/${id}`, { headers, cache: 'no-store' });
                if (reqRes.ok) backendCourse = await reqRes.json();
            } catch (e) {}
        }

        // 3. Fallback por ID interno
        if (!backendCourse) {
            try {
                const queryRes = await fetch(`http://localhost:8080/course-requests?id=${id}`, { headers, cache: 'no-store' });
                if (queryRes.ok) {
                    const data = await queryRes.json();
                    if (data && data.length > 0) backendCourse = data[0];
                }
            } catch (e) {}
        }

        if (!backendCourse) {
            return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
        }

        // ✨ 4. BUSCAMOS Y ORDENAMOS LAS COHORTES (De la más nueva a la más vieja)
        let cohortes = [];
        try {
            const cyclesRes = await fetch(`http://localhost:8080/course-cycles?course_id=${id}`, { headers, cache: 'no-store' });
            if (cyclesRes.ok) {
                cohortes = await cyclesRes.json();
                // Orden descendente: Las más recientes de primero
                cohortes.sort((a: any, b: any) => new Date(b.creado_en || 0).getTime() - new Date(a.creado_en || 0).getTime());
            }
        } catch (e) {}

        // Separamos la última cohorte
        let ultimaCohorte = cohortes.length > 0 ? cohortes[0] : null;

        // ✨ 5. BUSCAMOS LAS PUBLICACIONES Y SE LAS INYECTAMOS SOLO A LA ÚLTIMA COHORTE
        try {
            const pubsRes = await fetch(`http://localhost:8080/publications?course_id=${id}`, { headers, cache: 'no-store' });
            if (pubsRes.ok && ultimaCohorte) {
                const todasPublicaciones = await pubsRes.json();
                // Filtramos para que solo queden las de la última cohorte, y las ordenamos por fecha
                ultimaCohorte.publicaciones = todasPublicaciones
                    .filter((p: any) => String(p.cohort_id) === String(ultimaCohorte.id))
                    .sort((a: any, b: any) => new Date(b.fecha || 0).getTime() - new Date(a.fecha || 0).getTime());
            }
        } catch (e) {}

        const courseAdapted = {
            id: String(backendCourse.id),
            titulo: backendCourse.nombre || backendCourse.titulo || "Curso Sin Título",
            descripcion: backendCourse.descripcion || backendCourse.fundamentacion || "Sin descripción disponible.",
            image: backendCourse.imagen || backendCourse.image_url || backendCourse.cover || null,
            slug: backendCourse.slug || `curso-${backendCourse.id}`,
            
            proposito: backendCourse.proposito || null,
            fundamentacion: backendCourse.fundamentacion || backendCourse.descripcion || null,
            duracion: backendCourse.duracion || null,
            estructura_costos: backendCourse.estructura_costos || null,
            perfil_docente: backendCourse.perfil_docente || null,
            perfiles: backendCourse.perfiles || null,
            exigencias: backendCourse.exigencias || null,
            estructura_curricular: backendCourse.estructura_curricular || null,
            evaluacion: backendCourse.evaluacion || null,
            cronograma: backendCourse.cronograma || null,
            
            codigo_proveedor: backendCourse.codigo_proveedor || null,
            user_id: backendCourse.usuario_id || backendCourse.user_id || null,
            estado_gestion: backendCourse.estado || backendCourse.estado_gestion || backendCourse.status || 'under_review',
            documento_legal_id: backendCourse.contrato_id || backendCourse.documento_legal_id || null, 
            
            costo: backendCourse.costo || null,
            tipo: backendCourse.tipo_curso || backendCourse.tipo || 'formulacion-curso-directa',
            link_certificados: backendCourse.link_certificados || null,

            // ✨ PASAMOS LA DATA ESTRUCTURADA
            cohorteActiva: ultimaCohorte, 
            cohortes: cohortes
        };

        return NextResponse.json(courseAdapted, { status: 200 });

    } catch (error) {
        console.error(`ERROR EN API GET /api/courses/${id}:`, error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}