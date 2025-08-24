import { NextResponse } from 'next/server'
import { healthCheck } from '@/lib/db-utils'

export async function GET() {
  try {
    const dbStatus = await healthCheck()
    
    return NextResponse.json({
      success: true,
      database: dbStatus,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
