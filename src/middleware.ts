import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas que no requieren autenticación
const publicPaths = ['/login', '/register', '/forgot-password'];

// Rutas que requieren autenticación
const protectedPaths = [
  '/dashboard',
  '/empresa',
  '/roles-usuarios',
  '/clientes',
  '/reservaciones',
  '/metodos-pago',
  '/colecciones',
  '/productos',
  '/paginas',
  '/politicas',
  '/website-builder',
  '/dominios'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Por ahora, solo redirigir de / a /login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Permitir todas las demás rutas sin verificación
  // La protección se maneja en el cliente con useAuth
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};