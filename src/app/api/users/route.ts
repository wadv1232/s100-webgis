import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/services/user-service'
import { handleError, formatErrorResponse, logError } from '@/lib/utils/errors'

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role')
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')

    const params: any = {
      page,
      limit,
      search
    }

    if (role) {
      params.role = role
    }

    if (isActive !== null) {
      params.isActive = isActive === 'true'
    }

    const result = await userService.getUsers(params)

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    const appError = handleError(error)
    logError(appError, { url: request.url, method: 'GET' })
    
    return NextResponse.json(
      formatErrorResponse(appError),
      { status: appError.statusCode }
    )
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, name, role, nodeId, isActive, permissions } = body

    const result = await userService.createUser({
      email,
      username,
      name,
      role,
      nodeId,
      isActive,
      permissions: permissions || []
    })

    return NextResponse.json({
      success: true,
      data: result
    }, { status: 201 })
  } catch (error) {
    const appError = handleError(error)
    logError(appError, { url: request.url, method: 'POST' })
    
    return NextResponse.json(
      formatErrorResponse(appError),
      { status: appError.statusCode }
    )
  }
}