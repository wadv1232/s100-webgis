import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取单个实验性服务
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

    const service = await db.dataset.findUnique({
      where: { id: serviceId },
      include: {
        node: true,
        services: true,
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!service.isExperimental) {
      return NextResponse.json({ error: 'Not an experimental service' }, { status: 400 })
    }

    // 添加过期状态
    const serviceWithStatus = {
      ...service,
      isExpiringSoon: isExpiringSoon(service.experimentalExpires),
      daysUntilExpiry: service.experimentalExpires ? 
        Math.ceil((service.experimentalExpires.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
    }

    return NextResponse.json({ service: serviceWithStatus })
  } catch (error) {
    console.error('Error fetching experimental service:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// 更新实验性服务
export async function PUT(
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
      name,
      description,
      experimentalNotes,
      experimentalExpires,
      accessControl,
      status
    } = await request.json()

    // 验证服务存在
    const existingService = await db.dataset.findUnique({
      where: { id: serviceId }
    })

    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!existingService.isExperimental) {
      return NextResponse.json({ error: 'Not an experimental service' }, { status: 400 })
    }

    // 更新服务
    const updatedService = await db.dataset.update({
      where: { id: serviceId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(experimentalNotes !== undefined && { experimentalNotes }),
        ...(experimentalExpires !== undefined && { 
          experimentalExpires: experimentalExpires ? new Date(experimentalExpires) : null 
        }),
        ...(accessControl !== undefined && { 
          accessControl: accessControl ? JSON.stringify(accessControl) : null 
        }),
        ...(status && { status })
      },
      include: {
        node: true,
        services: true
      }
    })

    return NextResponse.json({ service: updatedService })
  } catch (error) {
    console.error('Error updating experimental service:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// 删除实验性服务
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceId = params.id

    // 验证服务存在
    const service = await db.dataset.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    if (!service.isExperimental) {
      return NextResponse.json({ error: 'Not an experimental service' }, { status: 400 })
    }

    // 删除相关服务
    await db.service.deleteMany({
      where: { datasetId: serviceId }
    })

    // 删除相关部署
    await db.serviceDeployment.deleteMany({
      where: { datasetId: serviceId }
    })

    // 删除服务
    await db.dataset.delete({
      where: { id: serviceId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting experimental service:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// 检查是否即将过期
function isExpiringSoon(expires?: Date | null): boolean {
  if (!expires) return false
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return expires <= sevenDaysFromNow && expires > now
}