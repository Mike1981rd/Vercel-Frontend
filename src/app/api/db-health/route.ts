import { NextResponse } from 'next/server'

// Health check that proxies the backend API health endpoint instead of Supabase
export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'

  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/health`, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ ok: false, error: 'Backend health endpoint returned non-OK' }, { status: 502 })
    }
    const data = await res.json().catch(() => null)
    const ok = !!data && (data.status === 'healthy' || data.database?.connected === true)
    return NextResponse.json({ ok })
  } catch (error) {
    console.error('Database health check failed:', error)
    return NextResponse.json({ ok: false, error: 'Backend unreachable' }, { status: 500 })
  }
}
