// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const tokenCookie = request.cookies.get('auth_token');
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {

    if (!tokenCookie) {
      console.warn("[Middleware] Acceso denegado: No hay auth_token");
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    try {
      const token = tokenCookie.value;
      const parts = token.split('.');
      
      if (parts.length !== 3) {
         console.error("[Middleware] Token inválido");
         return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
      }

      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const jwtData = JSON.parse(jsonPayload);
      
      // ✨ CORRECCIÓN: Leemos de 'v1' exactamente igual que en el Context
      const v1Data = jwtData.v1 || {};
      const userRoles = v1Data.roles || []; 
      
      // ✨ CORRECCIÓN: Agregamos 'course_admin' a la puerta de seguridad
      if (userRoles.includes('course_admin') || userRoles.includes('coordinador') || userRoles.includes('admin')) {
        return NextResponse.next(); 
      } else {
        console.warn(`[Middleware] Rol insuficiente. Roles encontrados:`, userRoles);
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (e) {
      console.error("[Middleware] Fallo al parsear el token:", e);
      return NextResponse.redirect(new URL('/login?error=corrupted_cookie', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};