// src/app/api/admin/closures/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const estadoParam = searchParams.get('estado') || 'under_review';
    const coordinadorIdParam = searchParams.get('coordinador_id');

    // 1. IDENTIFICAR SI ES ADMIN DIRECTO DESDE EL TOKEN
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let isAdmin = false;

    if (token) {
        try {
            const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
            
            const v1Data = decoded.v1 || {};
            const roles = v1Data.roles || decoded.roles || [];
            const rol = decoded.rol || v1Data.rol || '';

            if (roles.includes('admin') || roles.includes('deu_admin') || rol === 'admin') {
                isAdmin = true;
            }
        } catch (e) {
            console.error("Error decodificando token en closures:", e);
        }
    }

    // 2. Obtenemos TODOS los cierres
    const res = await fetch(`http://localhost:8080/course-cycle-closures`, { 
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
    
    if (!res.ok) throw new Error('Fallo al obtener solicitudes de cierre');

    const allClosures: any[] = await res.json();

    // 3. Filtrado explícito y seguro según el Rol
    const cierresFiltrados = allClosures.filter(cierre => {
        // Normalización de estado (cubre tanto 'under_review' como 'pendiente')
        const estadoCierre = String(cierre.estado || '').toLowerCase();
        const matchesEstado = estadoParam === 'under_review' 
            ? (estadoCierre === 'under_review' || estadoCierre === 'pendiente')
            : estadoCierre === estadoParam.toLowerCase();

        // Si es Admin, tiene acceso total siempre que el estado coincida
        if (isAdmin) {
            return matchesEstado;
        }

        // Si es Coordinador, validamos estrictamente su ID
        let matchesCoordinador = false;
        if (coordinadorIdParam && coordinadorIdParam !== 'undefined' && coordinadorIdParam !== 'null') {
            matchesCoordinador = String(cierre.coordinador_id) === String(coordinadorIdParam);
        }

        return matchesEstado && matchesCoordinador;
    });

    console.log(`✅ Cierres filtrados (Admin: ${isAdmin} | Coordinador: ${coordinadorIdParam}):`, cierresFiltrados.length);

    return NextResponse.json({ cierres: cierresFiltrados }, { status: 200 });
    
  } catch (error) {
    console.error("🔴 ERROR EN API ADMIN CLOSURES:", error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}