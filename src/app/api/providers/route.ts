import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; 
import { saveFileAndGetUrl } from '../utils/fileHandler';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get('userId') as string;
    
    // ✨ EXTRAEMOS EL COORDINADOR
    const coordinadorId = formData.get('coordinador_id') as string;

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario no proporcionado' }, { status: 400 });
    }
    if (!coordinadorId) {
      return NextResponse.json({ error: 'Debe seleccionar una facultad destino.' }, { status: 400 });
    }

    // 1. VALIDACIÓN ANTIDUPLICADOS
    const checkRes = await fetch(`http://localhost:8080/providers?usuario_id=${userId}`);
    const existingProviders = await checkRes.json();

    if (existingProviders && existingProviders.length > 0) {
      const isUnderReview = existingProviders.some((p: any) => p.estado === 'under_review' || p.estado === 'pendiente');
      const isApproved = existingProviders.some((p: any) => p.estado === 'aprobada' || p.estado === 'approved');

      if (isUnderReview) return NextResponse.json({ error: 'Ya tienes una solicitud de colaborador en revisión.' }, { status: 409 });
      if (isApproved) return NextResponse.json({ error: 'Ya eres un colaborador aprobado.' }, { status: 409 });
    }

    // 2. EXTRAEMOS LOS TEXTOS
    const tipoPersona = formData.get('tipo_persona') as string; 
    const tipoLucro = formData.get('tipo_lucro');
    const nombre = formData.get('nombre') || formData.get('nombre_proveedor'); 
    const bio = formData.get('bio') || formData.get('biografia');
    const esInterno = formData.get('es_interno');

    // 3. EXTRAEMOS LOS ARCHIVOS
    const logoFile = formData.get('logo') as File | null;
    const ciFile = formData.get('ci') as File | null;
    const rifFile = formData.get('rif') as File | null;
    const islrFile = formData.get('islr') as File | null;
    const resumesFile = formData.get('resumes') as File | null;
    const tituloFile = formData.get('titulo') as File | null;
    const regMercantilFile = formData.get('registro_mercantil') as File | null;

    // 4. VALIDACIONES ESTRICTAS
    if (!logoFile || !ciFile || !rifFile || !resumesFile || !tituloFile) {
        return NextResponse.json({ error: 'Faltan documentos base requeridos.' }, { status: 400 });
    }
    const esJuridica = tipoPersona === 'juridica' || tipoPersona === 'juridical';
    if (esJuridica && !regMercantilFile) {
        return NextResponse.json({ error: 'Falta el Registro Mercantil obligatorio para personas jurídicas.' }, { status: 400 });
    }

    // ✨ 5. ASEGURAR DIRECTORIO ANTES DE GUARDAR
    const basePath = path.join(process.cwd(), 'public', 'uploads', 'providers', userId);
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true });
    }

    // 6. GUARDAMOS LOS ARCHIVOS
    let logoUrl, ciUrl, rifUrl, islrUrl, resumesUrl, tituloUrl, regMercantilUrl = null;
    try {
        const folderName = `providers/${userId}`;
        logoUrl = await saveFileAndGetUrl(logoFile, folderName);
        ciUrl = await saveFileAndGetUrl(ciFile, folderName);
        rifUrl = await saveFileAndGetUrl(rifFile, folderName);
        // Guardar ISLR solo si fue proporcionado
        islrUrl = islrFile ? await saveFileAndGetUrl(islrFile, folderName) : null;
        resumesUrl = await saveFileAndGetUrl(resumesFile, folderName);
        tituloUrl = await saveFileAndGetUrl(tituloFile, folderName);
        regMercantilUrl = regMercantilFile ? await saveFileAndGetUrl(regMercantilFile, folderName) : null;
    } catch (e) {
        console.error("Error guardando archivos del proveedor:", e);
        return NextResponse.json({ error: 'Error al subir los archivos al servidor.' }, { status: 500 });
    }

    // 7. ✨ CONSTRUIMOS EL JSON CON EL COORDINADOR
    const newProvider = {
      usuario_id: userId,
      coordinador_id: coordinadorId, 
      nombre_proveedor: nombre,
      biografia: bio,
      tipo_persona: tipoPersona,
      tipo_lucro: tipoLucro,
      es_interno: esInterno === 'true',
      estado: 'under_review', 
      archivos: {
        logo: logoUrl,
        ci: ciUrl,
        rif: rifUrl,
        islr: islrUrl,
        curriculum: resumesUrl,
        titulo: tituloUrl,                
        registro_mercantil: regMercantilUrl 
      },
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    };

    const createRes = await fetch('http://localhost:8080/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProvider)
    });

    if (!createRes.ok) throw new Error('Fallo al guardar el colaborador');
    const createdProvider = await createRes.json();
    return NextResponse.json(createdProvider, { status: 201 });

  } catch (error) {
    console.error("ERROR AL CREAR SOLICITUD DE COLABORADOR:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const coordinador_id = searchParams.get('coordinador_id');
    
    // ✨ Definimos la URL dinámica una sola vez
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