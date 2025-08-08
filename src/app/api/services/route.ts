import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET /api/services - 获取所有服务
export async function GET(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await auth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const nodeId = searchParams.get('nodeId')
    const productType = searchParams.get('productType')
    const serviceType = searchParams.get('serviceType')

    // 构建查询条件
    const where: any = {}
    if (nodeId) where.nodeId = nodeId
    if (productType) where.productType = productType
    if (serviceType) where.serviceType = serviceType

    // 获取服务能力
    const capabilities = await db.capability.findMany({
      where,
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true,
            apiUrl: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // 获取服务实例
    const services = await db.service.findMany({
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
            productType: true,
            version: true,
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      capabilities,
      services,
      total: capabilities.length + services.length
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// POST /api/services - 注册新服务
export async function POST(request: NextRequest) {
  try {
    // 验证用户权限
    const user = await auth(request)
    if (!user || !user.permissions.includes('SERVICE_CREATE')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      nodeId,
      productType,
      serviceType,
      endpoint,
      version = '1.0.0',
      isEnabled = true
    } = body

    // 验证必填字段
    if (!nodeId || !productType || !serviceType || !endpoint) {
      return NextResponse.json(
        { error: 'Missing required fields: nodeId, productType, serviceType, endpoint' },
        { status: 400 }
      )
    }

    // 检查节点是否存在
    const node = await db.node.findUnique({
      where: { id: nodeId }
    })
    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // 检查服务是否已存在
    const existingCapability = await db.capability.findUnique({
      where: {
        nodeId_productType_serviceType: {
          nodeId,
          productType,
          serviceType
        }
      }
    })
    if (existingCapability) {
      return NextResponse.json(
        { error: 'Service capability already exists for this node' },
        { status: 409 }
      )
    }

    // 创建服务能力
    const capability = await db.capability.create({
      data: {
        nodeId,
        productType,
        serviceType,
        endpoint,
        version,
        isEnabled
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

    // 记录服务注册日志 - 不需要关联到具体数据集
    try {
      await db.service.create({
        data: {
          datasetId: 'system', // 系统服务
          serviceType,
          endpoint,
          configuration: JSON.stringify({
            action: 'register',
            nodeId,
            productType,
            registeredBy: user.id
          })
        }
      })
    } catch (logError) {
      // 如果日志记录失败，不影响主要功能
      console.warn('Failed to log service registration:', logError)
    }

    return NextResponse.json({
      message: 'Service registered successfully',
      capability
    })
  } catch (error) {
    console.error('Error registering service:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}