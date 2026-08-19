// src/app/api/auth/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { usuario, password } = body; 

    const res = await fetch(`http://localhost:8080/users?email=${usuario}`);
    const users = await res.json();

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const user = users[0];

    if (user.password !== password) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);

    // ✨ EL PAYLOAD PERFECTO (Adaptado a las exigencias de tu AuthContext)
    const payloadObj = {
        id: Number(user.id), 
        sub: String(user.id), // 👈 CRÍTICO: Tu context busca jwtData.sub
        name: `${user.first_name} ${user.last_name}`, // 👈 CRÍTICO: Tu context busca jwtData.name
        email: user.email,
        nombre: `${user.first_name} ${user.last_name}`,
        nombres: user.first_name,
        apellidos: user.last_name,
        rol: user.rol,
        roles: user.roles,
        Roles: user.roles, 
        facultad: user.facultad,
        codigo_proveedor: null,
        v1: { 
          userID: String(user.id), // 👈 CRÍTICO: O busca v1Data.userID
          roles: user.roles 
        }, 
        iat: nowInSeconds,                   
        exp: nowInSeconds + (60 * 60 * 24),  
    };
    
    const payloadStr = JSON.stringify(payloadObj);
    let base64Payload = btoa(unescape(encodeURIComponent(payloadStr)));
    base64Payload = base64Payload.replace(/\+/g, '-').replace(/\//g, '_');

    const fakeHeader = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"; 
    const mockToken = `${fakeHeader}.${base64Payload}.FirmaMocKTesis12345`;

    return NextResponse.json({
      success: true,
      token: mockToken, 
      access_token: mockToken,
      jwt: mockToken,
      user: payloadObj, 
      ...payloadObj     
    });

  } catch (error) {
    console.error("ERROR CRITICO EN API LOGIN:", error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}