import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Verify connection with a simple query to Companies table
    const { data, error } = await supabase
      .from('Companies')
      .select('Id')
      .limit(1)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Database health check failed:', error)
    return NextResponse.json({ ok: false, error: 'Database connection failed' }, { status: 500 })
  }
}