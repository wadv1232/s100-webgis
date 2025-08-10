import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 获取主页需要的节点数据（限制数量，按层级排序）
    const nodes = await db.node.findMany({
      where: {
        isActive: true
      },
      include: {
        capabilities: {
          select: {
            productType: true,
            serviceType: true,
            isEnabled: true
          }
        },
        _count: {
          select: {
            datasets: true,
            children: true
          }
        }
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ],
      take: 10 // 限制返回数量
    })

    // 转换数据格式以匹配前端需要的格式
    const homeNodes = nodes.map(node => ({
      id: node.id,
      code: node.code,
      name: node.name,
      type: node.type,
      level: node.level,
      description: node.description,
      status: node.healthStatus,
      location: `${node.latitude || 0}, ${node.longitude || 0}`,
      capabilities: node.capabilities
        .filter(cap => cap.isEnabled)
        .map(cap => `${cap.productType}-${cap.serviceType}`),
      healthScore: node.healthStatus === 'HEALTHY' ? 98 : 
                   node.healthStatus === 'WARNING' ? 78 : 
                   node.healthStatus === 'ERROR' ? 45 : 0,
      lastUpdated: node.updatedAt,
      datasetsCount: node._count.datasets,
      childrenCount: node._count.children
    }))

    return NextResponse.json({
      success: true,
      data: homeNodes
    })
  } catch (error) {
    console.error('Error fetching home nodes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch home nodes'
      },
      { status: 500 }
    )
  }
}