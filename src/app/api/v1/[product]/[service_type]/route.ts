import { NextRequest, NextResponse } from 'next/server'
import { ServiceDirectory } from '@/lib/service-directory'
import { ApiErrorHandler } from '@/lib/api-error'
import { s101WmsService, s101WfsService, s102WmsService, s102WcsService, s104WmsService } from '@/lib/services/service-init'

interface OGCRequest {
  service: string
  version?: string
  request: string
  [key: string]: string | undefined
}

// 产品类型映射
const PRODUCT_SERVICES: Record<string, Record<string, any>> = {
  'S101': {
    'WMS': s101WmsService,
    'WFS': s101WfsService
  },
  'S102': {
    'WMS': s102WmsService,
    'WCS': s102WcsService
  },
  'S104': {
    'WMS': s104WmsService
  }
}

// 验证产品类型
function isValidProduct(product: string): boolean {
  return ['S101', 'S102', 'S104', 'S111', 'S124', 'S125', 'S131'].includes(product.toUpperCase())
}

// 验证服务类型
function isValidServiceType(serviceType: string): boolean {
  return ['WMS', 'WFS', 'WCS'].includes(serviceType.toUpperCase())
}

export async function GET(
  request: NextRequest,
  { params }: { params: { product: string; service_type: string } }
) {
  const startTime = Date.now()
  
  try {
    const { product, service_type } = params
    const { searchParams } = new URL(request.url)

    // 验证产品和服务类型
    if (!isValidProduct(product)) {
      return ApiErrorHandler.createErrorResponse('INVALID_PRODUCT', {
        product,
        valid_products: Object.keys(PRODUCT_SERVICES)
      })
    }

    if (!isValidServiceType(service_type)) {
      return ApiErrorHandler.createErrorResponse('INVALID_SERVICE_TYPE', {
        service_type,
        valid_service_types: ['WMS', 'WFS', 'WCS']
      })
    }

    const productUpper = product.toUpperCase()
    const serviceTypeUpper = service_type.toUpperCase()

    // 获取OGC请求参数
    const ogcRequest: OGCRequest = {
      service: searchParams.get('service') || serviceTypeUpper,
      version: searchParams.get('version') || '1.1.1',
      request: searchParams.get('request') || '',
      ...Object.fromEntries(searchParams.entries())
    }

    // 验证服务参数
    if (ogcRequest.service.toUpperCase() !== serviceTypeUpper) {
      return ApiErrorHandler.createErrorResponse('SERVICE_MISMATCH', {
        requested_service: ogcRequest.service,
        expected_service: serviceTypeUpper
      })
    }

    // 处理GetCapabilities请求（必须支持）
    if (ogcRequest.request.toUpperCase() === 'GETCAPABILITIES') {
      const service = PRODUCT_SERVICES[productUpper]?.[serviceTypeUpper]
      if (service) {
        return await service.handleRequest(request, serviceTypeUpper)
      } else {
        return ApiErrorHandler.createErrorResponse('SERVICE_NOT_AVAILABLE', {
          product: productUpper,
          service_type: serviceTypeUpper
        })
      }
    }

    // 处理其他OGC请求
    const service = PRODUCT_SERVICES[productUpper]?.[serviceTypeUpper]
    if (!service) {
      return ApiErrorHandler.createErrorResponse('SERVICE_NOT_IMPLEMENTED', {
        product: productUpper,
        service_type: serviceTypeUpper,
        message: `${productUpper} ${serviceTypeUpper} service is not implemented`
      })
    }

    // 根据服务类型处理特定请求
    switch (serviceTypeUpper) {
      case 'WMS':
        return await handleWmsRequest(request, productUpper, service, startTime)
      
      case 'WFS':
        return await handleWfsRequest(request, productUpper, service, startTime)
      
      case 'WCS':
        return await handleWcsRequest(request, productUpper, service, startTime)
      
      default:
        return ApiErrorHandler.createErrorResponse('INVALID_SERVICE_TYPE', {
          service_type: serviceTypeUpper
        })
    }

  } catch (error) {
    console.error(`Error in ${product} ${service_type} API:`, error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', {
      operation: `${product}_${service_type}_request`,
      queryTime: Date.now() - startTime
    })
  }
}

