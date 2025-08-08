/**
 * @api {GET} /nodes/[id]/ get_nodes_[id]_
 * @apiName GETnodes_[id]_
 * @apiGroup 对外数据服务API
 * @apiCategory PUBLIC
 * @apiVersion 1.0.0
 * 
 * @apiDescription GET, PUT, DELETE endpoint for [id]
 * 
 * @apiCategoryDescription 节点对外提供S-100数据服务的统一入口。对最终用户可见。
 * 
 * @apiAuthentication 推荐使用`Authorization: Bearer <token>`或`?apikey=<key>`进行访问控制。
 * 
 * 
 * @apiSuccess {Response} response HTTP response object
 * @apiSuccess {{ id: string }} data Response data
 * 
 * @apiError {Number} code Error code
 * @apiError {String} message Error message
 * 
 * @apiExample {curl} Example usage:
 * curl -X GET http://localhost:3000/nodes/[id]/
 * 
 * @api {PUT} /nodes/[id]/ put_nodes_[id]_
 * @apiName PUTnodes_[id]_
 * @apiGroup 对外数据服务API
 * @apiCategory PUBLIC
 * @apiVersion 1.0.0
 * 
 * @apiDescription GET, PUT, DELETE endpoint for [id]
 * 
 * @apiCategoryDescription 节点对外提供S-100数据服务的统一入口。对最终用户可见。
 * 
 * @apiAuthentication 推荐使用`Authorization: Bearer <token>`或`?apikey=<key>`进行访问控制。
 * 
 * 
 * @apiSuccess {Response} response HTTP response object
 * @apiSuccess {{ id: string }} data Response data
 * 
 * @apiError {Number} code Error code
 * @apiError {String} message Error message
 * 
 * @apiExample {curl} Example usage:
 * curl -X PUT http://localhost:3000/nodes/[id]/
 * 
 * @api {DELETE} /nodes/[id]/ delete_nodes_[id]_
 * @apiName DELETEnodes_[id]_
 * @apiGroup 对外数据服务API
 * @apiCategory PUBLIC
 * @apiVersion 1.0.0
 * 
 * @apiDescription GET, PUT, DELETE endpoint for [id]
 * 
 * @apiCategoryDescription 节点对外提供S-100数据服务的统一入口。对最终用户可见。
 * 
 * @apiAuthentication 推荐使用`Authorization: Bearer <token>`或`?apikey=<key>`进行访问控制。
 * 
 * 
 * @apiSuccess {Response} response HTTP response object
 * @apiSuccess {{ id: string }} data Response data
 * 
 * @apiError {Number} code Error code
 * @apiError {String} message Error message
 * 
 * @apiExample {curl} Example usage:
 * curl -X DELETE http://localhost:3000/nodes/[id]/
 * 
 */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 获取单个节点详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const node = await db.node.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        capabilities: true,
        datasets: {
          include: {
            services: true
          }
        },
        childNodeRelations: {
          include: {
            child: true
          }
        },
        parentNodeRelations: {
          include: {
            parent: true
          }
        }
      }
    })

    if (!node) {
      return NextResponse.json(
        { success: false, error: '节点不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: node
    })
  } catch (error) {
    console.error('获取节点详情失败:', error)
    return NextResponse.json(
      { success: false, error: '获取节点详情失败' },
      { status: 500 }
    )
  }
}

// 更新节点
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      code,
      name,
      description,
      apiUrl,
      adminUrl,
      coverage,
      isActive,
      parentId,
      latitude,
      longitude
    } = body

    // 检查节点是否存在
    const existingNode = await db.node.findUnique({
      where: { id }
    })

    if (!existingNode) {
      return NextResponse.json(
        { success: false, error: '节点不存在' },
        { status: 404 }
      )
    }

    // 如果要修改父节点，检查新父节点是否存在
    if (parentId && parentId !== existingNode.parentId) {
      const parentNode = await db.node.findUnique({
        where: { id: parentId }
      })
      if (!parentNode) {
        return NextResponse.json(
          { success: false, error: '父节点不存在' },
          { status: 404 }
        )
      }
    }

    // 计算新的层级
    let level = existingNode.level
    if (parentId !== existingNode.parentId) {
      if (parentId) {
        const parentNode = await db.node.findUnique({
          where: { id: parentId }
        })
        if (parentNode) {
          level = parentNode.level + 1
        }
      } else {
        level = 0
      }
    }

    // 更新节点
    const node = await db.node.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(apiUrl && { apiUrl }),
        ...(adminUrl !== undefined && { adminUrl }),
        ...(coverage !== undefined && { coverage }),
        ...(isActive !== undefined && { isActive }),
        ...(parentId !== undefined && { parentId }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        ...(level !== existingNode.level && { level })
      },
      include: {
        parent: true,
        children: true,
        capabilities: true,
        datasets: true
      }
    })

    return NextResponse.json({
      success: true,
      data: node
    })
  } catch (error) {
    console.error('更新节点失败:', error)
    return NextResponse.json(
      { success: false, error: '更新节点失败' },
      { status: 500 }
    )
  }
}

// 删除节点
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // 检查节点是否存在
    const existingNode = await db.node.findUnique({
      where: { id },
      include: {
        children: true,
        datasets: true,
        childNodeRelations: true,
        parentNodeRelations: true
      }
    })

    if (!existingNode) {
      return NextResponse.json(
        { success: false, error: '节点不存在' },
        { status: 404 }
      )
    }

    // 检查是否有子节点
    if (existingNode.children.length > 0) {
      return NextResponse.json(
        { success: false, error: '该节点下还有子节点，无法删除' },
        { status: 400 }
      )
    }

    // 检查是否有关联的数据集
    if (existingNode.datasets.length > 0) {
      return NextResponse.json(
        { success: false, error: '该节点下还有数据集，无法删除' },
        { status: 400 }
      )
    }

    // 删除节点关系
    await db.childNode.deleteMany({
      where: {
        OR: [
          { parentId: id },
          { childId: id }
        ]
      }
    })

    // 删除节点
    await db.node.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: '节点删除成功'
    })
  } catch (error) {
    console.error('删除节点失败:', error)
    return NextResponse.json(
      { success: false, error: '删除节点失败' },
      { status: 500 }
    )
  }
}