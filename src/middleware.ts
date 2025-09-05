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
  const { pathname, hostname } = request.nextUrl;

  // Redirección inteligente de root según dominio
  if (pathname === '/') {
    const host = (hostname || '').toLowerCase();

    // Considerar dominios de administración (dev y vercel) para enviar a /login
    const isAdminHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'websitebuilder-admin.vercel.app' ||
      (host.startsWith('websitebuilder-admin-') && host.endsWith('.vercel.app'));

    // Si es host de admin → /login; si es dominio público (alias) → /home
    const target = isAdminHost ? '/login' : '/home';
    return NextResponse.redirect(new URL(target, request.url));
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
