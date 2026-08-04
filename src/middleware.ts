// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // ✨ CORRECCIÓN: Buscamos nuestra cookie, o las clásicas que suele enviar Go
  const tokenCookie = request.cookies.get('auth_token') || request.cookies.get('jwt') || request.cookies.get('token');
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
        
        // Buscamos los roles
        const userRoles = jwtData.roles || (jwtData.v1 ? jwtData.v1.roles : []) || []; 
        
        // Verificamos si es administrador
        if (userRoles.includes('deu_admin') || userRoles.includes('course_admin') || userRoles.includes('coordinador') || userRoles.includes('admin')) {
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
  // ✨ CORRECCIÓN CRÍTICA: El matcher ahora protege "/admin" exacto y todo lo que le sigue
  matcher: ['/admin', '/admin/:path*'],
};