// src/app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Atrapamos el FormData que mandó tu auth-service.js
    const formData = await request.formData();

    // Extraemos los valores exactos que agregaste con "append"
    const cedula = formData.get('cedula');
    const nombres = formData.get('nombres');
    const apellidos = formData.get('apellidos');
    const email = formData.get('email');
    const password = formData.get('password');
    const fecha_de_nacimiento = formData.get('fecha_de_nacimiento');
    const genero = formData.get('genero');
    const nivel_educativo = formData.get('nivel_educativo');
    const direccion = formData.get('direccion');
    const rol = formData.get('rol') || 'visitante';

    // 2. Simulamos la validación de Go: Revisar que no haya duplicados
    const resEmail = await fetch(`http://localhost:8080/users?email=${email}`);
    const usersByEmail = await resEmail.json();
    
    // Asumiendo que la llave en tu db.json es "ci"
    const resCedula = await fetch(`http://localhost:8080/users?ci=${cedula}`);
    const usersByCedula = await resCedula.json();

    if (usersByEmail.length > 0 || usersByCedula.length > 0) {
      // Mandamos el 409 y la frase exacta que busca el catch de tu auth-service.js
      return NextResponse.json(
        { error: 'user already exists' }, 
        { status: 409 }
      );
    }

    // 3. Traducimos las llaves del FormData a las llaves que usa tu db.json
    const newUser = {
      ci: Number(cedula),
      email: String(email),
      password: String(password),
      first_name: String(nombres),
      last_name: String(apellidos),
      date_of_birth: String(fecha_de_nacimiento),
      gender: String(genero),
      education: String(nivel_educativo),
      address: String(direccion),
      rol: String(rol),
      roles: [String(rol)], 
      facultad: null,
      codigo_proveedor: null
    };

    // 4. Guardamos el nuevo usuario en el JSON Server
    // Al enviarle un POST sin la propiedad "id", JSON Server le creará un ID único automáticamente.
    const createRes = await fetch('http://localhost:8080/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newUser)
    });

    if (!createRes.ok) {
      throw new Error('Fallo al guardar en la base de datos de pruebas');
    }

    const createdUser = await createRes.json();

    // 5. Todo exitoso, devolvemos el usuario creado (Status 201 Created)
    return NextResponse.json(createdUser, { status: 201 });

  } catch (error) {
    console.error("ERROR CRÍTICO AL CREAR USUARIO:", error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}

// src/app/api/users/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rol = searchParams.get('rol');

    let url = 'http://localhost:8080/users';
    
    // Si nos pasan un rol, filtramos
    if (rol) {
      url += `?rol=${rol}`;
    }
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fallo al obtener usuarios');
    
    const users = await res.json();
    return NextResponse.json(users, { status: 200 });

  } catch (error) {
    console.error("ERROR AL OBTENER USUARIOS:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}