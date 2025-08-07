import { NextRequest, NextResponse } from 'next/server'
import { ServiceDirectory } from '@/lib/service-directory'
import { ApiErrorHandler } from '@/lib/api-error'
import { s102WmsService } from '@/lib/services/service-init'

// S-102 WMS (Web Map Service) v1 API
// 支持标准OGC WMS请求，提供格网数据的地图渲染
export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')
    const version = searchParams.get('version')
    const requestType = searchParams.get('request')
    const bbox = searchParams.get('bbox')
    const width = searchParams.get('width')
    const height = searchParams.get('height')
    const format = searchParams.get('format') || 'image/png'
    const styles = searchParams.get('styles') || 'default'
    const colorScale = searchParams.get('colorScale') || 'viridis'
    const time = searchParams.get('time')
    const elevation = searchParams.get('elevation')
    const resolution = searchParams.get('resolution')
    const useCache = searchParams.get('useCache') !== 'false' // 默认使用缓存

    // 验证WMS必需参数
    if (!service || service.toUpperCase() !== 'WMS') {
      return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
        message: 'SERVICE parameter is required and must be "WMS"'
      })
    }

    if (!requestType) {
      return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
        message: 'REQUEST parameter is required'
      })
    }

    // 处理GetCapabilities请求
    if (requestType.toUpperCase() === 'GETCAPABILITIES') {
      return await s102WmsService.handleRequest(request, 'WMS')
    }

    // 验证GetMap必需参数
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
          productTypes: ['S102'],
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

    // 如果缓存查找失败，使用实时查询
    if (!bestService) {
      queryMode = 'realtime'
      
      // 尝试直接渲染地图图像
      try {
        const directRenderResponse = await s102WmsService.handleRequest(request, 'WMS')
        
        // 如果成功获取到图像数据，直接返回
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
        console.warn('Direct render failed:', error)
      }
      
      // 如果直接渲染也失败，返回错误
      return ApiErrorHandler.createErrorResponse('SERVICE_UNAVAILABLE', {
        message: 'No S102 WMS service available for the specified area',
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
    redirectUrl.searchParams.set('version', version || '1.1.1')
    redirectUrl.searchParams.set('request', requestType)
    redirectUrl.searchParams.set('bbox', bbox)
    redirectUrl.searchParams.set('width', width)
    redirectUrl.searchParams.set('height', height)
    redirectUrl.searchParams.set('format', format)
    redirectUrl.searchParams.set('styles', styles)
    if (colorScale) {
      redirectUrl.searchParams.set('colorScale', colorScale)
    }
    if (time) {
      redirectUrl.searchParams.set('time', time)
    }
    if (elevation) {
      redirectUrl.searchParams.set('elevation', elevation)
    }
    if (resolution) {
      redirectUrl.searchParams.set('resolution', resolution)
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
    console.error('Error in S102 WMS API:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', {
      operation: 's102_wms_request',
      queryTime: Date.now() - startTime
    })
  }
}

// 支持POST请求
export async function POST(request: NextRequest) {
  try {
    // 对于WMS POST请求，通常包含XML格式的请求体
    const contentType = request.headers.get('content-type')
    
    if (contentType && contentType.includes('application/xml')) {
      // 处理XML格式的WMS请求
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
        message: 'Content-Type must be application/xml for WMS POST requests'
      }
    }, { status: 415 })
  } catch (error) {
    console.error('S-102 WMS v1 POST服务错误:', error)
    return NextResponse.json({
      error: {
        code: 'InternalError',
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
}