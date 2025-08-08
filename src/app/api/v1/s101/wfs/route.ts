import { NextRequest, NextResponse } from 'next/server'
import { s101WfsService } from '@/lib/services/service-init'

// S-101 WFS (Web Feature Service) v1 API
// 支持标准OGC WFS请求，返回GeoJSON格式的要素数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // 验证必需参数
    const service = searchParams.get('service')
    const version = searchParams.get('version')
    const requestType = searchParams.get('request')
    
    // 基本参数验证
    if (!service || service.toUpperCase() !== 'WFS') {
      return NextResponse.json({
        error: {
          code: 'MissingParameterValue',
          message: 'SERVICE parameter is required and must be "WFS"'
        }
      }, { status: 400 })
    }
    
    if (!requestType) {
      return NextResponse.json({
        error: {
          code: 'MissingParameterValue',
          message: 'REQUEST parameter is required'
        }
      }, { status: 400 })
    }
    
    // 使用模块化的S-101 WFS服务处理请求
    return await s101WfsService.handleRequest(request, 'WFS')
  } catch (error) {
    console.error('S-101 WFS v1服务错误:', error)
    return NextResponse.json({
      error: {
        code: 'InternalError',
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
}

// 支持POST请求
export async function POST(request: NextRequest) {
  try {
    // 对于WFS POST请求，通常包含XML格式的请求体
    const contentType = request.headers.get('content-type')
    
    if (contentType && contentType.includes('application/xml')) {
      // 处理XML格式的WFS请求
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
        message: 'Content-Type must be application/xml for WFS POST requests'
      }
    }, { status: 415 })
  } catch (error) {
    console.error('S-101 WFS v1 POST服务错误:', error)
    return NextResponse.json({
      error: {
        code: 'InternalError',
        message: 'Internal server error'
      }
    }, { status: 500 })
  }
}