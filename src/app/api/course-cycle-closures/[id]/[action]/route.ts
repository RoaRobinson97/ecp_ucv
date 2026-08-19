import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(
    request: Request, 
    { params }: { params: Promise<{ id: string, action: string }> }
) {
    try {
        const resolvedParams = await params;
        const { id, action } = resolvedParams;

        console.log(`\n======================================================`);
        console.log(`🚀 INICIANDO API DE CIERRE DE COHORTE`);
        console.log(`➡️ ID Solicitud de Cierre: ${id} | Acción: ${action}`);

        const body = await request.json().catch(() => ({}));

        // 1. Buscamos la solicitud original
        const reqRes = await fetch(`http://localhost:8080/course-cycle-closures/${id}`);
        if (!reqRes.ok) {
            console.error(`❌ FALLÓ: No se encontró la solicitud de cierre con ID: ${id}`);
            return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
        }
        
        const closureRequest = await reqRes.json();
        console.log(`✅ Solicitud encontrada en BD. Curso ID asociado: ${closureRequest.curso_id}`);

        // 2. Determinamos el nuevo estado
        let nuevoEstado = 'under_review';
        if (action === 'approve') nuevoEstado = 'aprobada';
        if (action === 'reject') nuevoEstado = 'rechazada';

        // 3. Actualizamos la solicitud de cierre
        console.log(`➡️ Intentando cambiar estado de la solicitud a: ${nuevoEstado}...`);
        const patchCierreRes = await fetch(`http://localhost:8080/course-cycle-closures/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                estado: nuevoEstado,
                estado_gestion: nuevoEstado, // Por si lo usa el frontend
                fecha_actualizacion: new Date().toISOString(),
                motivo_rechazo: body.observaciones || ''
            })
        });
        
        console.log(`📝 Status Actualización de Solicitud: ${patchCierreRes.ok ? 'EXITOSO' : 'FALLIDO (' + patchCierreRes.status + ')'}`);

        await delay(100); 

        // 4. Lógica sobre el Curso y la Cohorte
        const cursoId = closureRequest.curso_id;

        if (action === 'approve') {
            console.log(`🟢 Entrando a bloque APPROVE para el curso: ${cursoId}`);
            
            // Actualizamos tanto en 'course-requests' como en 'courses'
            for (const table of ['course-requests', 'courses']) {
                const patchCursoRes = await fetch(`http://localhost:8080/${table}/${cursoId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado_gestion: 'cerrado', estado: 'cerrado' })
                });
                console.log(`📝 Update Curso en tabla [${table}]: ${patchCursoRes.ok ? 'EXITOSO' : 'IGNORADO / NO EXISTE'}`);
            }

            await delay(100); 

            // Buscamos y cerramos las cohortes
            const urlCiclos = `http://localhost:8080/course-cycles?course_id=${cursoId}&estado=activa`;
            console.log(`🔍 Buscando cohortes activas en URL: ${urlCiclos}`);
            
            const ciclosRes = await fetch(urlCiclos);
            if (ciclosRes.ok) {
                const ciclos = await ciclosRes.json();
                console.log(`✅ Se encontraron ${ciclos.length} cohortes activas para este curso.`);
                
                for (const ciclo of ciclos) {
                    console.log(`➡️ Intentando cerrar cohorte ID: ${ciclo.id} ("${ciclo.nombre_cohorte}")...`);
                    const patchCicloRes = await fetch(`http://localhost:8080/course-cycles/${ciclo.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ estado: 'cerrada' }) 
                    });
                    console.log(`📝 Update Cohorte [${ciclo.id}]: ${patchCicloRes.ok ? 'EXITOSO' : 'FALLIDO'}`);
                    
                    await delay(50); 
                }
            } else {
                console.error(`❌ Error al buscar cohortes. HTTP Status: ${ciclosRes.status}`);
            }
            
        } else if (action === 'reject') {
            console.log(`🔴 Entrando a bloque REJECT para el curso: ${cursoId}`);
            for (const table of ['course-requests', 'courses']) {
                await fetch(`http://localhost:8080/${table}/${cursoId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado_gestion: 'abierto', estado: 'abierto' })
                }).catch(() => {});
            }
        }

        console.log(`🏁 FIN PROCESO DE CIERRE DE COHORTE`);
        console.log(`======================================================\n`);
        
        return NextResponse.json({ success: true, estado: nuevoEstado }, { status: 200 });

    } catch (error) {
        console.error("🔴 ERROR CATASTRÓFICO EN API DE CIERRE:", error);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}