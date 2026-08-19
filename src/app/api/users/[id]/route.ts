// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';

// En Next.js 15, params es una promesa
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;

    // Buscamos al usuario en nuestra base de datos (db.json)
    const res = await fetch(`http://localhost:8080/users/${userId}`);
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userData = await res.json();
    return NextResponse.json(userData, { status: 200 });

  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

