import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取服务健康状态
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceId = params.id

    // 获取服务健康监控记录
    const healthMonitor = await db.serviceHealthMonitor.findFirst({
      where: { serviceId },
      include: {
        service: true,
        node: true,
        metrics: {
          orderBy: { recordedAt: 'desc' },
          take: 10
        }
      }
    })

    if (!healthMonitor) {
      return NextResponse.json({ error: 'Health monitor not found' }, { status: 404 })
    }

    // 获取访问统计
    const accessStats = await db.serviceAccessStats.findMany({
      where: { serviceId },
      orderBy: { date: 'desc' },
      take: 7 // 最近7天
    })

    return NextResponse.json({
      healthMonitor,
      accessStats
    })
  } catch (error) {
    console.error('Error fetching service health:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// 更新服务健康状态
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceId = params.id
    const { healthStatus, responseTime, uptime, errorMessage, checkInterval } = await request.json()

    // 更新健康监控记录
    const healthMonitor = await db.serviceHealthMonitor.upsert({
      where: { 
        serviceId_nodeId: { 
          serviceId, 
          nodeId: (await db.service.findUnique({ where: { id: serviceId } }))?.dataset?.nodeId || '' 
        }
      },
      update: {
        healthStatus,
        responseTime,
        uptime,
        errorMessage,
        checkInterval,
        lastCheckAt: new Date(),
        nextCheckAt: new Date(Date.now() + (checkInterval || 300) * 1000)
      },
      create: {
        serviceId,
        nodeId: (await db.service.findUnique({ where: { id: serviceId } }))?.dataset?.nodeId || '',
        healthStatus,
        responseTime,
        uptime,
        errorMessage,
        checkInterval,
        lastCheckAt: new Date(),
        nextCheckAt: new Date(Date.now() + (checkInterval || 300) * 1000)
      }
    })

    // 记录指标
    if (responseTime) {
      await db.serviceMetric.create({
        data: {
          monitorId: healthMonitor.id,
          metricName: 'response_time',
          metricValue: responseTime,
          metricUnit: 'ms',
          recordedAt: new Date()
        }
      })
    }

    if (uptime !== undefined) {
      await db.serviceMetric.create({
        data: {
          monitorId: healthMonitor.id,
          metricName: 'uptime',
          metricValue: uptime,
          metricUnit: 'percentage',
          recordedAt: new Date()
        }
      })
    }

    return NextResponse.json({ healthMonitor })
  } catch (error) {
    console.error('Error updating service health:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}