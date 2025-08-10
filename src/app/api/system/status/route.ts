import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 获取节点统计信息
    const [totalNodes, onlineNodes, activeServices, totalDatasets] = await Promise.all([
      db.node.count(),
      db.node.count({ where: { healthStatus: 'HEALTHY' } }),
      db.service.count({ where: { isActive: true } }),
      db.dataset.count({ where: { status: 'PUBLISHED' } })
    ])

    // 计算系统健康度
    const healthPercentage = totalNodes > 0 ? Math.round((onlineNodes / totalNodes) * 100) : 100

    const systemStatus = {
      onlineNodes,
      activeServices,
      datasets: totalDatasets,
      systemHealth: `${healthPercentage}%`,
      totalNodes,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      data: systemStatus
    })
  } catch (error) {
    console.error('Error fetching system status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch system status'
      },
      { status: 500 }
    )
  }
}