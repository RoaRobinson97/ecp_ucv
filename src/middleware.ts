// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // ✨ CORRECCIÓN 1: Buscamos la cookie correcta
  const tokenCookie = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {

    if (!tokenCookie) {
      console.warn("[Middleware] Acceso denegado: No hay auth_token");
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    try {
      // ✨ CORRECCIÓN 2: Decodificamos el JWT antes de parsearlo
      const token = tokenCookie.value;
      const parts = token.split('.');
      
      if (parts.length !== 3) {
         console.error("[Middleware] Token inválido");
         return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      // Decodificación segura para Edge Runtime
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const userData = JSON.parse(jsonPayload);
      const userRole = userData.rol; 
      
      // Verificamos el rol
      if (userRole === 'admin' || userRole === 'coordinador') {
        return NextResponse.next(); // ¡Pase usted!
      } else {
        console.warn(`[Middleware] Rol insuficiente: ${userRole}`);
        // Si no tiene permisos, lo mandamos al inicio
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
      console.error("[Middleware] Fallo al parsear el token:", e);
      // Si falla cualquier cosa (cookie corrupta, base64 inválido), lo pateamos al login
      return NextResponse.redirect(new URL('/login?error=corrupted_cookie', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};