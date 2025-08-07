import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取节点服务能力
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const capabilities = await db.capability.findMany({
      where: { nodeId: id },
      orderBy: [
        { productType: 'asc' },
        { serviceType: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: capabilities
    })
  } catch (error) {
    console.error('获取节点服务能力失败:', error)
    return NextResponse.json(
      { success: false, error: '获取节点服务能力失败' },
      { status: 500 }
    )
  }
}

// 添加节点服务能力
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      productType,
      serviceType,
      isEnabled = true,
      endpoint,
      version
    } = body

    // 验证必填字段
    if (!productType || !serviceType) {
      return NextResponse.json(
        { success: false, error: '产品类型和服务类型为必填项' },
        { status: 400 }
      )
    }

    // 检查节点是否存在
    const node = await db.node.findUnique({
      where: { id }
    })

    if (!node) {
      return NextResponse.json(
        { success: false, error: '节点不存在' },
        { status: 404 }
      )
    }

    // 检查是否已存在相同的能力
    const existingCapability = await db.capability.findUnique({
      where: {
        nodeId_productType_serviceType: {
          nodeId: id,
          productType,
          serviceType
        }
      }
    })

    if (existingCapability) {
      return NextResponse.json(
        { success: false, error: '该服务能力已存在' },
        { status: 400 }
      )
    }

    // 创建服务能力
    const capability = await db.capability.create({
      data: {
        nodeId: id,
        productType,
        serviceType,
        isEnabled,
        endpoint,
        version
      }
    })

    return NextResponse.json({
      success: true,
      data: capability
    })
  } catch (error) {
    console.error('添加节点服务能力失败:', error)
    return NextResponse.json(
      { success: false, error: '添加节点服务能力失败' },
      { status: 500 }
    )
  }
}