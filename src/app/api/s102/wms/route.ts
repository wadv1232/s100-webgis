import { NextRequest } from 'next/server'
import { s102WmsService } from '@/lib/services/service-init'

// S-102 WMS (Web Map Service) - 使用模块化服务架构
export async function GET(request: NextRequest) {
  try {
    // 使用模块化的S-102 WMS服务处理请求
    return await s102WmsService.handleRequest(request, 'WMS')
  } catch (error) {
    console.error('S-102 WMS服务错误:', error)
    return new Response('Internal server error', { status: 500 })
  }
}