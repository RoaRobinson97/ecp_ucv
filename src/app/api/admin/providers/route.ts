// src/app/api/admin/providers/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; 

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const coordinador_id = searchParams.get('coordinador_id');
    
    // ✨ Definimos la URL dinámica una sola vez para usarla en todos los fetch
    const targetUrl = status === 'all' 
        ? `http://localhost:8080/providers` 
        : `http://localhost:8080/providers?estado=${status}`;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    // 1. ATAJO DIRECTO PARA EL ADMIN
    if (token) {
        try {
            const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
            
            const v1Data = decoded.v1 || {};
            const roles = v1Data.roles || decoded.roles || [];
            const rol = decoded.rol || v1Data.rol || '';

            if (roles.includes('admin') || roles.includes('deu_admin') || rol === 'admin') {
                const res = await fetch(targetUrl, { cache: 'no-store' });
                if (!res.ok) throw new Error('Fallo al obtener proveedores');
                
                const data = await res.json();
                return NextResponse.json({ proveedores: data }, { status: 200 });
            }
        } catch (e) {
            console.error("Error decodificando token en providers:", e);
        }
    }

    // 2. LÓGICA EXCLUSIVA PARA EL COORDINADOR
    let userData: any = null;

    if (coordinador_id && coordinador_id !== 'undefined') {
        try {
            const userRes = await fetch(`http://localhost:8080/users/${coordinador_id}`, { cache: 'no-store' });
            if (userRes.ok) {
                userData = await userRes.json();
            }
        } catch (err) {
            console.error("Error al hacer fetch del usuario en la BD:", err);
        }
    }

    // 3. TUBERÍA AL JSON SERVER USANDO LA URL DINÁMICA
    const res = await fetch(targetUrl, { cache: 'no-store' });
    
    if (!res.ok) throw new Error('Fallo al obtener proveedores');

    let data = await res.json();
    
    // 4. FILTRADO ESTRICTO PARA EL COORDINADOR
    if (userData) {
        const isCoordinador = userData.rol === 'coordinador' || userData.roles?.includes('coordinador');

        if (isCoordinador) {
            data = data.filter((prov: any) => {
                return String(prov.coordinador_id) === String(userData.id);
            });
        } else {
            data = [];
        }
    } else {
        data = [];
    }

    return NextResponse.json({ proveedores: data }, { status: 200 });
  } catch (error) {
    console.error("ERROR EN API PROVIDERS:", error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}