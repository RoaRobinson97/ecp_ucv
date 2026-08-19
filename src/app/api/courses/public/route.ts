// src/app/api/courses/public/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = Number(searchParams.get('limit')) || 15;

        const res = await fetch('http://localhost:8080/courses', { cache: 'no-store' });
        if (!res.ok) throw new Error('Fallo al obtener cursos de la BD');

        const allCourses = await res.json();

        // FILTRO ESTRICTO EN EL BACKEND
        const publicCourses = allCourses.filter((c: any) => {
            const hasContract = !!(c.documento_legal_id || c.contrato_id);
            const status = String(c.estado_gestion || c.estado).toLowerCase();
            return hasContract && (status === 'abierto' || status === 'cerrado');
        });

        // MAPEO Y FORMATEO DE RUTAS DESDE LA API
        const adaptedCourses = publicCourses.slice(0, limit).map((c: any) => {
            let imgUrl = c.image_url || c.imagen || c.cover || null;
            if (imgUrl && imgUrl.startsWith('/')) {
                imgUrl = `http://localhost:8080${imgUrl}`;
            }

            return {
                id: String(c.id),
                titulo: c.titulo || c.nombre || "Curso Sin Título",
                descripcion: c.descripcion || c.fundamentacion || "",
                image: imgUrl,
                estado_gestion: c.estado || c.estado_gestion || 'pendiente',
                documento_legal_id: c.contrato_id || c.documento_legal_id || null 
            };
        });

        return NextResponse.json(adaptedCourses, { status: 200 });

    } catch (error) {
        console.error("🔴 Error en Endpoint Público de Cursos:", error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}