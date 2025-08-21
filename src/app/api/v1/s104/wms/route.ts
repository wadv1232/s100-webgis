import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bbox = searchParams.get('bbox')
    const width = searchParams.get('width')
    const height = searchParams.get('height')
    const format = searchParams.get('format') || 'image/png'
    const time = searchParams.get('time')

    // 验证必需参数
    if (!bbox || !width || !height) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'Required parameters: bbox, width, height'
          }
        },
        { status: 400 }
      )
    }

    // 解析bbox坐标
    const bboxParts = bbox.split(',').map(coord => parseFloat(coord.trim()))
    if (bboxParts.length !== 4 || bboxParts.some(isNaN)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_BBOX',
            message: 'Invalid bbox format. Expected: minX,minY,maxX,maxY'
          }
        },
        { status: 400 }
      )
    }

    const [minX, minY, maxX, maxY] = bboxParts

    // 验证宽度和高度
    const widthNum = parseInt(width)
    const heightNum = parseInt(height)
    if (isNaN(widthNum) || isNaN(heightNum) || widthNum <= 0 || heightNum <= 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_DIMENSIONS',
            message: 'width and height must be positive integers'
          }
        },
        { status: 400 }
      )
    }

    // 查找覆盖指定区域的S104 WMS服务
    const capabilities = await db.capability.findMany({
      where: {
        productType: 'S104',
        serviceType: 'WMS',
        isEnabled: true,
        node: {
          isActive: true,
          healthStatus: 'HEALTHY'
        }
      },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            coverage: true,
            level: true,
            apiUrl: true
          }
        }
      },
      orderBy: [
        { node: { level: 'asc' } } // 优先选择更底层的节点
      ]
    })

    // 过滤出覆盖指定bbox区域的服务
    const availableServices = capabilities.filter(capability => {
      const nodeCoverage = capability.node.coverage
      if (!nodeCoverage) return false

      try {
        const coverage = JSON.parse(nodeCoverage as string)
        
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

    if (availableServices.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'No S104 WMS service available for the specified area'
          }
        },
        { status: 404 }
      )
    }

    // 选择最优服务节点（这里简化为选择第一个匹配的服务）
    const selectedService = availableServices[0]
    
    // 构建重定向URL到实际的服务节点
    const baseUrl = selectedService.node.apiUrl || `${process.env.NEXT_PUBLIC_BASE_URL || `http://${process.env.HOSTNAME || 'localhost'}:${process.env.PORT || '3000'}`}`
    const redirectUrl = new URL(`${baseUrl}/api/s104/wms`)
    
    // 传递所有原始参数
    redirectUrl.searchParams.set('bbox', bbox)
    redirectUrl.searchParams.set('width', width)
    redirectUrl.searchParams.set('height', height)
    redirectUrl.searchParams.set('format', format)
    if (time) {
      redirectUrl.searchParams.set('time', time)
    }

    // 返回307临时重定向
    return NextResponse.redirect(redirectUrl, 307)

  } catch (error) {
    console.error('Error in S104 WMS API:', error)
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error occurred while processing WMS request'
        }
      },
      { status: 500 }
    )
  }
}