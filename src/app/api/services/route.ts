import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// GET /api/services - 获取所有服务
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const nodeId = searchParams.get('nodeId')
    const productType = searchParams.get('productType')
    const serviceType = searchParams.get('serviceType')
    const status = searchParams.get('status')

    // 构建查询条件
    const where: any = {}
    if (nodeId) where.nodeId = nodeId
    if (productType) where.productType = productType
    if (serviceType) where.serviceType = serviceType
    if (status) where.isEnabled = status === 'true'

    // 获取服务能力
    const capabilities = await db.capability.findMany({
      where,
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true,
            level: true,
            apiUrl: true
          }
        }
      },
      orderBy: [
        { node: { level: 'asc' } },
        { productType: 'asc' },
        { serviceType: 'asc' }
      ]
    })

    // 转换为服务管理页面需要的格式
    const services = capabilities.map(cap => {
      // 模拟一些运行时数据（在实际项目中应该从服务监控表获取）
      const uptime = cap.isEnabled ? '99.9%' : '0%'
      const requestCount = cap.isEnabled ? Math.floor(Math.random() * 20000) + 1000 : 0
      const avgResponseTime = cap.isEnabled ? Math.floor(Math.random() * 500) + 100 : 0
      const lastUpdated = cap.updatedAt.toISOString()

      // 根据服务类型确定支持的图层和格式
      let layers: string[] = []
      let formats: string[] = []

      switch (cap.serviceType) {
        case 'WMS':
          layers = [`${cap.productType.toLowerCase()}_navigation`, `${cap.productType.toLowerCase()}_depth`]
          formats = ['image/png', 'image/jpeg', 'application/json']
          break
        case 'WFS':
          layers = [`${cap.productType.toLowerCase()}_features`, `${cap.productType.toLowerCase()}_elements`]
          formats = ['application/json', 'application/gml', 'text/xml']
          break
        case 'WCS':
          layers = [`${cap.productType.toLowerCase()}_coverage`, `${cap.productType.toLowerCase()}_grid`]
          formats = ['image/tiff', 'application/netcdf']
          break
      }

      // 确定服务状态
      let serviceStatus = 'OFFLINE'
      if (cap.isEnabled) {
        // 模拟健康检查状态
        const healthScore = Math.random()
        if (healthScore > 0.9) {
          serviceStatus = 'ACTIVE'
        } else if (healthScore > 0.7) {
          serviceStatus = 'WARNING'
        } else {
          serviceStatus = 'ERROR'
        }
      }

      return {
        id: `${cap.productType.toLowerCase()}-${cap.serviceType.toLowerCase()}-${cap.nodeId}`,
        name: `${cap.productType} ${getServiceTypeName(cap.serviceType)}服务`,
        type: cap.serviceType,
        product: cap.productType,
        version: cap.version || '1.0.0',
        status: serviceStatus,
        endpoint: cap.endpoint,
        node: cap.node.name,
        nodeType: cap.node.type,
        nodeId: cap.nodeId,
        lastUpdated,
        uptime,
        requestCount,
        avgResponseTime,
        layers,
        formats,
        description: `${cap.productType} ${getServiceTypeName(cap.serviceType)}服务，由${cap.node.name}提供`,
        isEnabled: cap.isEnabled
      }
    })

    // 计算统计数据
    const stats = {
      total: services.length,
      active: services.filter(s => s.status === 'ACTIVE').length,
      warning: services.filter(s => s.status === 'WARNING').length,
      error: services.filter(s => s.status === 'ERROR').length,
      maintenance: services.filter(s => s.status === 'MAINTENANCE').length,
      byProduct: {
        S101: services.filter(s => s.product === 'S101').length,
        S102: services.filter(s => s.product === 'S102').length,
        S104: services.filter(s => s.product === 'S104').length,
        S111: services.filter(s => s.product === 'S111').length,
        S124: services.filter(s => s.product === 'S124').length,
        S125: services.filter(s => s.product === 'S125').length,
        S131: services.filter(s => s.product === 'S131').length
      },
      byType: {
        WMS: services.filter(s => s.type === 'WMS').length,
        WFS: services.filter(s => s.type === 'WFS').length,
        WCS: services.filter(s => s.type === 'WCS').length
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        services,
        stats,
        filters: {
          nodeId,
          productType,
          serviceType,
          status
        }
      }
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

// 获取服务类型名称
function getServiceTypeName(serviceType: string): string {
  switch (serviceType) {
    case 'WMS': return 'Web地图服务'
    case 'WFS': return 'Web要素服务'
    case 'WCS': return 'Web覆盖服务'
    default: return serviceType
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