import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ServiceDirectory } from '@/lib/service-directory'
import { ApiErrorHandler } from '@/lib/api-error'

interface CapabilityResponse {
  services: Array<{
    productId: string
    productName: string
    serviceType: string
    endpoint: string
    nodeId: string
    nodeName: string
    coverage: {
      type: string
      coordinates: number[][][]
    }
    version?: string
    lastUpdated?: string
    confidence?: number
  }>
  bbox: string
  timestamp: string
  queryMode: 'realtime' | 'cached'
  performance?: {
    queryTime: number
    cacheHit?: boolean
  }
}

// S-100产品类型映射
const PRODUCT_NAMES: Record<string, string> = {
  'S101': 'Electronic Navigational Chart',
  'S102': 'Bathymetric Surface',
  'S104': 'Water Level Information',
  'S111': 'Surface Currents',
  'S124': 'Navigational Warnings',
  'S131': 'Marine Protected Areas'
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const bbox = searchParams.get('bbox')
    const products = searchParams.get('products')
    const useCache = searchParams.get('useCache') !== 'false' // 默认使用缓存

    // 验证bbox参数
    if (!bbox) {
      return ApiErrorHandler.createErrorResponse('INVALID_BBOX', {
        message: 'bbox parameter is required. Format: minX,minY,maxX,maxY'
      })
    }

    // 解析bbox坐标
    const bboxParts = bbox.split(',').map(coord => parseFloat(coord.trim()))
    if (bboxParts.length !== 4 || bboxParts.some(isNaN)) {
      return ApiErrorHandler.createErrorResponse('INVALID_BBOX', {
        message: 'Invalid bbox format. Expected: minX,minY,maxX,maxY'
      })
    }

    const [minX, minY, maxX, maxY] = bboxParts

    // 解析产品类型过滤
    const productArray = products ? products.split(',').map(p => p.trim().toUpperCase()) : undefined

    let response: CapabilityResponse
    let queryMode: 'realtime' | 'cached' = 'realtime'

    // 优先使用服务目录（缓存模式）
    if (useCache) {
      try {
        const serviceDirectory = ServiceDirectory.getInstance()
        const services = await serviceDirectory.queryServices({
          bbox: [minX, minY, maxX, maxY],
          productTypes: productArray
        }, {
          maxResults: 100,
          sortBy: 'confidence',
          sortOrder: 'desc'
        })

        if (services.length > 0) {
          queryMode = 'cached'
          response = {
            services: services.map(service => ({
              productId: service.productId,
              productName: service.productName,
              serviceType: service.serviceType,
              endpoint: service.endpoint,
              nodeId: service.nodeId,
              nodeName: service.nodeName,
              coverage: service.coverage,
              version: service.version,
              lastUpdated: service.lastSyncedAt,
              confidence: service.confidence
            })),
            bbox,
            timestamp: new Date().toISOString(),
            queryMode,
            performance: {
              queryTime: Date.now() - startTime,
              cacheHit: true
            }
          }
        }
      } catch (error) {
        console.warn('Service directory query failed, falling back to realtime:', error)
      }
    }

    // 如果缓存模式失败或无结果，使用实时查询
    if (!response) {
      queryMode = 'realtime'
      
      // 构建查询条件
      let whereClause: any = {
        isEnabled: true,
        node: {
          isActive: true,
          healthStatus: 'HEALTHY'
        }
      }

      if (productArray) {
        whereClause.productType = {
          in: productArray
        }
      }

      // 获取所有匹配的服务能力
      const capabilities = await db.capability.findMany({
        where: whereClause,
        include: {
          node: {
            select: {
              id: true,
              name: true,
              coverage: true,
              level: true
            }
          }
        },
        orderBy: [
          { node: { level: 'asc' } },
          { productType: 'asc' },
          { serviceType: 'asc' }
        ]
      })

      // 过滤出覆盖指定bbox区域的服务
      const filteredServices = capabilities.filter(capability => {
        const nodeCoverage = capability.node.coverage
        if (!nodeCoverage) return false

        try {
          const coverage = JSON.parse(nodeCoverage as string)
          
          // 简化的矩形相交检查
          if (coverage.type === 'Polygon' && coverage.coordinates && coverage.coordinates[0]) {
            const coords = coverage.coordinates[0]
            const nodeMinX = Math.min(...coords.map((c: number[]) => c[0]))
            const nodeMaxX = Math.max(...coords.map((c: number[]) => c[0]))
            const nodeMinY = Math.min(...coords.map((c: number[]) => c[1]))
            const nodeMaxY = Math.max(...coords.map((c: number[]) => c[1]))

            // 检查矩形是否相交
            return !(maxX < nodeMinX || minX > nodeMaxX || maxY < nodeMinY || minY > nodeMaxY)
          }
        } catch (error) {
          console.warn('Failed to parse coverage for node:', capability.node.id)
        }

        return false
      })

      // 构建响应数据
      const services = filteredServices.map(capability => {
        let coverage = null
        try {
          coverage = JSON.parse(capability.node.coverage as string)
        } catch (error) {
          console.warn('Failed to parse coverage for node:', capability.node.id)
        }

        return {
          productId: capability.productType,
          productName: PRODUCT_NAMES[capability.productType] || capability.productType,
          serviceType: capability.serviceType,
          endpoint: capability.endpoint || `${capability.node.apiUrl}/api/${capability.productType.toLowerCase()}/wms`,
          nodeId: capability.node.id,
          nodeName: capability.node.name,
          coverage: coverage || {
            type: 'Polygon',
            coordinates: [[[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]]
          },
          version: capability.version,
          lastUpdated: capability.updatedAt.toISOString(),
          confidence: 1.0 // 实时查询默认最高置信度
        }
      })

      // 按产品类型和服务类型分组
      const groupedServices = services.reduce((acc, service) => {
        const key = `${service.productId}-${service.serviceType}`
        if (!acc[key]) {
          acc[key] = service
        }
        return acc
      }, {} as Record<string, typeof services[0]>)

      const uniqueServices = Object.values(groupedServices)

      response = {
        services: uniqueServices,
        bbox,
        timestamp: new Date().toISOString(),
        queryMode,
        performance: {
          queryTime: Date.now() - startTime,
          cacheHit: false
        }
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in capabilities API:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', {
      operation: 'capabilities_query',
      queryTime: Date.now() - startTime
    })
  }
}