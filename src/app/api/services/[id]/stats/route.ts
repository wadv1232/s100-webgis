import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取服务访问统计
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
    const { startDate, endDate } = request.nextUrl.searchParams

    // 构建查询条件
    const where: any = { serviceId }
    if (startDate) {
      where.date = { gte: new Date(startDate) }
    }
    if (endDate) {
      where.date = { ...where.date, lte: new Date(endDate) }
    }

    // 获取访问统计
    const accessStats = await db.serviceAccessStats.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    // 计算汇总数据
    const summary = accessStats.reduce((acc, stat) => {
      acc.totalRequests += stat.requestCount
      acc.totalSuccess += stat.successCount
      acc.totalErrors += stat.errorCount
      acc.totalDataTransferred += stat.totalDataTransferred
      acc.totalUniqueUsers += stat.uniqueUsers
      return acc
    }, {
      totalRequests: 0,
      totalSuccess: 0,
      totalErrors: 0,
      totalDataTransferred: 0,
      totalUniqueUsers: 0
    })

    // 计算平均响应时间
    const avgResponseTime = accessStats.length > 0 
      ? accessStats.reduce((sum, stat) => sum + stat.avgResponseTime, 0) / accessStats.length
      : 0

    // 计算成功率
    const successRate = summary.totalRequests > 0 
      ? (summary.totalSuccess / summary.totalRequests) * 100
      : 0

    return NextResponse.json({
      accessStats,
      summary: {
        ...summary,
        avgResponseTime,
        successRate
      }
    })
  } catch (error) {
    console.error('Error fetching access stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// 记录服务访问
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
    const { 
      endpoint, 
      responseTime, 
      success = true, 
      dataTransferred = 0,
      userId,
      errorDetails 
    } = await request.json()

    // 获取今天的日期
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 获取服务信息
    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: { dataset: true }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // 更新或创建访问统计
    const accessStats = await db.serviceAccessStats.upsert({
      where: {
        serviceId_nodeId_date: {
          serviceId,
          nodeId: service.dataset?.nodeId || '',
          date: today
        }
      },
      update: {
        requestCount: { increment: 1 },
        successCount: success ? { increment: 1 } : undefined,
        errorCount: success ? undefined : { increment: 1 },
        avgResponseTime: {
          set: await calculateNewAvgResponseTime(serviceId, today, responseTime)
        },
        totalDataTransferred: { increment: dataTransferred },
        uniqueUsers: userId ? await incrementUniqueUsers(serviceId, today, userId) : undefined,
        errorDetails: errorDetails ? { 
          set: await updateErrorDetails(serviceId, today, errorDetails) 
        } : undefined
      },
      create: {
        serviceId,
        nodeId: service.dataset?.nodeId || '',
        date: today,
        requestCount: 1,
        successCount: success ? 1 : 0,
        errorCount: success ? 0 : 1,
        avgResponseTime: responseTime,
        totalDataTransferred: dataTransferred,
        uniqueUsers: userId ? 1 : 0,
        errorDetails: errorDetails ? JSON.stringify([errorDetails]) : undefined
      }
    })

    return NextResponse.json({ accessStats })
  } catch (error) {
    console.error('Error recording access stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// 计算新的平均响应时间
async function calculateNewAvgResponseTime(serviceId: string, date: Date, newResponseTime: number): Promise<number> {
  const current = await db.serviceAccessStats.findUnique({
    where: {
      serviceId_nodeId_date: {
        serviceId,
        nodeId: '',
        date
      }
    }
  })

  if (!current) return newResponseTime

  const totalRequests = current.requestCount + 1
  const totalTime = current.avgResponseTime * current.requestCount + newResponseTime
  return totalTime / totalRequests
}

// 增加独立用户数
async function incrementUniqueUsers(serviceId: string, date: Date, userId: string): Promise<number> {
  // 这里应该检查用户是否已经访问过，简化实现直接增加
  const current = await db.serviceAccessStats.findUnique({
    where: {
      serviceId_nodeId_date: {
        serviceId,
        nodeId: '',
        date
      }
    }
  })

  return current ? current.uniqueUsers + 1 : 1
}

// 更新错误详情
async function updateErrorDetails(serviceId: string, date: Date, errorDetails: any): Promise<string> {
  const current = await db.serviceAccessStats.findUnique({
    where: {
      serviceId_nodeId_date: {
        serviceId,
        nodeId: '',
        date
      }
    }
  })

  const currentErrors = current?.errorDetails ? JSON.parse(current.errorDetails) : []
  currentErrors.push(errorDetails)
  
  // 只保留最近100个错误
  return JSON.stringify(currentErrors.slice(-100))
}