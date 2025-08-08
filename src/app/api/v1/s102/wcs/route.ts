import { NextRequest, NextResponse } from 'next/server'
import { ServiceDirectory } from '@/lib/service-directory'
import { ApiErrorHandler } from '@/lib/api-error'
import { s102WcsService } from '@/lib/services/service-init'

// S-102 WCS (Web Coverage Service) v1 API
// 支持标准OGC WCS请求，提供格网数据访问
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')
    const version = searchParams.get('version')
    const requestType = searchParams.get('request')
    const coverageId = searchParams.get('coverageid') || searchParams.get('coverage')
    const bbox = searchParams.get('bbox')
    const format = searchParams.get('format') || 'GeoTIFF'
    const width = searchParams.get('width')
    const height = searchParams.get('height')
    const crs = searchParams.get('crs') || searchParams.get('srs')
    const time = searchParams.get('time')
    const useCache = searchParams.get('useCache') !== 'false' // 默认使用缓存

    // 验证WCS必需参数
    if (!service || service.toUpperCase() !== 'WCS') {
      return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
        message: 'SERVICE parameter is required and must be "WCS"'
      })
    }

    if (!requestType) {
      return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
        message: 'REQUEST parameter is required'
      })
    }

    // 处理GetCapabilities请求
    if (requestType.toUpperCase() === 'GETCAPABILITIES') {
      return await s102WcsService.handleRequest(request, 'WCS')
    }

    // 处理DescribeCoverage请求
    if (requestType.toUpperCase() === 'DESCRIBECOVERAGE') {
      return await s102WcsService.handleRequest(request, 'WCS')
    }

    // 验证GetCoverage必需参数
    if (!coverageId || !bbox || !width || !height) {
      return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
        required: ['coverageid', 'bbox', 'width', 'height'],
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
          productTypes: ['S102'],
          serviceTypes: ['WCS'],
          minConfidence: 0.5
        })

        if (bestService) {
          queryMode = 'cached'
        }
      } catch (error) {
        console.warn('Service directory lookup failed, falling back to realtime:', error)
      }
    }

    // 如果缓存查找失败，使用实时查询
    if (!bestService) {
      queryMode = 'realtime'
      
      // 尝试直接生成覆盖数据
      try {
        const directRenderResponse = await s102WcsService.handleRequest(request, 'WCS')
        
        // 如果成功获取到数据，直接返回
        if (directRenderResponse.status === 200) {
          queryMode = 'direct'
          
          // 添加性能监控信息到响应头
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
        console.warn('Direct WCS render failed:', error)
      }
      
      // 如果直接生成也失败，返回错误
      return ApiErrorHandler.createErrorResponse('SERVICE_UNAVAILABLE', {
        message: 'No S102 WCS service available for the specified area',
        queryMode,
        performance: {
          queryTime: Date.now() - startTime,
          cacheHit: false
        }
      })
    }

    // 构建重定向URL到实际的服务节点
    const redirectUrl = new URL(bestService.endpoint)
    
    // 传递所有原始参数
    redirectUrl.searchParams.set('service', service)
    redirectUrl.searchParams.set('version', version || '2.0.1')
    redirectUrl.searchParams.set('request', requestType)
    redirectUrl.searchParams.set('coverageid', coverageId)
    redirectUrl.searchParams.set('bbox', bbox)
    redirectUrl.searchParams.set('format', format)
    redirectUrl.searchParams.set('width', width)
    redirectUrl.searchParams.set('height', height)
    if (crs) {
      redirectUrl.searchParams.set('crs', crs)
    }
    if (time) {
      redirectUrl.searchParams.set('time', time)
    }

    // 添加性能监控信息到响应头
    const headers = new Headers({
      'X-Query-Mode': queryMode,
      'X-Query-Time': (Date.now() - startTime).toString(),
      'X-Cache-Hit': (queryMode === 'cached').toString(),
      'X-Service-Node': bestService.nodeId,
      'X-Service-Confidence': bestService.confidence.toString()
    })

    // 返回307临时重定向
    return NextResponse.redirect(redirectUrl, 307, { headers })

  } catch (error) {
    console.error('Error in S102 WCS API:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', {
      operation: 's102_wcs_request',
      queryTime: Date.now() - startTime
    })
  }
}

// 支持POST请求
export async function POST(request: NextRequest) {
  try {
    // 对于WCS POST请求，通常包含XML格式的请求体
    const contentType = request.headers.get('content-type')
    
    if (contentType && contentType.includes('application/xml')) {
      // 处理XML格式的WCS请求
      const body = await request.text()
      
      // 这里应该解析XML并提取参数
      // 简化处理，转换为GET请求参数
      const url = new URL(request.url)
      
      // 创建新的请求对象
      const newRequest = new Request(url.toString(), {
        method: 'GET',
        headers: request.headers
      })
      
      return await GET(newRequest)
    }
    
    // 如果不是XML，返回错误
    return NextResponse.json({
      error: {
        code: 'UnsupportedMediaType',
        message: 'Content-Type must be application/xml for WCS POST requests'
      }
    }, { status: 415 })
  } catch (error) {
    console.error('S-102 WCS v1 POST服务错误:', error)
    return NextResponse.json({
      error: {
        code: 'InternalError',
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
}