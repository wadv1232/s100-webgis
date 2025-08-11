import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取实验性服务列表
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { nodeId, status, expiringSoon } = request.nextUrl.searchParams

    // 构建查询条件
    const where: any = { isExperimental: true }
    
    if (nodeId) {
      where.nodeId = nodeId
    }
    
    if (status && status !== 'ALL') {
      where.status = status
    }

    // 获取实验性服务
    let services = await db.dataset.findMany({
      where,
      include: {
        node: true,
        services: true,
        deployments: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // 过滤即将过期的服务
    if (expiringSoon === 'true') {
      const now = new Date()
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      services = services.filter(service => 
        service.experimentalExpires && 
        service.experimentalExpires <= sevenDaysFromNow &&
        service.experimentalExpires > now
      )
    }

    // 为每个服务添加过期状态
    const servicesWithStatus = services.map(service => ({
      ...service,
      isExpiringSoon: isExpiringSoon(service.experimentalExpires),
      daysUntilExpiry: service.experimentalExpires ? 
        Math.ceil((service.experimentalExpires.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
    }))

    return NextResponse.json({ services: servicesWithStatus })
  } catch (error) {
    console.error('Error fetching experimental services:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// 创建实验性服务
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      name,
      description,
      productType,
      nodeId,
      fileName,
      filePath,
      fileSize,
      mimeType,
      coverage,
      metadata,
      experimentalNotes,
      experimentalExpires,
      accessControl
    } = await request.json()

    // 验证必要字段
    if (!name || !productType || !nodeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 验证节点存在
    const node = await db.node.findUnique({
      where: { id: nodeId }
    })

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // 创建实验性服务
    const service = await db.dataset.create({
      data: {
        name,
        description,
        productType,
        version: '1.0.0',
        status: 'EXPERIMENTAL',
        fileName: fileName || `${name.toLowerCase().replace(/\s+/g, '_')}.zip`,
        filePath: filePath || `/uploads/experimental/${Date.now()}_${name.toLowerCase().replace(/\s+/g, '_')}.zip`,
        fileSize: fileSize || 0,
        mimeType: mimeType || 'application/zip',
        coverage,
        metadata: metadata ? JSON.stringify(metadata) : null,
        nodeId,
        isExperimental: true,
        experimentalNotes,
        experimentalExpires: experimentalExpires ? new Date(experimentalExpires) : null,
        accessControl: accessControl ? JSON.stringify(accessControl) : null
      },
      include: {
        node: true,
        services: true
      }
    })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error creating experimental service:', error)
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