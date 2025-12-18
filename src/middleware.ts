// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Actualizamos el tipo para que coincida con tu interfaz User (rol en español)
// OJO: Asegúrate de que los valores ('admin', 'visitante') sean los mismos que usas en la DB
type UserRole = 'admin' | 'coordinador' | 'proveedor' | 'visitante' | null;

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth');
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {

    if (!authCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      // ✨ CORRECCIÓN: Leemos 'rol' en lugar de 'role'
      const userData = JSON.parse(authCookie.value);
      const userRole = userData.rol as UserRole; 
      
      // Verificamos el rol
      if (userRole === 'admin' || userRole === 'coordinador') {
        return NextResponse.next();
      } else {
        // Si no es admin, lo mandamos al inicio
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
      // Si falla el parseo, redirigir
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};