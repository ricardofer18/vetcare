import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const isAuthPage = request.nextUrl.pathname === '/login';
  const isPublicPath = request.nextUrl.pathname === '/login' || 
                      request.nextUrl.pathname.startsWith('/_next') ||
                      request.nextUrl.pathname.startsWith('/api');

  // Si es una ruta pública, permitir el acceso
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Si no hay sesión y no es una ruta pública, redirigir a login
  if (!session && !isPublicPath) {
    console.log('No hay sesión, redirigiendo a login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Si hay sesión y está en la página de login, redirigir al dashboard
  if (session && isAuthPage) {
    console.log('Hay sesión, redirigiendo a dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 