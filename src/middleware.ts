// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isAdminOrCoordinator, sessionFromToken } from '@/utils/session'

export function middleware(request: NextRequest) {
  // ✨ CORRECCIÓN: Buscamos nuestra cookie, o las clásicas que suele enviar Go
  const tokenCookie = request.cookies.get('auth_token') || request.cookies.get('jwt') || request.cookies.get('token');
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {

    if (!tokenCookie) {
      console.warn("[Middleware] Acceso denegado: No hay auth_token");
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }

    const session = sessionFromToken(tokenCookie.value);
    if (!session) {
      console.error("[Middleware] Token inválido");
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // Solo administradores (root, deu_admin) y coordinadores (faculty_admin).
    if (isAdminOrCoordinator(session)) {
      return NextResponse.next();
    }
    console.warn(`[Middleware] Rol insuficiente. Roles encontrados:`, session.roles);
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // ✨ CORRECCIÓN CRÍTICA: El matcher ahora protege "/admin" exacto y todo lo que le sigue
  matcher: ['/admin', '/admin/:path*'],
};