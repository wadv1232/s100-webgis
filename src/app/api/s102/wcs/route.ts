import { NextRequest } from 'next/server'
import { s102WcsService } from '@/lib/services/service-init'

// S-102 WCS (Web Coverage Service) - 使用模块化服务架构
export async function GET(request: NextRequest) {
  try {
    // 使用模块化的S-102 WCS服务处理请求
    return await s102WcsService.handleRequest(request, 'WCS')
  } catch (error) {
    console.error('S-102 WCS服务错误:', error)
    return new Response('Internal server error', { status: 500 })
  }
}