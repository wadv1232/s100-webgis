import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取系统监控概览
export async function GET(request: NextRequest) {
  try {
    // 获取所有节点统计
    const nodes = await db.node.findMany({
      include: {
        _count: {
          select: {
            datasets: true,
            childNodeRelations: true,
            capabilities: true
          }
        }
      }
    })

    // 获取数据集统计
    const datasets = await db.dataset.groupBy({
      by: ['status', 'productType'],
      _count: {
        id: true
      }
    })

    // 获取服务统计
    const services = await db.service.groupBy({
      by: ['serviceType'],
      _count: {
        id: true
      },
      where: {
        isActive: true
      }
    })

    // 计算统计数据
    const nodeStats = {
      total: nodes.length,
      healthy: nodes.filter(n => n.healthStatus === 'HEALTHY').length,
      warning: nodes.filter(n => n.healthStatus === 'WARNING').length,
      error: nodes.filter(n => n.healthStatus === 'ERROR').length,
      offline: nodes.filter(n => n.healthStatus === 'OFFLINE').length,
      byType: {
        GLOBAL_ROOT: nodes.filter(n => n.type === 'GLOBAL_ROOT').length,
        NATIONAL: nodes.filter(n => n.type === 'NATIONAL').length,
        REGIONAL: nodes.filter(n => n.type === 'REGIONAL').length,
        LEAF: nodes.filter(n => n.type === 'LEAF').length
      }
    }

    const datasetStats = {
      total: datasets.reduce((sum, d) => sum + d._count.id, 0),
      byStatus: {
        UPLOADED: datasets.filter(d => d.status === 'UPLOADED').reduce((sum, d) => sum + d._count.id, 0),
        PROCESSING: datasets.filter(d => d.status === 'PROCESSING').reduce((sum, d) => sum + d._count.id, 0),
        PUBLISHED: datasets.filter(d => d.status === 'PUBLISHED').reduce((sum, d) => sum + d._count.id, 0),
        ARCHIVED: datasets.filter(d => d.status === 'ARCHIVED').reduce((sum, d) => sum + d._count.id, 0),
        ERROR: datasets.filter(d => d.status === 'ERROR').reduce((sum, d) => sum + d._count.id, 0)
      },
      byProduct: {
        S101: datasets.filter(d => d.productType === 'S101').reduce((sum, d) => sum + d._count.id, 0),
        S102: datasets.filter(d => d.productType === 'S102').reduce((sum, d) => sum + d._count.id, 0),
        S104: datasets.filter(d => d.productType === 'S104').reduce((sum, d) => sum + d._count.id, 0),
        S111: datasets.filter(d => d.productType === 'S111').reduce((sum, d) => sum + d._count.id, 0),
        S124: datasets.filter(d => d.productType === 'S124').reduce((sum, d) => sum + d._count.id, 0),
        S125: datasets.filter(d => d.productType === 'S125').reduce((sum, d) => sum + d._count.id, 0),
        S131: datasets.filter(d => d.productType === 'S131').reduce((sum, d) => sum + d._count.id, 0)
      }
    }

    const serviceStats = {
      total: services.reduce((sum, s) => sum + s._count.id, 0),
      byType: {
        WFS: services.find(s => s.serviceType === 'WFS')?._count.id || 0,
        WMS: services.find(s => s.serviceType === 'WMS')?._count.id || 0,
        WCS: services.find(s => s.serviceType === 'WCS')?._count.id || 0
      }
    }

    // 获取最近的健康检查记录
    const recentHealthChecks = nodes
      .filter(n => n.lastHealthCheck)
      .sort((a, b) => new Date(b.lastHealthCheck!).getTime() - new Date(a.lastHealthCheck!).getTime())
      .slice(0, 10)
      .map(node => ({
        nodeId: node.id,
        nodeName: node.name,
        status: node.healthStatus,
        lastCheck: node.lastHealthCheck,
        type: node.type
      }))

    // 计算系统健康度
    const systemHealth = nodeStats.total > 0 
      ? Math.round((nodeStats.healthy / nodeStats.total) * 100)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        nodeStats,
        datasetStats,
        serviceStats,
        recentHealthChecks,
        systemHealth,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('获取监控数据失败:', error)
    return NextResponse.json(
      { success: false, error: '获取监控数据失败' },
      { status: 500 }
    )
  }
}