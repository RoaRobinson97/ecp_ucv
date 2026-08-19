// src/app/api/courses/[id]/open/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const courseId = resolvedParams.id;
        const body = await request.json();

        // 1. Verificamos que el curso exista
        const courseRes = await fetch(`http://localhost:8080/course-requests/${courseId}`);
        if (!courseRes.ok) return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
        
        const course = await courseRes.json();
        const estadoActual = String(course.estado_gestion || course.estado).toLowerCase();
        
        // Verificamos si tiene documento legal
        const hasContract = !!(course.contrato_id || course.documento_legal_id);

        // Permitimos abrir cohorte si está cerrado (terminó una anterior) 
        // o si está aprobado y tiene contrato (curso nuevo listo para arrancar).
        const canOpen = estadoActual === 'cerrado' || (['aprobado', 'aprobada'].includes(estadoActual) && hasContract);

        if (!canOpen) {
             return NextResponse.json({ error: 'El curso debe estar amparado legalmente (aprobado con contrato o cerrado) para poder abrir una cohorte.' }, { status: 400 });
        }

        // 2. Actualizamos el curso a 'abierto'
        const updateRes = await fetch(`http://localhost:8080/course-requests/${courseId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado_gestion: 'abierto', estado: 'abierto' })
        });

        if (!updateRes.ok) throw new Error('Error al actualizar el estado del curso en la BD');

        // 3. Registramos la cohorte en el historial (tu tabla course-cycles)
        const newCycle = {
            course_id: courseId,
            nombre_cohorte: body.cohortName,
            fecha_inicio: body.startDate,
            fecha_fin: body.endDate,
            capacidad: body.capacity,
            estado: 'activa',
            creado_en: new Date().toISOString()
        };

        await fetch('http://localhost:8080/course-cycles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCycle)
        });

        return NextResponse.json({ success: true, message: 'Cohorte abierta exitosamente' }, { status: 200 });

    } catch (error) {
        console.error("ERROR EN API OPEN COHORT:", error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}