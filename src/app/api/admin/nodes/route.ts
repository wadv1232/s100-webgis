import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler, withApiHandler } from '@/lib/api-error'

interface CreateNodeRequest {
  node_id: string
  node_name: string
  initial_coverage: {
    type: string
    coordinates: number[][][]
  }
  required_products?: string[]
  description?: string
  level?: number
  parent_id?: string
}

interface CreateNodeResponse {
  nodeId: string
  nodeName: string
  apiKey: string
  status: 'created' | 'failed'
  message?: string
}

// 生成随机API密钥
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = 'sk-'
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 验证GeoJSON格式
function validateGeoJSON(coverage: any): { valid: boolean; error?: string } {
  if (!coverage || typeof coverage !== 'object') {
    return { valid: false, error: 'Coverage must be an object' }
  }

  if (coverage.type !== 'Polygon') {
    return { valid: false, error: 'Only Polygon type is supported' }
  }

  if (!Array.isArray(coverage.coordinates) || coverage.coordinates.length === 0) {
    return { valid: false, error: 'Coordinates must be an array with at least one ring' }
  }

  const rings = coverage.coordinates
  for (let i = 0; i < rings.length; i++) {
    const ring = rings[i]
    if (!Array.isArray(ring) || ring.length < 4) {
      return { valid: false, error: `Ring ${i} must have at least 4 coordinates` }
    }

    for (let j = 0; j < ring.length; j++) {
      const coord = ring[j]
      if (!Array.isArray(coord) || coord.length !== 2) {
        return { valid: false, error: `Coordinate ${j} in ring ${i} must have exactly 2 values` }
      }

      const [lng, lat] = coord
      if (typeof lng !== 'number' || typeof lat !== 'number') {
        return { valid: false, error: `Coordinate ${j} in ring ${i} must be numbers` }
      }

      // 基本范围检查
      if (lng < -180 || lng > 180) {
        return { valid: false, error: `Longitude ${lng} is out of range (-180 to 180)` }
      }
      if (lat < -90 || lat > 90) {
        return { valid: false, error: `Latitude ${lat} is out of range (-90 to 90)` }
      }
    }

    // 检查环是否闭合
    const firstCoord = ring[0]
    const lastCoord = ring[ring.length - 1]
    if (firstCoord[0] !== lastCoord[0] || firstCoord[1] !== lastCoord[1]) {
      return { valid: false, error: `Ring ${i} must be closed (first and last coordinates must be the same)` }
    }
  }

  return { valid: true }
}

const createNodeHandler = withApiHandler(async (request: NextRequest): Promise<NextResponse> => {
  const body: CreateNodeRequest = await request.json()

  // 验证必需字段
  if (!body.node_id || !body.node_name || !body.initial_coverage) {
    return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
      required: ['node_id', 'node_name', 'initial_coverage'],
      provided: Object.keys(body)
    })
  }

  // 验证节点ID格式
  if (typeof body.node_id !== 'string' || body.node_id.length < 3) {
    return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
      field: 'node_id',
      message: 'node_id must be a string with at least 3 characters'
    })
  }

  // 验证节点名称
  if (typeof body.node_name !== 'string' || body.node_name.length < 2) {
    return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
      field: 'node_name',
      message: 'node_name must be a string with at least 2 characters'
    })
  }

  // 验证GeoJSON覆盖范围
  const coverageValidation = validateGeoJSON(body.initial_coverage)
  if (!coverageValidation.valid) {
    return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
      field: 'initial_coverage',
      message: coverageValidation.error
    })
  }

  // 验证必需产品类型
  if (body.required_products) {
    if (!Array.isArray(body.required_products)) {
      return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
        field: 'required_products',
        message: 'required_products must be an array'
      })
    }

    const validProducts = ['S101', 'S102', 'S104', 'S111', 'S124', 'S131']
    const invalidProducts = body.required_products.filter(p => !validProducts.includes(p))
    if (invalidProducts.length > 0) {
      return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
        field: 'required_products',
        message: `Invalid product types: ${invalidProducts.join(', ')}. Valid types: ${validProducts.join(', ')}`
      })
    }
  }

  // 检查节点ID是否已存在
  const existingNode = await db.node.findUnique({
    where: { id: body.node_id }
  })

  if (existingNode) {
    return ApiErrorHandler.createErrorResponse('NODE_ALREADY_EXISTS', {
      node_id: body.node_id
    })
  }

  // 如果指定了父节点，验证父节点是否存在
  if (body.parent_id) {
    const parentNode = await db.node.findUnique({
      where: { id: body.parent_id }
    })

    if (!parentNode) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', {
        parent_id: body.parent_id
      })
    }
  }

  // 生成API密钥
  const apiKey = generateApiKey()

  try {
    // 创建新节点
    const newNode = await db.node.create({
      data: {
        id: body.node_id,
        name: body.node_name,
        description: body.description || `${body.node_name} service node`,
        type: 'LEAF', // 默认创建叶子节点
        level: body.level || 3, // 默认叶子节点级别
        coverage: JSON.stringify(body.initial_coverage),
        isActive: true,
        healthStatus: 'UNKNOWN',
        parentId: body.parent_id,
        // 可以添加其他必要字段
      }
    })

    // 如果指定了必需产品，创建对应的策略记录
    if (body.required_products && body.required_products.length > 0) {
      // 这里可以创建节点策略记录，暂时跳过，因为数据库schema可能需要更新
    }

    // 记录创建日志
    console.log(`Node created: ${newNode.id} (${newNode.name})`)

    const response: CreateNodeResponse = {
      nodeId: newNode.id,
      nodeName: newNode.name,
      apiKey,
      status: 'created',
      message: 'Node created successfully'
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Error creating node:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', {
      operation: 'create_node',
      node_id: body.node_id
    })
  }
})

export { createNodeHandler as POST }
export async function GET(request: NextRequest) {
  try {
    // 获取节点列表，支持分页和过滤
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const parentId = searchParams.get('parent_id')
    const level = searchParams.get('level')

    const skip = (page - 1) * limit

    const whereClause: any = {}
    if (parentId) {
      whereClause.parentId = parentId
    }
    if (level) {
      whereClause.level = parseInt(level)
    }

    const [nodes, total] = await Promise.all([
      db.node.findMany({
        where: whereClause,
        include: {
          parent: {
            select: {
              id: true,
              name: true
            }
          },
          children: {
            select: {
              id: true,
              name: true
            }
          },
          capabilities: {
            select: {
              productType: true,
              serviceType: true,
              isEnabled: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: [
          { level: 'asc' },
          { name: 'asc' }
        ]
      }),
      db.node.count({ where: whereClause })
    ])

    return NextResponse.json({
      nodes: nodes.map(node => ({
        ...node,
        coverage: node.coverage ? JSON.parse(node.coverage as string) : null,
        capabilities: node.capabilities.map(cap => ({
          productType: cap.productType,
          serviceType: cap.serviceType,
          isEnabled: cap.isEnabled
        }))
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching nodes:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR')
  }
}