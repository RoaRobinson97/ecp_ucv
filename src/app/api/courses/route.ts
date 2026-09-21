// src/app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { saveFileAndGetUrl } from '../utils/fileHandler'; 
import { cookies } from 'next/headers'; 
import { userService } from '@/servicios/users-service';

export const dynamic = 'force-dynamic';

// ==========================================
// 1. POST: CREAR CURSOS (Tubería Blindada y Cruzada)
// ==========================================
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let payload: any = {};
    let coverFile: File | null = null;
    let userId = '';
    let tipo = 'formulacion-curso-directa';

    // 🧠 TUBERÍA INTELIGENTE
    if (contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        const payloadStr = formData.get('payload') as string;
        
        if (payloadStr) {
            try { payload = JSON.parse(payloadStr); } catch(e) {}
        } else {
            formData.forEach((value, key) => {
                if (!(value instanceof File)) payload[key] = value;
            });
        }

        userId = (formData.get('userId') as string) || payload.userId || payload.usuario_id;
        tipo = (formData.get('tipo') as string) || payload.tipo || tipo;
        coverFile = (formData.get('cover') || formData.get('archivo_proyecto') || formData.get('archivo')) as File | null;

    } else if (contentType.includes('application/json')) {
        payload = await request.json();
        userId = payload.userId || payload.usuario_id;
        tipo = payload.tipo || tipo;
    } else {
        return NextResponse.json({ error: 'Content-Type no soportado' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario no proporcionado' }, { status: 400 });
    }

    // 🔒 VALIDACIÓN DE PROVEEDOR
    const userRes = await fetch(`http://localhost:8080/users/${userId}`);
    if (!userRes.ok) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    
    const userData = await userRes.json();
    const isProvider = userData.rol === 'proveedor' || (userData.roles && userData.roles.includes('proveedor'));

    if (!isProvider) {
      return NextResponse.json({ error: 'Acceso Denegado' }, { status: 403 });
    }

    // 🖼️ GUARDAMOS LA FOTO
    let image_url = payload.image_url || payload.cover || null;
    if (coverFile && coverFile.size > 0) {
        const folderName = `providers/${userId}/covers`;
        image_url = await saveFileAndGetUrl(coverFile, folderName);
    } else if (!image_url) {
      return NextResponse.json({ error: 'Falta imagen de portada' }, { status: 400 });
    }

    // 👨‍🏫 BÚSQUEDA CRUZADA DE FACULTAD
    let nombreFacultad = null;
    let coordinadorId = null;
    
    try {
        const provRes = await fetch(`http://localhost:8080/providers?usuario_id=${userId}`);
        if (provRes.ok) {
            const provData = await provRes.json();
            if (provData && provData.length > 0) {
                coordinadorId = provData[0].coordinador_id || null;
                
                // ✨ LA MAGIA: Buscamos el nombre de la facultad usando el ID del coordinador
                if (coordinadorId) {
                    const coordRes = await fetch(`http://localhost:8080/users/${coordinadorId}`);
                    if (coordRes.ok) {
                        const coordData = await coordRes.json();
                        nombreFacultad = coordData.facultad || null; 
                    }
                }
            }
        }
    } catch (err) {
        console.error("Error en la búsqueda cruzada:", err);
    }

    // 🏗️ ENSAMBLAJE FINAL PARA LA BD
    const newCourse = {
      usuario_id: userId,
      tipo_curso: tipo,
      estado: 'under_review', 
      estado_gestion: 'under_review', 
      
      // Dueño actual 
      facultad: nombreFacultad,
      coordinador_id: coordinadorId,
      
      // El Anfitrión Inmutable
      facultad_origen: nombreFacultad,
      coordinador_origen: coordinadorId,
      
      ...payload, 
      
      nombre: payload.titulo || payload.denominacion || payload.nombre || "Curso sin título",
      descripcion: payload.fundamentacion || payload.descripcion || "",
      image_url: image_url,
      
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString()
    };

    // 🚀 POST A LA BASE DE DATOS
    const createRes = await fetch('http://localhost:8080/course-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse)
    });

    if (!createRes.ok) throw new Error(`Fallo DB. Code: ${createRes.status}`);

    const createdCourse = await createRes.json();
    return NextResponse.json(createdCourse, { status: 201 });

  } catch (error: any) {
    console.error("🔥 ERROR CRÍTICO EN /api/courses POST:", error.message || error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    let queryParams = '';
    
    const usuario_id = searchParams.get('usuario_id');
    if (usuario_id) queryParams += `usuario_id=${usuario_id}&`;

    const codigo_proveedor = searchParams.get('codigo_proveedor');
    if (codigo_proveedor) queryParams += `codigo_proveedor=${codigo_proveedor}&`;

    const estado = searchParams.get('estado');
    if (estado) queryParams += `estado=${estado}&`;

    if (queryParams.endsWith('&')) {
        queryParams = queryParams.slice(0, -1);
    }

    // ✨ LA MAGIA: Traemos de AMBAS tablas para no perder los cursos en curso-requests
    const [resCourses, resRequests] = await Promise.all([
        fetch(`http://localhost:8080/courses?${queryParams}`, { 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        }),
        fetch(`http://localhost:8080/course-requests?${queryParams}`, { 
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        })
    ]);
    
    let dataCourses = resCourses.ok ? await resCourses.json() : [];
    let dataRequests = resRequests.ok ? await resRequests.json() : [];
    
    // Unimos los arrays
    let data = [...dataCourses, ...dataRequests];
    
    // Removemos duplicados por si acaso el mismo curso está en ambas tablas
    data = Array.from(new Map(data.map(c => [c.id, c])).values());
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let currentUser: any = null;
    
    if (token) {
        try { currentUser = await userService.getUserFromToken(token); } catch (e) {}
    }

    const rol = currentUser?.rol || '';
    const roles = currentUser?.roles || [];
    const userIdLogueado = String(currentUser?.id || currentUser?.sub || currentUser?.userID);

    const isAdminOrCoord = rol === 'admin' || rol === 'coordinador' || roles.includes('admin') || roles.includes('coordinador');
    const isOwner = usuario_id === userIdLogueado;

    // Filtro de visibilidad pública
    if (!isAdminOrCoord && !isOwner) {
        data = data.filter((c: any) => {
            const estadoCurso = String(c.estado_gestion || c.estado).toLowerCase();
            return estadoCurso === 'abierto' || estadoCurso === 'cerrado';
        });
    } 

    // Paginación en memoria controlada por Next.js
    const page = parseInt(searchParams.get('_page') || searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('_limit') || searchParams.get('limit') || '0');
    
    if (page > 0 && limit > 0) {
        const start = (page - 1) * limit;
        const end = start + limit;
        data = data.slice(start, end);
    }

    return NextResponse.json(data, { status: 200 });
    
  } catch (error) {
    console.error("Error en API GET Courses:", error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}