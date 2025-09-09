'use server';

import { NextRequest, NextResponse } from 'next/server';

// Domains considered admin/dev where we should NOT set x-company-id
const ADMIN_HOSTS = ['localhost', '127.0.0.1', 'websitebuilder-admin', 'vercel.app'];

function isAdminHost(host: string): boolean {
  const lower = host.toLowerCase();
  return ADMIN_HOSTS.some(h => lower === h || lower.endsWith(`.${h}`));
}

// Attempt to resolve companyId from multiple sources
function resolveCompanyId(req: NextRequest): string | null {
  // 1) Header already present (proxy or platform)
  const headerVal = req.headers.get('x-company-id');
  if (headerVal && /^\d+$/.test(headerVal)) return headerVal;

  const host = req.headers.get('host') || '';
  if (!host) return null;

  // 2) Environment mapping DOMAIN_COMPANY_MAP (JSON object: {"domain.com": 1, "www.domain.com": 1})
  const envMap = process.env.DOMAIN_COMPANY_MAP || process.env.NEXT_PUBLIC_DOMAIN_COMPANY_MAP;
  if (envMap) {
    try {
      const map = JSON.parse(envMap) as Record<string, number | string>;
      // Exact host match first
      if (map[host] && String(map[host]).match(/^\d+$/)) return String(map[host]);
      // Try without port
      const noPort = host.split(':')[0];
      if (map[noPort] && String(map[noPort]).match(/^\d+$/)) return String(map[noPort]);
      // Try without www
      if (noPort.startsWith('www.')) {
        const bare = noPort.slice(4);
        if (map[bare] && String(map[bare]).match(/^\d+$/)) return String(map[bare]);
      }
    } catch {}
  }

  // 3) Cookie (optional)
  const cookieId = req.cookies.get('companyId')?.value;
  if (cookieId && /^\d+$/.test(cookieId)) return cookieId;

  return null;
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get('host') || '').toLowerCase();
  if (!host || isAdminHost(host)) {
    return NextResponse.next();
  }

  // For custom domains, ensure x-company-id is present to satisfy rewrites
  const companyId = resolveCompanyId(req);
  if (companyId) {
    const res = NextResponse.next({ request: { headers: req.headers } });
    res.headers.set('x-company-id', companyId);
    // Also set a cookie to help client-side fetches
    res.cookies.set('companyId', companyId, { path: '/', httpOnly: false });
    return res;
  }

  // No mapping available -> proceed without header (pages may fallback), but we set no-store to avoid caching wrong content
  const res = NextResponse.next({ request: { headers: req.headers } });
  res.headers.set('cache-control', 'no-store');
  return res;
}

export const config = {
  // Run on all pages
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

