import { NextResponse } from 'next/server'
export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5266/api'
  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, '')}/health`, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 })
    const data = await res.json().catch(() => null)
    const ok = !!data && (data.status === 'healthy' || data.database?.connected === true)
    return NextResponse.json({ ok })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
