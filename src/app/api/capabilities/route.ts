import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { NodeType, ServiceType } from '@prisma/client'
import { handleError, formatErrorResponse, logError } from '@/lib/utils/errors'

// 获取系统服务能力探索
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bbox = searchParams.get('bbox')
    const productType = searchParams.get('productType')
    const serviceType = searchParams.get('serviceType')
    const nodeId = searchParams.get('nodeId')

    // 构建查询条件
    let whereClause: any = {}
    
    if (nodeId) {
      whereClause.nodeId = nodeId
    }
    
    if (productType) {
      whereClause.productType = productType
    }
    
    if (serviceType) {
      whereClause.serviceType = serviceType
    }

    // 获取服务能力
    const capabilities = await db.capability.findMany({
      where: {
        ...whereClause,
        isEnabled: true
      },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true,
            level: true,
            apiUrl: true,
            coverage: true
          }
        }
      },
      orderBy: [
        { node: { level: 'asc' } },
        { productType: 'asc' },
        { serviceType: 'asc' }
      ]
    })

    // 如果指定了边界框，进行空间过滤
    let filteredCapabilities = capabilities
    if (bbox) {
      const [minX, minY, maxX, maxY] = bbox.split(',').map(Number)
      
      filteredCapabilities = capabilities.filter(capability => {
        if (!capability.node.coverage) return false
        
        try {
          // 在实际项目中应该使用空间数据库查询
          // 这里简化处理，假设所有节点都在查询范围内
          return true
        } catch (error) {
          console.error('解析覆盖范围失败:', error)
          return false
        }
      })
    }

    // 按产品类型和服务类型分组统计
    const stats = {
      totalCapabilities: filteredCapabilities.length,
      byProduct: {} as Record<string, number>,
      byService: {} as Record<string, number>,
      byNode: {} as Record<string, number>,
      byNodeType: {
        GLOBAL_ROOT: 0,
        NATIONAL: 0,
        REGIONAL: 0,
        LEAF: 0
      }
    }

    filteredCapabilities.forEach(capability => {
      // 按产品类型统计
      stats.byProduct[capability.productType] = (stats.byProduct[capability.productType] || 0) + 1
      
      // 按服务类型统计
      stats.byService[capability.serviceType] = (stats.byService[capability.serviceType] || 0) + 1
      
      // 按节点统计
      stats.byNode[capability.nodeId] = (stats.byNode[capability.nodeId] || 0) + 1
      
      // 按节点类型统计
      stats.byNodeType[capability.node.type as keyof typeof stats.byNodeType]++
    })

    // 生成服务能力矩阵
    const serviceMatrix = generateServiceMatrix(filteredCapabilities)

    // 获取可用的产品和服务类型
    const availableProducts = [...new Set(filteredCapabilities.map(c => c.productType))]
    const availableServices = [...new Set(filteredCapabilities.map(c => c.serviceType))]

    return NextResponse.json({
      success: true,
      data: {
        capabilities: filteredCapabilities,
        stats,
        serviceMatrix,
        availableProducts,
        availableServices,
        queryParameters: {
          bbox,
          productType,
          serviceType,
          nodeId
        }
      }
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

// 生成服务能力矩阵
function generateServiceMatrix(capabilities: any[]) {
  const matrix: Record<string, Record<string, boolean>> = {}
  
  capabilities.forEach(capability => {
    const product = capability.productType
    const service = capability.serviceType
    
    if (!matrix[product]) {
      matrix[product] = {}
    }
    
    matrix[product][service] = true
  })
  
  return matrix
}

// 创建服务能力
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nodeId, productType, serviceType, isEnabled = true, endpoint, version = '1.0.0' } = body

    // 验证必需字段
    if (!nodeId || !productType || !serviceType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: nodeId, productType, serviceType' },
        { status: 400 }
      )
    }

    // 验证节点是否存在
    const node = await db.node.findUnique({
      where: { id: nodeId }
    })

    if (!node) {
      return NextResponse.json(
        { success: false, error: 'Node not found' },
        { status: 404 }
      )
    }

    // 验证产品类型是否有效
    const validProducts = ['S101', 'S102', 'S104', 'S111', 'S124', 'S125', 'S131']
    if (!validProducts.includes(productType)) {
      return NextResponse.json(
        { success: false, error: `Invalid product type. Valid types: ${validProducts.join(', ')}` },
        { status: 400 }
      )
    }

    // 验证服务类型是否有效
    const validServices = Object.values(ServiceType)
    if (!validServices.includes(serviceType as ServiceType)) {
      return NextResponse.json(
        { success: false, error: `Invalid service type. Valid types: ${validServices.join(', ')}` },
        { status: 400 }
      )
    }

    // 检查是否已存在相同的能力
    const existingCapability = await db.capability.findFirst({
      where: {
        nodeId,
        productType,
        serviceType
      }
    })

    if (existingCapability) {
      return NextResponse.json(
        { success: false, error: 'Capability already exists for this node, product, and service type' },
        { status: 409 }
      )
    }

    // 创建新的服务能力
    const newCapability = await db.capability.create({
      data: {
        nodeId,
        productType,
        serviceType,
        isEnabled,
        endpoint: endpoint || `${node.apiUrl}/${productType.toLowerCase()}/${serviceType.toLowerCase()}`,
        version
      },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true,
            level: true,
            apiUrl: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: newCapability,
      message: 'Capability created successfully'
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