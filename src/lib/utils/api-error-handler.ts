/**
 * API Route Error Handler Utilities
 * Provides standardized error handling for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { handleError, formatErrorResponse, logError, AppError } from '@/lib/utils/errors'

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  message?: string
}

/**
 * API Route Handler type
 */
export type ApiHandler<T = any> = (
  request: NextRequest,
  context?: any
) => Promise<T>

/**
 * Success response helper
 */
export function successResponse<T = any>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message
  }

  return NextResponse.json(response, { status })
}

/**
 * Error response helper
 */
export function errorResponse(
  error: AppError | Error | any,
  context?: any
): NextResponse {
  const appError = handleError(error)
  logError(appError, context)

  return NextResponse.json(
    formatErrorResponse(appError),
    { status: appError.statusCode }
  )
}

/**
 * Validation error helper
 */
export function validationError(
  message: string,
  details?: any,
  context?: any
): NextResponse {
  const error = new Error(message)
  const appError = handleError(error)
  appError.statusCode = 400
  appError.code = 'VALIDATION_ERROR'
  appError.details = details

  logError(appError, context)
  return NextResponse.json(
    formatErrorResponse(appError),
    { status: 400 }
  )
}

/**
 * Not found error helper
 */
export function notFoundError(
  resource: string,
  context?: any
): NextResponse {
  const error = new Error(`${resource} not found`)
  const appError = handleError(error)
  appError.statusCode = 404
  appError.code = 'NOT_FOUND'

  logError(appError, context)
  return NextResponse.json(
    formatErrorResponse(appError),
    { status: 404 }
  )
}

/**
 * Conflict error helper
 */
export function conflictError(
  message: string,
  context?: any
): NextResponse {
  const error = new Error(message)
  const appError = handleError(error)
  appError.statusCode = 409
  appError.code = 'CONFLICT_ERROR'

  logError(appError, context)
  return NextResponse.json(
    formatErrorResponse(appError),
    { status: 409 }
  )
}

/**
 * Unauthorized error helper
 */
export function unauthorizedError(
  message: string = 'Unauthorized',
  context?: any
): NextResponse {
  const error = new Error(message)
  const appError = handleError(error)
  appError.statusCode = 401
  appError.code = 'UNAUTHORIZED'

  logError(appError, context)
  return NextResponse.json(
    formatErrorResponse(appError),
    { status: 401 }
  )
}

/**
 * Forbidden error helper
 */
export function forbiddenError(
  message: string = 'Forbidden',
  context?: any
): NextResponse {
  const error = new Error(message)
  const appError = handleError(error)
  appError.statusCode = 403
  appError.code = 'FORBIDDEN'

  logError(appError, context)
  return NextResponse.json(
    formatErrorResponse(appError),
    { status: 403 }
  )
}

/**
 * API Route wrapper with error handling
 */
export function withErrorHandling<T = any>(
  handler: ApiHandler<T>
): ApiHandler<T> {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return errorResponse(error, {
        url: request.url,
        method: request.method,
        context
      })
    }
  }
}

/**
 * API Route wrapper with authentication check
 */
export function withAuth<T = any>(
  handler: ApiHandler<T>,
  options: {
    requiredRoles?: string[]
    requireAuth?: boolean
  } = {}
): ApiHandler<T> {
  const { requiredRoles = [], requireAuth = true } = options

  return async (request: NextRequest, context?: any) => {
    try {
      // Check authentication (simplified for now)
      if (requireAuth) {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return unauthorizedError('Authentication required', {
            url: request.url,
            method: request.method
          })
        }

        // In a real app, you would validate the JWT token here
        // const token = authHeader.substring(7)
        // const user = await validateToken(token)
        // if (!user) {
        //   return unauthorizedError('Invalid token', {
        //     url: request.url,
        //     method: request.method
        //   })
        // }

        // Check role requirements
        // if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        //   return forbiddenError('Insufficient permissions', {
        //     url: request.url,
        //     method: request.method
        //   })
        // }
      }

      return await handler(request, context)
    } catch (error) {
      return errorResponse(error, {
        url: request.url,
        method: request.method,
        context
      })
    }
  }
}

/**
 * Request body validation helper
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: {
    parse: (data: any) => T
  }
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`)
    }
    throw error
  }
}

/**
 * Query parameter validation helper
 */
export function validateQueryParams(
  request: NextRequest,
  requiredParams: string[] = []
): { valid: boolean; error?: string; params: Record<string, string> } {
  const { searchParams } = new URL(request.url)
  const params: Record<string, string> = {}
  
  // Convert all params to strings
  searchParams.forEach((value, key) => {
    params[key] = value
  })

  // Check required parameters
  const missingParams = requiredParams.filter(param => !params[param])
  
  if (missingParams.length > 0) {
    return {
      valid: false,
      error: `Missing required parameters: ${missingParams.join(', ')}`,
      params
    }
  }

  return { valid: true, params }
}

/**
 * Rate limiting helper (simplified)
 */
export function checkRateLimit(
  request: NextRequest,
  options: {
    maxRequests?: number
    windowMs?: number
    keyGenerator?: (req: NextRequest) => string
  } = {}
): { allowed: boolean; error?: string } {
  const {
    maxRequests = 100,
    windowMs = 60 * 1000, // 1 minute
    keyGenerator = (req) => req.ip || req.headers.get('x-forwarded-for') || 'unknown'
  } = options

  // In a real app, you would use Redis or similar for distributed rate limiting
  // This is a simplified in-memory version
  const key = keyGenerator(request)
  const now = Date.now()
  
  // For now, just allow all requests
  // In production, implement proper rate limiting
  return { allowed: true }
}

/**
 * CORS helper
 */
export function corsResponse(
  response: NextResponse,
  options: {
    origin?: string
    methods?: string[]
    headers?: string[]
    credentials?: boolean
  } = {}
): NextResponse {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers = ['Content-Type', 'Authorization'],
    credentials = false
  } = options

  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Methods', methods.join(', '))
  response.headers.set('Access-Control-Allow-Headers', headers.join(', '))
  
  if (credentials) {
    response.headers.set('Access-Control-Allow-Credentials', 'true')
  }

  return response
}

/**
 * OPTIONS handler for CORS preflight
 */
export function optionsHandler(): NextResponse {
  return corsResponse(new NextResponse(null, { status: 200 }))
}