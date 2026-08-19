// src/app/api/providers/route.ts
import { NextResponse } from 'next/server';
import { saveFileAndGetUrl } from '../utils/fileHandler';

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

      if (isUnderReview) return NextResponse.json({ error: 'Ya tienes una solicitud de proveedor en revisión.' }, { status: 409 });
      if (isApproved) return NextResponse.json({ error: 'Ya eres un proveedor aprobado.' }, { status: 409 });
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
    if (!logoFile || !ciFile || !rifFile || !islrFile || !resumesFile || !tituloFile) {
        return NextResponse.json({ error: 'Faltan documentos base requeridos.' }, { status: 400 });
    }
    const esJuridica = tipoPersona === 'juridical' || tipoPersona === 'juridica';
    if (esJuridica && !regMercantilFile) {
        return NextResponse.json({ error: 'Falta el Registro Mercantil obligatorio para personas jurídicas.' }, { status: 400 });
    }

    // 6. GUARDAMOS LOS ARCHIVOS
    const folderName = `providers/${userId}`;
    const logoUrl = await saveFileAndGetUrl(logoFile, folderName);
    const ciUrl = await saveFileAndGetUrl(ciFile, folderName);
    const rifUrl = await saveFileAndGetUrl(rifFile, folderName);
    const islrUrl = await saveFileAndGetUrl(islrFile, folderName);
    const resumesUrl = await saveFileAndGetUrl(resumesFile, folderName);
    const tituloUrl = await saveFileAndGetUrl(tituloFile, folderName);
    const regMercantilUrl = regMercantilFile ? await saveFileAndGetUrl(regMercantilFile, folderName) : null;

    // 7. ✨ CONSTRUIMOS EL JSON CON EL COORDINADOR
    const newProvider = {
      usuario_id: userId,
      coordinador_id: coordinadorId, // 🔥 SE GUARDA LA FACULTAD
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
      fecha_creacion: new Date().toISOString()
    };

    const createRes = await fetch('http://localhost:8080/providers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProvider)
    });

    if (!createRes.ok) throw new Error('Fallo al guardar el proveedor');
    const createdProvider = await createRes.json();
    return NextResponse.json(createdProvider, { status: 201 });

  } catch (error) {
    console.error("ERROR AL CREAR SOLICITUD DE PROVEEDOR:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('usuario_id');
    
    // ✨ AGREGAMOS SOPORTE PARA FILTRAR POR COORDINADOR
    const coordinadorId = searchParams.get('coordinador_id');
    
    let url = 'http://localhost:8080/providers';
    const query = new URLSearchParams();

    if (userId) query.append('usuario_id', userId);
    if (coordinadorId) query.append('coordinador_id', coordinadorId);

    const queryString = query.toString();
    if (queryString) {
       url += `?${queryString}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fallo al obtener proveedores');
    
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
    
  } catch (error) {
    console.error("ERROR AL OBTENER PROVEEDORES:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}