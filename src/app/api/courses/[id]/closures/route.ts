// src/app/api/courses/[id]/closures/route.ts
import { NextResponse } from 'next/server';
import { saveFileAndGetUrl } from '../../../utils/fileHandler'; 

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        // ✨ FIX: Next.js ahora exige hacer await a los params
        const resolvedParams = await params;
        const courseId = resolvedParams.id;
        const formData = await request.formData();

        const userId = formData.get('userId') as string;
        const tituloCurso = formData.get('titulo_curso') as string;
        const nombreCohorte = formData.get('nombre_cohorte') as string;
        const observaciones = formData.get('observaciones') as string || '';

        const archivoParticipantes = formData.get('archivo_participantes') as File | null;
        const archivoVouchers = formData.get('archivo_vouchers') as File | null;
        const archivoEncuesta = formData.get('archivo_encuesta') as File | null;

        // Si falta un archivo, lanzamos error
        if (!archivoParticipantes || !archivoVouchers || !archivoEncuesta) {
            return NextResponse.json(
                { error: 'Debes adjuntar los 3 archivos obligatorios.' },
                { status: 400 }
            );
        }

        const courseRes = await fetch(`http://localhost:8080/course-requests/${courseId}`);
        if (!courseRes.ok) {
            return NextResponse.json({ error: 'El curso especificado no existe.' }, { status: 404 });
        }
        const course = await courseRes.json(); 

        const timestamp = Date.now();
        const folderName = `course-requests/${courseId}/closures/${timestamp}`;
        
        const urlParticipantes = await saveFileAndGetUrl(archivoParticipantes, folderName);
        const urlVouchers = await saveFileAndGetUrl(archivoVouchers, folderName);
        const urlEncuesta = await saveFileAndGetUrl(archivoEncuesta, folderName);

        const closureRequest = {
            id: `CIERRE-${timestamp}`,
            usuario_id: userId,
            curso_id: courseId,
            // ✨ FIX MAESTRO: Va directo al anfitrión (ej. Ciencias) aunque el curso haya sido remitido a Medicina
            coordinador_id: course.coordinador_origen || course.coordinador_id, 
            estado: 'under_review', 
            fecha: new Date().toISOString(),
            payload: {
                titulo_curso: tituloCurso,
                nombre_cohorte: nombreCohorte,
                observaciones: observaciones,
                archivos: {
                    participantes_url: urlParticipantes,
                    vouchers_url: urlVouchers,
                    encuesta_url: urlEncuesta
                }
            }
        };

        const saveRes = await fetch('http://localhost:8080/course-cycle-closures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(closureRequest)
        });

        if (!saveRes.ok) throw new Error('Fallo al guardar la solicitud de cierre en la BD.');

        // Bloqueamos el curso
        await fetch(`http://localhost:8080/course-requests/${courseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                estado_gestion: 'solicitud-cierre', 
                estado: 'solicitud-cierre' 
            })
        });

        return NextResponse.json({ success: true, message: 'Solicitud de cierre enviada exitosamente.' }, { status: 201 });

    } catch (error) {
        console.error("ERROR EN API CLOSE COHORT:", error);
        return NextResponse.json({ error: 'Error interno del servidor al procesar el cierre.' }, { status: 500 });
    }
}