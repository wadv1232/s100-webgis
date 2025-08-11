import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ServiceType } from '@prisma/client'
import { handleError, formatErrorResponse, logError } from '@/lib/utils/errors'

interface RouteParams {
  params: {
    id: string
  }
}

// 获取单个服务能力
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const capability = await db.capability.findUnique({
      where: { id: params.id },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true,
            level: true,
            apiUrl: true,
            coverage: true
          }
        }
      }
    })

    if (!capability) {
      return NextResponse.json(
        { success: false, error: 'Capability not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: capability
    })
  } catch (error) {
    const appError = handleError(error)
    logError(appError, { url: request.url, method: 'GET', id: params.id })
    
    return NextResponse.json(
      formatErrorResponse(appError),
      { status: appError.statusCode }
    )
  }
}

// 更新服务能力
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { nodeId, productType, serviceType, isEnabled, endpoint, version } = body

    // 检查能力是否存在
    const existingCapability = await db.capability.findUnique({
      where: { id: params.id }
    })

    if (!existingCapability) {
      return NextResponse.json(
        { success: false, error: 'Capability not found' },
        { status: 404 }
      )
    }

    // 验证节点是否存在（如果提供了nodeId）
    if (nodeId) {
      const node = await db.node.findUnique({
        where: { id: nodeId }
      })

      if (!node) {
        return NextResponse.json(
          { success: false, error: 'Node not found' },
          { status: 404 }
        )
      }
    }

    // 验证产品类型是否有效（如果提供了productType）
    if (productType) {
      const validProducts = ['S101', 'S102', 'S104', 'S111', 'S124', 'S125', 'S131']
      if (!validProducts.includes(productType)) {
        return NextResponse.json(
          { success: false, error: `Invalid product type. Valid types: ${validProducts.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // 验证服务类型是否有效（如果提供了serviceType）
    if (serviceType) {
      const validServices = Object.values(ServiceType)
      if (!validServices.includes(serviceType as ServiceType)) {
        return NextResponse.json(
          { success: false, error: `Invalid service type. Valid types: ${validServices.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // 检查是否与其他能力冲突
    if (nodeId && productType && serviceType) {
      const conflictingCapability = await db.capability.findFirst({
        where: {
          nodeId,
          productType,
          serviceType,
          id: { not: params.id }
        }
      })

      if (conflictingCapability) {
        return NextResponse.json(
          { success: false, error: 'Capability already exists for this node, product, and service type' },
          { status: 409 }
        )
      }
    }

    // 构建更新数据
    const updateData: any = {}
    if (nodeId !== undefined) updateData.nodeId = nodeId
    if (productType !== undefined) updateData.productType = productType
    if (serviceType !== undefined) updateData.serviceType = serviceType
    if (isEnabled !== undefined) updateData.isEnabled = isEnabled
    if (endpoint !== undefined) updateData.endpoint = endpoint
    if (version !== undefined) updateData.version = version
  
    // 更新服务能力
    const updatedCapability = await db.capability.update({
      where: { id: params.id },
      data: updateData,
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
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedCapability,
      message: 'Capability updated successfully'
    })
  } catch (error) {
    const appError = handleError(error)
    logError(appError, { url: request.url, method: 'PUT', id: params.id })
    
    return NextResponse.json(
      formatErrorResponse(appError),
      { status: appError.statusCode }
    )
  }
}

// 删除服务能力
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // 检查能力是否存在
    const existingCapability = await db.capability.findUnique({
      where: { id: params.id }
    })

    if (!existingCapability) {
      return NextResponse.json(
        { success: false, error: 'Capability not found' },
        { status: 404 }
      )
    }

    // 删除服务能力
    await db.capability.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Capability deleted successfully'
    })
  } catch (error) {
    const appError = handleError(error)
    logError(appError, { url: request.url, method: 'DELETE', id: params.id })
    
    return NextResponse.json(
      formatErrorResponse(appError),
      { status: appError.statusCode }
    )
  }
}