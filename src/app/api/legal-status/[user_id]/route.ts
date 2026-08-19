// src/app/api/legal-status/[user_id]/route.ts
import { NextResponse } from 'next/server';
import { saveFileAndGetUrl } from '../../utils/fileHandler'; 

// ✨ FIX: Función de respiro para que el json-server no colapse al escribir el archivo
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function POST(
    request: Request,
    { params }: { params: Promise<{ user_id: string }> }
) {
    const { user_id } = await params;

    try {
        // 1. Buscamos el proveedor asociado a este usuario en la BD
        const provRes = await fetch(`http://localhost:8080/providers?usuario_id=${user_id}`);
        const provData = await provRes.json();
        
        if (!provData || provData.length === 0) {
            return NextResponse.json({ error: 'Proveedor no encontrado' }, { status: 404 });
        }
        
        const provider = provData[0]; 

        // 2. Leemos la petición del Frontend
        const formData = await request.formData();
        const hasInitialContract = formData.get('hasInitialContract') === 'true';
        
        const cursosAmparadosStr = formData.get('cursos_amparados') as string || "";
        const cursosAmparados = cursosAmparadosStr.split(',').map(id => id.trim()).filter(Boolean);

        const folderName = `legal/${user_id}`;
        
        // Inicializamos el objeto legal anidado si no existe
        let legalStatus = provider.legal_status || { tiene_carta_intencion: false, adendas: [] };
        let documentoLegalIdGenerado = "";

        // 3A. BAUTIZO INICIAL (Cartas)
        if (!hasInitialContract) {
            const cartaIntencion = formData.get('carta_intencion') as File;
            const cartaCompromiso = formData.get('carta_compromiso') as File;

            if (!cartaIntencion || !cartaCompromiso) {
                return NextResponse.json({ error: 'Faltan documentos iniciales' }, { status: 400 });
            }

            legalStatus.tiene_carta_intencion = true;
            legalStatus.carta_intencion_url = await saveFileAndGetUrl(cartaIntencion, folderName);
            legalStatus.carta_compromiso_url = await saveFileAndGetUrl(cartaCompromiso, folderName);
            if (!legalStatus.adendas) legalStatus.adendas = [];
            
            documentoLegalIdGenerado = `INTENCION-${user_id}`;
        } 
        // 3B. ADENDA (Cursos nuevos)
        else {
            const adendaFile = formData.get('adenda') as File;
            if (!adendaFile) {
                return NextResponse.json({ error: 'Falta el archivo de la adenda' }, { status: 400 });
            }

            const cartaCompromisoAdenda = formData.get('carta_compromiso_adenda') as File | null;
            let compromisoUrl = null;
            if (cartaCompromisoAdenda) {
                compromisoUrl = await saveFileAndGetUrl(cartaCompromisoAdenda, folderName);
            }

            const adendaId = `ADENDA-${Date.now()}`;
            legalStatus.adendas.push({
                id_adenda: adendaId,
                archivo_url: await saveFileAndGetUrl(adendaFile, folderName),
                compromiso_url: compromisoUrl, 
                fecha: new Date().toISOString(),
                cursos_amparados: cursosAmparados
            });
            
            documentoLegalIdGenerado = adendaId;
        }

        // 4. ACTUALIZAMOS EL PROVEEDOR EN LA BD
        const updatedProvider = { ...provider, legal_status: legalStatus };
        await fetch(`http://localhost:8080/providers/${provider.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProvider)
        });

        await delay(100);

        // 5. LIBERAMOS LOS CURSOS (✨ CORRECCIÓN: Buscando en ambas tablas)
        for (const cursoId of cursosAmparados) {
            
            // Preparamos el payload (inyectando ambas llaves para máxima compatibilidad)
            const patchPayload = JSON.stringify({
                contrato_id: documentoLegalIdGenerado,
                documento_legal_id: documentoLegalIdGenerado,
                estado: 'cerrado', // Lo cambié a aprobado para mantener la coherencia semántica
                estado_gestion: 'cerrado' 
            });

            // Intento 1: Actualizar en course-requests (donde suelen estar los nuevos)
            let res = await fetch(`http://localhost:8080/course-requests/${cursoId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: patchPayload
            });

            // Intento 2: Si no estaba en requests, actualizamos en courses
            if (!res.ok) {
                await fetch(`http://localhost:8080/courses/${cursoId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: patchPayload
                });
            }

            await delay(100);
        }

        return NextResponse.json({ message: 'Documentación guardada en el perfil del proveedor' }, { status: 200 });

    } catch (error) {
        console.error("Error en legal POST:", error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}