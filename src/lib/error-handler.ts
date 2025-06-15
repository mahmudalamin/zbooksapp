// lib/error-handler.ts
import { NextRequest } from 'next/server'
import { logger } from './logger'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }
}

export async function handleApiError(error: any, request: NextRequest) {
  const session = await getServerSession(authOptions)
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'

  await logger.error('API Error', error, {
    url: request.url,
    method: request.method,
    userId: session?.user?.id,
    userRole: session?.user?.role
  }, {
    userId: session?.user?.id,
    ip,
    userAgent
  })

  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  }

  // Database errors
  if (error.code === 'P2002') {
    return {
      error: 'A record with this data already exists',
      statusCode: 409
    }
  }

  if (error.code === 'P2025') {
    return {
      error: 'Record not found',
      statusCode: 404
    }
  }

  // Validation errors
  if (error.name === 'ZodError') {
    return {
      error: 'Validation failed',
      details: error.errors,
      statusCode: 400
    }
  }

  // Default error
  return {
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    statusCode: 500
  }
}

