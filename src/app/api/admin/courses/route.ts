// src/app/api/admin/courses/route.ts
import { NextResponse } from 'next/server';
import { saveFileAndGetUrl } from '../../utils/fileHandler'; 

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const userId = formData.get('userId') as string;
    const tipo = formData.get('tipo') as string;
    const payloadStr = formData.get('payload') as string;
    
    const coverFile = formData.get('cover') as File | null;

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario no proporcionado' }, { status: 400 });
    }

    const userRes = await fetch(`http://localhost:8080/users/${userId}`);
    if (!userRes.ok) {
      return NextResponse.json({ error: 'Usuario no encontrado en la base de datos' }, { status: 404 });
    }
    
    const userData = await userRes.json();
    const isProvider = userData.rol === 'proveedor' || (userData.roles && userData.roles.includes('proveedor'));

    if (!isProvider) {
      return NextResponse.json(
        { error: 'Acceso Denegado: Solo los proveedores aprobados pueden formular cursos.' }, 
        { status: 403 }
      );
    }

    if (!coverFile || coverFile.size === 0) {
      return NextResponse.json(
        { error: 'La imagen de portada es obligatoria para crear un curso.' }, 
        { status: 400 }
      );
    }

    const folderName = `providers/${userId}/covers`;
    const image_url = await saveFileAndGetUrl(coverFile, folderName);

    const payload = payloadStr ? JSON.parse(payloadStr) : {};

    let facultadHeredada = null;
    let coordinadorHeredado = null;
    
    try {
        const provRes = await fetch(`http://localhost:8080/providers?usuario_id=${userId}`);
        if (provRes.ok) {
            const provData = await provRes.json();
            if (provData && provData.length > 0) {
                facultadHeredada = provData[0].facultad || null;
                coordinadorHeredado = provData[0].coordinador_id || null;
            }
        }
    } catch (err) {
        console.error("Error al buscar datos del proveedor para heredar facultad:", err);
    }

    const newCourse = {
      ...payload, 
      
      usuario_id: userId,
      tipo_curso: tipo || 'formulacion-curso-directa',
      estado: 'under_review', 
      estado_gestion: 'under_review', 
      
      facultad: facultadHeredada || payload.facultad || null,
      coordinador_id: coordinadorHeredado || payload.coordinador_id || null,
      
      facultad_origen: facultadHeredada || payload.facultad || null,
      coordinador_origen: coordinadorHeredado || payload.coordinador_id || null,
      
      nombre: payload.titulo || payload.denominacion,
      descripcion: payload.fundamentacion,
      image_url: image_url,
      
      creado_en: new Date().toISOString(),
      actualizado_en: new Date().toISOString()
    };

    const createRes = await fetch('http://localhost:8080/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCourse)
    });

    if (!createRes.ok) throw new Error('Fallo al guardar el curso');

    const createdCourse = await createRes.json();
    return NextResponse.json(createdCourse, { status: 201 });

  } catch (error) {
    console.error("ERROR AL CREAR CURSO:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

import { cookies } from 'next/headers'; 
import { userService } from '@/servicios/users-service';
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const coordinador_id = searchParams.get('coordinador_id');

    // 1. IDENTIFICAR QUIÉN PREGUNTA (Rol y Facultad)
    let userData: any = null;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    console.log('El token es:', token); 

    if (token) {
        try {
            const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
            
            const v1Data = decoded.v1 || {};
            const roles = v1Data.roles || decoded.roles || [];
            const rol = decoded.rol || v1Data.rol || '';

            // SI ES ADMIN: Hacemos todo aquí y retornamos de inmediato
            if (roles.includes('admin') || roles.includes('deu_admin') || rol === 'admin') {
                const [reqCourses, reqRequests] = await Promise.all([
                    fetch(`http://localhost:8080/courses`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
                    fetch(`http://localhost:8080/course-requests`, { cache: 'no-store' }).then(r => r.ok ? r.json() : [])
                ]);

                let adminData = [...reqCourses, ...reqRequests];

                adminData = adminData.filter((curso: any) => {
                    const estado = String(curso.estado_gestion || curso.estado || '').toLowerCase();
                    if (['redirigida', 'remitida', 'rechazada', 'rechazado'].includes(estado)) return false;

                    const isUnderReview = estado === 'under_review' || estado === 'pendiente';
                    const hasContract = !!(curso.contrato_id || curso.numContrato || curso.documento_legal_id);
                    const isApprovedWithoutContract = (estado === 'aprobada' || estado === 'aprobado') && !hasContract;

                    // El admin ve todo lo que cumpla esto, sin importar la facultad
                    return isUnderReview || isApprovedWithoutContract;
                });

                // Matamos la ejecución aquí
                return NextResponse.json({ solicitudes: adminData }, { status: 200 });
            }
        } catch (e) {
            console.error("Error decodificando token:", e);
        }
    }
    // 2. LÓGICA SIGUIENTE (Se obvia si el token ya dijo que es Admin)
    if (!userData && coordinador_id && coordinador_id !== 'undefined') {
        try {
            const userRes = await fetch(`http://localhost:8080/users/${coordinador_id}`, { cache: 'no-store' });
            if (userRes.ok) userData = await userRes.json();
        } catch (err) {
            console.error("Error al buscar usuario:", err);
        }
    }
    if (coordinador_id && coordinador_id !== 'undefined') {
        try {
            const userRes = await fetch(`http://localhost:8080/users/${coordinador_id}`, { cache: 'no-store' });
            if (userRes.ok) userData = await userRes.json();
        } catch (err) {
            console.error("Error al buscar usuario:", err);
        }
    }

    if (!userData) {
        return NextResponse.json({ solicitudes: [] }, { status: 200 });
    }

    // 2. TRAER ABSOLUTAMENTE TODO DE AMBAS TABLAS
    const [reqCourses, reqRequests] = await Promise.all([
        fetch(`http://localhost:8080/courses`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
        fetch(`http://localhost:8080/course-requests`, { cache: 'no-store' }).then(r => r.ok ? r.json() : [])
    ]);

    let allData = [...reqCourses, ...reqRequests];

    // 3. FILTRADO ESTRICTO Y COMPLETO
    const isAdmin = userData.rol === 'admin' || userData.roles?.includes('deu_admin') || userData.roles?.includes('admin');
    const isCoordinador = userData.rol === 'coordinador' || userData.roles?.includes('coordinador');
    const miFacultad = userData.facultad ? String(userData.facultad).toLowerCase().trim() : null;

    allData = allData.filter((curso: any) => {
        const estado = String(curso.estado_gestion || curso.estado || '').toLowerCase();
        const facultadCurso = String(curso.facultad || '').toLowerCase().trim();
        const facultadOrigen = String(curso.facultad_origen || curso.facultad || '').toLowerCase().trim();

        // Limpieza básica: basura fuera
        if (['redirigida', 'remitida', 'rechazada', 'rechazado'].includes(estado)) return false;

        // ESTADO A: Pendientes por revisar
        const isUnderReview = estado === 'under_review' || estado === 'pendiente';
        
        // ESTADO B: Aprobados pero sin amparo legal
        const hasContract = !!(curso.contrato_id || curso.numContrato || curso.documento_legal_id);
        const isApprovedWithoutContract = (estado === 'aprobada' || estado === 'aprobado') && !hasContract;

        // Si no cumple A ni B, lo sacamos de la bandeja
        if (!isUnderReview && !isApprovedWithoutContract) return false;

        // 👑 REGLA ADMIN: Ve absolutamente todo lo que cumpla A o B
        if (isAdmin) return true;

        // 👔 REGLA COORDINADOR: Filtro cruzado por facultades
        if (isCoordinador) {
            // Para revisar, el curso debe estar asignado A SU FACULTAD
            const isMyTurn = isUnderReview && (facultadCurso === miFacultad);
            
            // Para firmar papeles, el curso debe HABER NACIDO EN SU FACULTAD
            const isMyProviderMissingContract = isApprovedWithoutContract && (facultadOrigen === miFacultad);

            return isMyTurn || isMyProviderMissingContract;
        }

        return false;
    });

    return NextResponse.json({ solicitudes: allData }, { status: 200 });
    
  } catch (error) {
    console.error("ERROR EN API ADMIN COURSES:", error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}