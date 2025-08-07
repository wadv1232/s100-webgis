import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取单个数据集详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const dataset = await db.dataset.findUnique({
      where: { id },
      include: {
        node: true,
        services: true
      }
    })

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: '数据集不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: dataset
    })
  } catch (error) {
    console.error('获取数据集详情失败:', error)
    return NextResponse.json(
      { success: false, error: '获取数据集详情失败' },
      { status: 500 }
    )
  }
}

// 更新数据集
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      version,
      coverage,
      metadata
    } = body

    // 检查数据集是否存在
    const existingDataset = await db.dataset.findUnique({
      where: { id }
    })

    if (!existingDataset) {
      return NextResponse.json(
        { success: false, error: '数据集不存在' },
        { status: 404 }
      )
    }

    // 更新数据集
    const dataset = await db.dataset.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(version && { version }),
        ...(coverage !== undefined && { coverage }),
        ...(metadata !== undefined && { metadata })
      },
      include: {
        node: true,
        services: true
      }
    })

    return NextResponse.json({
      success: true,
      data: dataset
    })
  } catch (error) {
    console.error('更新数据集失败:', error)
    return NextResponse.json(
      { success: false, error: '更新数据集失败' },
      { status: 500 }
    )
  }
}

// 删除数据集
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // 检查数据集是否存在
    const existingDataset = await db.dataset.findUnique({
      where: { id },
      include: {
        services: true
      }
    })

    if (!existingDataset) {
      return NextResponse.json(
        { success: false, error: '数据集不存在' },
        { status: 404 }
      )
    }

    // 删除相关服务
    await db.service.deleteMany({
      where: { datasetId: id }
    })

    // 删除数据集
    await db.dataset.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '数据集删除成功'
    })
  } catch (error) {
    console.error('删除数据集失败:', error)
    return NextResponse.json(
      { success: false, error: '删除数据集失败' },
      { status: 500 }
    )
  }
}