import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler } from '@/lib/api-error'

// GET /admin/nodes/{id} - 获取特定子节点的详细信息和缓存的能力
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {

    const node = await db.node.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            healthStatus: true,
            isActive: true
          }
        },
        capabilities: {
          where: { isEnabled: true },
          select: {
            productType: true,
            serviceType: true,
            endpoint: true,
            version: true
          }
        },
        datasets: {
          select: {
            id: true,
            name: true,
            productType: true,
            status: true,
            publishedAt: true
          }
        },
        serviceDirectoryEntries: {
          select: {
            productType: true,
            serviceType: true,
            endpoint: true,
            isEnabled: true,
            lastSyncedAt: true,
            confidence: true
          }
        },
        _count: {
          select: {
            children: true,
            capabilities: true,
            datasets: true,
            users: true
          }
        }
      }
    })

    if (!node) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: id })
    }

    // 解析覆盖范围
    let coverage = null
    if (node.coverage) {
      try {
        coverage = JSON.parse(node.coverage as string)
      } catch (error) {
        console.warn('Failed to parse coverage for node:', id)
      }
    }

    // 获取缓存的能力信息（从服务目录）
    const cachedCapabilities = await db.serviceDirectoryEntry.findMany({
      where: { nodeId: id, isEnabled: true },
      orderBy: { lastSyncedAt: 'desc' }
    })

    const response = {
      ...node,
      coverage,
      cachedCapabilities,
      healthCheck: {
        lastCheck: node.lastHealthCheck,
        status: node.healthStatus,
        nextCheck: node.lastHealthCheck 
          ? new Date(node.lastHealthCheck.getTime() + 5 * 60 * 1000).toISOString()
          : null
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching node details:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'get_node_details' })
  }
}

// PUT /admin/nodes/{id} - 更新子节点的注册信息
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    const { name, description, apiUrl, adminUrl, coverage, isActive, parentId } = body

    // 验证节点是否存在
    const existingNode = await db.node.findUnique({
      where: { id }
    })

    if (!existingNode) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: id })
    }

    // 如果要更改父节点，验证新父节点是否存在
    if (parentId && parentId !== existingNode.parentId) {
      if (parentId === id) {
        return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
          field: 'parent_id',
          message: 'Node cannot be its own parent'
        })
      }

      const parentNode = await db.node.findUnique({
        where: { id: parentId }
      })

      if (!parentNode) {
        return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { parent_id: parentId })
      }

      // 检查是否会创建循环引用
      const checkCircularRef = async (checkId: string, targetId: string): Promise<boolean> => {
        const node = await db.node.findUnique({
          where: { id: checkId },
          select: { parentId: true }
        })
        
        if (!node || !node.parentId) return false
        if (node.parentId === targetId) return true
        return await checkCircularRef(node.parentId, targetId)
      }

      const isCircular = await checkCircularRef(parentId, id)
      if (isCircular) {
        return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
          field: 'parent_id',
          message: 'Circular reference detected'
        })
      }
    }

    // 验证覆盖范围格式（如果提供）
    let parsedCoverage = null
    if (coverage) {
      try {
        parsedCoverage = typeof coverage === 'string' ? JSON.parse(coverage) : coverage
        JSON.stringify(parsedCoverage) // 验证是否可以序列化
      } catch (error) {
        return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
          field: 'coverage',
          message: 'Invalid GeoJSON format'
        })
      }
    }

    // 更新节点
    const updatedNode = await db.node.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(apiUrl && { apiUrl }),
        ...(adminUrl !== undefined && { adminUrl }),
        ...(coverage && { coverage: JSON.stringify(parsedCoverage) }),
        ...(isActive !== undefined && { isActive }),
        ...(parentId !== undefined && { parentId })
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true
          }
        },
        children: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // 记录更新日志
    console.log(`Node updated: ${id} (${updatedNode.name})`)

    return NextResponse.json({
      ...updatedNode,
      coverage: updatedNode.coverage ? JSON.parse(updatedNode.coverage as string) : null
    })

  } catch (error) {
    console.error('Error updating node:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'update_node' })
  }
}

// DELETE /admin/nodes/{id} - 注销一个子节点
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // 验证节点是否存在
    const node = await db.node.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            datasets: true,
            users: true
          }
        }
      }
    })

    if (!node) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: id })
    }

    // 检查是否有子节点
    if (node._count.children > 0) {
      return ApiErrorHandler.createErrorResponse('NODE_HAS_CHILDREN', {
        node_id: id,
        children_count: node._count.children
      })
    }

    // 检查是否有关联的数据集或用户
    if (node._count.datasets > 0 || node._count.users > 0) {
      return ApiErrorHandler.createErrorResponse('NODE_HAS_DEPENDENCIES', {
        node_id: id,
        datasets_count: node._count.datasets,
        users_count: node._count.users
      })
    }

    // 删除相关的能力记录
    await db.capability.deleteMany({
      where: { nodeId: id }
    })

    // 删除服务目录条目
    await db.serviceDirectoryEntry.deleteMany({
      where: { nodeId: id }
    })

    // 删除节点
    await db.node.delete({
      where: { id }
    })

    // 记录删除日志
    console.log(`Node deleted: ${id} (${node.name})`)

    return NextResponse.json({
      message: 'Node deleted successfully',
      node_id: id
    })

  } catch (error) {
    console.error('Error deleting node:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'delete_node' })
  }
}