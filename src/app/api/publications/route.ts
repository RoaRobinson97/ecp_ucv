// src/app/api/publications/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('course_id');
        const cohortId = searchParams.get('cohort_id'); // ✨ NUEVO: Atrapamos el ID de la cohorte

        let url = 'http://localhost:8080/publications?';
        
        if (courseId) url += `course_id=${courseId}&`;
        if (cohortId) url += `cohort_id=${cohortId}`; // ✨ NUEVO: Filtro directo en BD

        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error('Fallo al obtener publicaciones');

        const data = await res.json();
        return NextResponse.json(data, { status: 200 });

    } catch (error: any) {
        console.error("🔴 Error obteniendo publicaciones:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // ... tu código POST se mantiene exactamente igual ...
    try {
        const body = await request.json();
        const res = await fetch('http://localhost:8080/publications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorBackend = await res.text();
            throw new Error(`json-server respondió con error: ${res.status}`);
        }

        const savedPublication = await res.json();
        return NextResponse.json(savedPublication, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
    }
}