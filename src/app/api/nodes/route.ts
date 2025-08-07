import { NextRequest, NextResponse } from 'next/server'
import { nodeService } from '@/lib/services/node-service'
import { handleError, formatErrorResponse, logError } from '@/lib/utils/errors'

// GET /api/nodes - Get all nodes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type')
    const level = searchParams.get('level')
    const parentId = searchParams.get('parentId')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search')
    // 地理空间查询参数
    const bbox = searchParams.get('bbox')
    const intersects = searchParams.get('intersects')
    const within = searchParams.get('within')

    const params: any = {
      page,
      limit
    }

    if (type) {
      params.type = type
    }

    if (level) {
      params.level = parseInt(level)
    }

    if (parentId) {
      params.parentId = parentId
    }

    if (isActive !== null) {
      params.isActive = isActive === 'true'
    }

    if (search) {
      params.search = search
    }

    // 地理空间查询参数
    if (bbox) {
      params.bbox = bbox
    }

    if (intersects) {
      params.intersects = intersects
    }

    if (within) {
      params.within = within
    }

    const result = await nodeService.getNodes(params)

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

// POST /api/nodes - Create new node
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, name, type, level, description, apiUrl, adminUrl, coverage, isActive, parentId, latitude, longitude } = body

    // Convert empty strings to null for optional fields
    const processedData = {
      code,
      name,
      type,
      level,
      description: description || null,
      apiUrl,
      adminUrl: adminUrl || null,
      coverage: coverage || null,
      isActive: isActive !== undefined ? isActive : true,
      parentId: parentId || null,
      latitude: latitude && latitude.trim() !== '' ? parseFloat(latitude) : null,
      longitude: longitude && longitude.trim() !== '' ? parseFloat(longitude) : null
    }

    const result = await nodeService.createNode(processedData)

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