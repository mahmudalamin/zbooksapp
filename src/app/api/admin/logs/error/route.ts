// app/api/admin/logs/error/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error, stack, componentStack } = await request.json()
    
    await logger.error('Frontend Error', new Error(error), {
      stack,
      componentStack,
      url: request.headers.get('referer')
    }, {
      userId: session.user.id,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to log frontend error:', error)
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 })
  }
}

