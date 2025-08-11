import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// POST /api/services/[id]/pilot - 启动服务试点（支持本地服务试点）
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await auth(request)
    if (!user || !user.permissions.includes('SERVICE_CREATE')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await context.params
    const body = await request.json()
    const { 
      pilotScope = 'local', 
      targetUsers = [],
      description,
      duration = 7 // 默认试点7天
    } = body

    // 检查服务是否存在
    const capability = await db.capability.findUnique({
      where: { id },
      include: {
        node: true
      }
    })
    if (!capability) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // 检查节点是否支持试点
    if (!capability.node.isActive) {
      return NextResponse.json({ error: 'Node is not active' }, { status: 400 })
    }

    // 创建试点配置
    const pilotConfig = {
      action: 'start_pilot',
      serviceId: id,
      nodeId: capability.nodeId,
      pilotScope, // 'local', 'internal', 'selected'
      targetUsers,
      description,
      duration,
      startedBy: user.id,
      startedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
    }

    // 记录试点日志 - 不需要关联到具体数据集
    try {
      await db.service.create({
        data: {
          datasetId: 'pilot', // 系统服务
          serviceType: capability.serviceType,
          endpoint: capability.endpoint,
          configuration: JSON.stringify(pilotConfig)
        }
      })
    } catch (logError) {
      // 如果日志记录失败，不影响主要功能
      console.warn('Failed to log service pilot:', logError)
    }

    // 根据试点范围进行不同处理
    let pilotResult
    switch (pilotScope) {
      case 'local':
        // 本地试点：仅在当前节点可用，不广播到上级
        pilotResult = {
          success: true,
          scope: 'local',
          message: 'Service pilot started locally. Service is only available on this node.',
          directAccess: `${capability.node.apiUrl}/api/v1/${capability.productType.toLowerCase()}/${capability.serviceType.toLowerCase()}`,
          expiresAt: pilotConfig.expiresAt
        }
        break

      case 'internal':
        // 内部试点：在组织内部可用
        pilotResult = {
          success: true,
          scope: 'internal',
          message: 'Service pilot started for internal users.',
          accessLevel: 'internal',
          expiresAt: pilotConfig.expiresAt
        }
        break

      case 'selected':
        // 指定用户试点
        pilotResult = {
          success: true,
          scope: 'selected',
          message: 'Service pilot started for selected users.',
          targetUsers,
          expiresAt: pilotConfig.expiresAt
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid pilot scope' }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Service pilot started successfully',
      pilotResult
    })
  } catch (error) {
    console.error('Error starting service pilot:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// PUT /api/services/[id]/pilot - 更新试点配置
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await auth(request)
    if (!user || !user.permissions.includes('SERVICE_UPDATE')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const { 
      extendDuration,
      updateScope,
      addToBroadcast = false
    } = body

    // 检查服务是否存在
    const capability = await db.capability.findUnique({
      where: { id },
      include: {
        node: true
      }
    })
    if (!capability) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // 如果请求广播到上级（支持故事#6）
    if (addToBroadcast) {
      const broadcastConfig = {
        action: 'broadcast_to_parent',
        serviceId: id,
        nodeId: capability.nodeId,
        productType: capability.productType,
        serviceType: capability.serviceType,
        endpoint: capability.endpoint,
        broadcastedBy: user.id,
        broadcastedAt: new Date().toISOString()
      }

      // 记录广播日志 - 不需要关联到具体数据集
      try {
        await db.service.create({
          data: {
            datasetId: 'broadcast', // 系统服务
            serviceType: capability.serviceType,
            endpoint: capability.endpoint,
            configuration: JSON.stringify(broadcastConfig)
          }
        })
      } catch (logError) {
        // 如果日志记录失败，不影响主要功能
        console.warn('Failed to log service broadcast:', logError)
      }

      // 在实际系统中，这里会调用父节点的API来注册服务
      const broadcastResult = {
        success: true,
        message: 'Service broadcasted to parent node successfully',
        broadcastedAt: broadcastConfig.broadcastedAt,
        parentNode: capability.node.parentId ? 'Parent node will be notified' : 'No parent node found'
      }

      return NextResponse.json({
        message: 'Service broadcasted successfully',
        broadcastResult
      })
    }

    // 更新试点配置
    const updateConfig = {
      action: 'update_pilot',
      serviceId: id,
      nodeId: capability.nodeId,
      extendDuration,
      updateScope,
      updatedBy: user.id,
      updatedAt: new Date().toISOString()
    }

    // 记录更新日志 - 不需要关联到具体数据集
    try {
      await db.service.create({
        data: {
          datasetId: 'pilot', // 系统服务
          serviceType: capability.serviceType,
          endpoint: capability.endpoint,
          configuration: JSON.stringify(updateConfig)
        }
      })
    } catch (logError) {
      // 如果日志记录失败，不影响主要功能
      console.warn('Failed to log pilot update:', logError)
    }

    return NextResponse.json({
      message: 'Service pilot updated successfully',
      updateResult: updateConfig
    })
  } catch (error) {
    console.error('Error updating service pilot:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// DELETE /api/services/[id]/pilot - 结束试点
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await auth(request)
    if (!user || !user.permissions.includes('SERVICE_DELETE')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = params

    // 检查服务是否存在
    const capability = await db.capability.findUnique({
      where: { id },
      include: {
        node: true
      }
    })
    if (!capability) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // 记录试点结束日志 - 不需要关联到具体数据集
    try {
      await db.service.create({
        data: {
          datasetId: 'pilot', // 系统服务
          serviceType: capability.serviceType,
          endpoint: capability.endpoint,
          configuration: JSON.stringify({
            action: 'end_pilot',
            serviceId: id,
            nodeId: capability.nodeId,
            endedBy: user.id,
            endedAt: new Date().toISOString()
          })
        }
      })
    } catch (logError) {
      // 如果日志记录失败，不影响主要功能
      console.warn('Failed to log pilot end:', logError)
    }

    return NextResponse.json({
      message: 'Service pilot ended successfully',
      endedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error ending service pilot:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}