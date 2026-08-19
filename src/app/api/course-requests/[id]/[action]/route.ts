// src/app/api/course-requests/[id]/[action]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; 
// ✨ Asegúrate de que esta ruta apunte a tu archivo fileHandler correctamente
import { saveFileAndGetUrl } from '../../../utils/fileHandler'; 

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    // 1. Verificación de Seguridad
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });

    let userPayload;
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        userPayload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    } catch (e) {
        return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    // 2. Resolvemos parámetros de la URL
    const resolvedParams = await params;
    const { id, action } = resolvedParams;

    // Aceptamos las tres acciones
    if (action !== 'approve' && action !== 'reject' && action !== 'remit') {
      return NextResponse.json({ error: 'Acción inválida.' }, { status: 400 });
    }

    // ✨ 3. BÚSQUEDA INTELIGENTE: Buscamos en AMBAS tablas
    let tableName = 'course-requests';
    let courseRes = await fetch(`http://localhost:8080/${tableName}/${id}`);
    
    if (!courseRes.ok) {
        tableName = 'courses';
        courseRes = await fetch(`http://localhost:8080/${tableName}/${id}`);
    }

    if (!courseRes.ok) {
      return NextResponse.json({ error: 'Curso no encontrado en la BD' }, { status: 404 });
    }
    
    const course = await courseRes.json();
    const userId = course.usuario_id || course.user_id || 'general';

    // 4. Leemos los datos que envía el frontend
    let body: any = {};
    let clasificacionGuardada = ''; 
    let archivoEvaluacionUrl = null;
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
        body = await request.json().catch(() => ({}));
        clasificacionGuardada = body.clasificacion || '';
    } else if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData().catch(() => new FormData());
        body.calificacion = formData.get('calificacion');
        body.observaciones = formData.get('observaciones');
        clasificacionGuardada = formData.get('clasificacion') as string || '';
        
        // ✨ FIX DE ARCHIVOS: Atrapamos el PDF y lo guardamos físicamente
        const archivo = formData.get('archivo_evaluacion') as File | null;
        if (archivo && archivo.size > 0) {
            archivoEvaluacionUrl = await saveFileAndGetUrl(archivo, `courses/${userId}/evaluaciones`);
        }
    }

    // 5. Asignamos el nuevo estado
    let nuevoEstado = 'under_review';
    let motivoRechazo = '';

    if (action === 'approve') nuevoEstado = 'aprobada';
    else if (action === 'reject') {
        nuevoEstado = 'rechazada';
        motivoRechazo = body.observaciones || '';
    } else if (action === 'remit') {
        nuevoEstado = 'under_review'; 
    }

    // 6. Preparamos el objeto para actualizar
    const updatedCourse = {
      ...course, // Copia todo el curso, incluyendo 'facultad_origen' inmutable
      estado: nuevoEstado,
      estado_gestion: nuevoEstado,
      motivo_rechazo: action === 'reject' ? motivoRechazo : (course.motivo_rechazo || ""),
      actualizado_en: new Date().toISOString()
    };

    // Aplicamos los datos extra si existen
    if (clasificacionGuardada) {
        updatedCourse.clasificacion = clasificacionGuardada;
    }
    if (body.calificacion) {
        updatedCourse.calificacion = body.calificacion;
    }
    if (archivoEvaluacionUrl) {
        updatedCourse.archivo_evaluacion_url = archivoEvaluacionUrl; // Guardamos la URL del PDF
    }

    // SI ES REMITIR, CAMBIAMOS EL DUEÑO ACTUAL
    if (action === 'remit') {
        updatedCourse.coordinador_id = body.nuevo_coordinador_id || body.coordinador_id;
        updatedCourse.facultad = body.nueva_facultad || body.facultad;
        if (body.tipo_curso) updatedCourse.tipo_curso = body.tipo_curso;
    }

    // ✨ 7. Actualizamos en el JSON Server usando la tabla correcta donde lo encontramos
    const updateRes = await fetch(`http://localhost:8080/${tableName}/${id}`, {
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCourse)
    });

    if (!updateRes.ok) throw new Error(`Fallo al actualizar el curso en la BD (${tableName})`);
    const finalCourse = await updateRes.json();

    return NextResponse.json({ 
        message: action === 'remit' ? 'Curso remitido exitosamente' : `Curso ${nuevoEstado}`, 
        curso: finalCourse 
    }, { status: 200 });

  } catch (error) {
    console.error(`ERROR EN CURSOS (Acción):`, error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}