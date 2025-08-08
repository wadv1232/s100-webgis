import { NextRequest } from 'next/server'
import { s101WfsService } from '@/lib/services/service-init'

// S-101 WFS (Web Feature Service) - 使用模块化服务架构
export async function GET(request: NextRequest) {
  try {
    // 使用模块化的S-101 WFS服务处理请求
    return await s101WfsService.handleRequest(request, 'WFS')
  } catch (error) {
    console.error('S-101 WFS服务错误:', error)
    return new Response('Internal server error', { status: 500 })
  }
}