// 处理WMS请求
async function handleWmsRequest(
  request: NextRequest,
  product: string,
  service: any,
  startTime: number
) {
  const { searchParams } = new URL(request.url)
  const requestType = searchParams.get('request')?.toUpperCase()
  const bbox = searchParams.get('bbox')
  const width = searchParams.get('width')
  const height = searchParams.get('height')
  const useCache = searchParams.get('useCache') !== 'false'

  // 验证GetMap请求参数
  if (requestType === 'GETMAP') {
    if (!bbox || !width || !height) {
      return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
        required: ['bbox', 'width', 'height'],
        provided: Object.fromEntries(searchParams.entries())
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

    // 验证宽度和高度
    const widthNum = parseInt(width)
    const heightNum = parseInt(height)
    if (isNaN(widthNum) || isNaN(heightNum) || widthNum <= 0 || heightNum <= 0) {
      return ApiErrorHandler.createErrorResponse('INVALID_DIMENSIONS', {
        message: 'width and height must be positive integers'
      })
    }

    let bestService: any = null
    let queryMode: 'cached' | 'realtime' | 'direct' = 'cached'

    // 优先使用服务目录查找最佳服务
    if (useCache) {
      try {
        const serviceDirectory = ServiceDirectory.getInstance()
        bestService = await serviceDirectory.getBestService({
          bbox: [minX, minY, maxX, maxY],
          productTypes: [product],
          serviceTypes: ['WMS'],
          minConfidence: 0.5
        })

        if (bestService) {
          queryMode = 'cached'
        }
      } catch (error) {
        console.warn('Service directory lookup failed, falling back to realtime:', error)
      }
    }

    // 如果缓存查找失败，尝试直接渲染
    if (!bestService) {
      queryMode = 'direct'
      
      try {
        const directRenderResponse = await service.handleRequest(request, 'WMS')
        
        if (directRenderResponse.status === 200) {
          // 添加性能监控信息
          const headers = new Headers(directRenderResponse.headers)
          headers.set('X-Query-Mode', queryMode)
          headers.set('X-Query-Time', (Date.now() - startTime).toString())
          headers.set('X-Cache-Hit', 'false')
          headers.set('X-Render-Mode', 'direct')
          
          return new NextResponse(directRenderResponse.body, {
            status: directRenderResponse.status,
            headers
          })
        }
      } catch (error) {
        console.warn('Direct render failed:', error)
      }
      
      return ApiErrorHandler.createErrorResponse('SERVICE_UNAVAILABLE', {
        message: `No ${product} WMS service available for the specified area`,
        queryMode,
        performance: {
          queryTime: Date.now() - startTime,
          cacheHit: false
        }
      })
    }

    // 重定向到最佳服务节点
    const redirectUrl = new URL(bestService.endpoint)
    searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value)
    })

    const headers = new Headers({
      'X-Query-Mode': queryMode,
      'X-Query-Time': (Date.now() - startTime).toString(),
      'X-Cache-Hit': (queryMode === 'cached').toString(),
      'X-Service-Node': bestService.nodeId,
      'X-Service-Confidence': bestService.confidence.toString()
    })

    return NextResponse.redirect(redirectUrl, 307, { headers })
  }

  // 处理GetFeatureInfo请求（强烈推荐支持）
  if (requestType === 'GETFEATUREINFO') {
    try {
      const response = await service.handleRequest(request, 'WMS')
      
      const headers = new Headers(response.headers)
      headers.set('X-Query-Time', (Date.now() - startTime).toString())
      
      return new NextResponse(response.body, {
        status: response.status,
        headers
      })
    } catch (error) {
      return ApiErrorHandler.createErrorResponse('FEATURE_INFO_ERROR', {
        message: 'Failed to get feature information',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // 其他WMS请求
  try {
    const response = await service.handleRequest(request, 'WMS')
    
    const headers = new Headers(response.headers)
    headers.set('X-Query-Time', (Date.now() - startTime).toString())
    
    return new NextResponse(response.body, {
      status: response.status,
      headers
    })
  } catch (error) {
    return ApiErrorHandler.createErrorResponse('WMS_REQUEST_ERROR', {
      request: requestType,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// 处理WFS请求
async function handleWfsRequest(
  request: NextRequest,
  product: string,
  service: any,
  startTime: number
) {
  const { searchParams } = new URL(request.url)
  const requestType = searchParams.get('request')?.toUpperCase()

  try {
    const response = await service.handleRequest(request, 'WFS')
    
    const headers = new Headers(response.headers)
    headers.set('X-Query-Time', (Date.now() - startTime).toString())
    headers.set('X-Product', product)
    headers.set('X-Service-Type', 'WFS')
    
    return new NextResponse(response.body, {
      status: response.status,
      headers
    })
  } catch (error) {
    return ApiErrorHandler.createErrorResponse('WFS_REQUEST_ERROR', {
      request: requestType,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// 处理WCS请求
async function handleWcsRequest(
  request: NextRequest,
  product: string,
  service: any,
  startTime: number
) {
  const { searchParams } = new URL(request.url)
  const requestType = searchParams.get('request')?.toUpperCase()

  try {
    const response = await service.handleRequest(request, 'WCS')
    
    const headers = new Headers(response.headers)
    headers.set('X-Query-Time', (Date.now() - startTime).toString())
    headers.set('X-Product', product)
    headers.set('X-Service-Type', 'WCS')
    
    return new NextResponse(response.body, {
      status: response.status,
      headers
    })
  } catch (error) {
    return ApiErrorHandler.createErrorResponse('WCS_REQUEST_ERROR', {
      request: requestType,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}