// src/app/api/provider-requests/[id]/[action]/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; 

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    // 🔒 1. VERIFICACIÓN DE SEGURIDAD
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'No autorizado. Falta token.' }, { status: 401 });
    }

    let userPayload;
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        userPayload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
    } catch (e) {
        return NextResponse.json({ error: 'Token inválido.' }, { status: 401 });
    }

    const isAdmin = userPayload.rol === 'admin' || userPayload.roles?.includes('deu_admin') || userPayload.roles?.includes('admin');
    const isCoordinador = userPayload.rol === 'coordinador' || userPayload.roles?.includes('coordinador');

    if (!isAdmin && !isCoordinador) {
        return NextResponse.json({ error: 'Rol insuficiente.' }, { status: 403 });
    }

    // 2. RESOLVEMOS LOS PARÁMETROS
    const resolvedParams = await params;
    const { id, action } = resolvedParams;

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Acción inválida.' }, { status: 400 });
    }

    // 3. BUSCAMOS EL PROVEEDOR
    const provRes = await fetch(`http://localhost:8080/providers/${id}`);
    if (!provRes.ok) {
      return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
    }
    const provider = await provRes.json();

    // 4. LEEMOS EL CUERPO 
    let body: any = {};
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        body = await request.json().catch(() => ({}));
    } 

    // 5. DETERMINAMOS EL NUEVO ESTADO
    let nuevoEstado = 'under_review';
    let motivoRechazo = '';

    if (action === 'approve') {
        nuevoEstado = 'aprobada';
    } else if (action === 'reject') {
        nuevoEstado = 'rechazada';
        motivoRechazo = body.observaciones || '';
    }

    // 6. ACTUALIZAMOS EL OBJETO PROVEEDOR
    const updatedProvider = {
      ...provider,
      estado: nuevoEstado,
      motivo_rechazo: action === 'reject' ? motivoRechazo : (provider.motivo_rechazo || ""),
      fecha_actualizacion: new Date().toISOString()
    };

    // 7. GUARDAMOS EN LA BASE DE DATOS
    const updateRes = await fetch(`http://localhost:8080/providers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProvider)
    });

    if (!updateRes.ok) throw new Error('Fallo al actualizar el proveedor en la BD');
    
    const finalProvider = await updateRes.json();

    return NextResponse.json({ 
        message: `Proveedor ${nuevoEstado}`, 
        proveedor: finalProvider 
    }, { status: 200 });

  } catch (error) {
    console.error(`ERROR EN ADMIN ACTIONS (Proveedores):`, error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}