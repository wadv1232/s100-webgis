import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

interface RouteParams {
  params: { id: string }
}

// GET /api/services/[id] - 获取单个服务详情
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // 获取服务能力
    const capability = await db.capability.findUnique({
      where: { id },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true,
            apiUrl: true
          }
        }
      }
    })

    if (!capability) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    return NextResponse.json({ capability })
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// PUT /api/services/[id] - 更新服务
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await auth(request)
    if (!user || !user.permissions.includes('SERVICE_UPDATE')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const {
      endpoint,
      version,
      isEnabled,
      productType,
      serviceType
    } = body

    // 检查服务是否存在
    const existingCapability = await db.capability.findUnique({
      where: { id }
    })
    if (!existingCapability) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // 更新服务
    const updatedCapability = await db.capability.update({
      where: { id },
      data: {
        ...(endpoint && { endpoint }),
        ...(version && { version }),
        ...(typeof isEnabled === 'boolean' && { isEnabled }),
        ...(productType && { productType }),
        ...(serviceType && { serviceType })
      },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true,
            apiUrl: true
          }
        }
      }
    })

    // 记录服务更新日志 - 不需要关联到具体数据集
    try {
      await db.service.create({
        data: {
          datasetId: 'system', // 系统服务
          serviceType: existingCapability.serviceType,
          endpoint: existingCapability.endpoint,
          configuration: JSON.stringify({
            action: 'update',
            serviceId: id,
            updatedBy: user.id,
            changes: body
          })
        }
      })
    } catch (logError) {
      // 如果日志记录失败，不影响主要功能
      console.warn('Failed to log service update:', logError)
    }

    return NextResponse.json({
      message: 'Service updated successfully',
      capability: updatedCapability
    })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[id] - 删除服务
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await auth(request)
    if (!user || !user.permissions.includes('SERVICE_DELETE')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = params

    // 检查服务是否存在
    const existingCapability = await db.capability.findUnique({
      where: { id }
    })
    if (!existingCapability) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // 删除服务
    await db.capability.delete({
      where: { id }
    })

    // 记录服务删除日志 - 不需要关联到具体数据集
    try {
      await db.service.create({
        data: {
          datasetId: 'system', // 系统服务
          serviceType: existingCapability.serviceType,
          endpoint: existingCapability.endpoint,
          configuration: JSON.stringify({
            action: 'delete',
            serviceId: id,
            deletedBy: user.id
          })
        }
      })
    } catch (logError) {
      // 如果日志记录失败，不影响主要功能
      console.warn('Failed to log service delete:', logError)
    }

    return NextResponse.json({
      message: 'Service deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}