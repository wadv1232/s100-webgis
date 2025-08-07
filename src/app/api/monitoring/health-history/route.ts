import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取节点健康历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nodeId = searchParams.get('nodeId')
    const hours = parseInt(searchParams.get('hours') || '24')

    // 计算时间范围
    const endTime = new Date()
    const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000)

    // 构建查询条件
    let whereClause: any = {}
    
    if (nodeId) {
      whereClause.id = nodeId
    }

    // 获取节点数据
    const nodes = await db.node.findMany({
      where: whereClause,
      orderBy: {
        lastHealthCheck: 'desc'
      }
    })

    // 模拟健康历史数据 - 在实际项目中应该有专门的健康检查记录表
    const healthHistory = nodes.map(node => {
      // 生成模拟的历史数据点
      const historyPoints = []
      const currentTime = new Date(node.lastHealthCheck || new Date())
      
      for (let i = 0; i < hours; i++) {
        const timestamp = new Date(currentTime.getTime() - i * 60 * 60 * 1000)
        
        // 模拟健康状态变化
        let status = node.healthStatus
        if (Math.random() < 0.1) { // 10%概率状态变化
          const statuses = ['HEALTHY', 'WARNING', 'ERROR', 'OFFLINE']
          status = statuses[Math.floor(Math.random() * statuses.length)]
        }
        
        historyPoints.push({
          timestamp: timestamp.toISOString(),
          status: status,
          nodeId: node.id,
          nodeName: node.name
        })
      }
      
      return {
        nodeId: node.id,
        nodeName: node.name,
        nodeType: node.type,
        currentStatus: node.healthStatus,
        lastCheck: node.lastHealthCheck,
        history: historyPoints.reverse() // 按时间正序排列
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        healthHistory,
        timeRange: {
          start: startTime.toISOString(),
          end: endTime.toISOString()
        }
      }
    })
  } catch (error) {
    console.error('获取健康历史失败:', error)
    return NextResponse.json(
      { success: false, error: '获取健康历史失败' },
      { status: 500 }
    )
  }
}