import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler } from '@/lib/api-error'

interface ServiceInstance {
  id: string
  service_id: string
  product_id: string
  service_type: string
  linked_dataset_id?: string
  configuration: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
  dataset?: {
    id: string
    name: string
    product_type: string
    version: string
    status: string
  }
}

interface UpdateServiceRequest {
  linked_dataset_id?: string
  configuration?: Record<string, any>
  is_active?: boolean
}

// GET /admin/services/{id} - 获取服务实例的详细配置
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const service = await db.service.findUnique({
      where: { id },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
            productType: true,
            version: true,
            status: true,
            nodeId: true,
            coverage: true,
            metadata: true
          }
        }
      }
    })

    if (!service) {
      return ApiErrorHandler.createErrorResponse('SERVICE_NOT_FOUND', {
        service_id: id
      })
    }

    const response: ServiceInstance = {
      id: service.id,
      service_id: service.id,
      product_id: service.dataset?.productType || 'system',
      service_type: service.serviceType,
      linked_dataset_id: service.datasetId,
      configuration: service.configuration ? JSON.parse(service.configuration as string) : {},
      is_active: service.isActive,
      created_at: service.createdAt.toISOString(),
      updated_at: service.updatedAt.toISOString(),
      dataset: service.dataset ? {
        id: service.dataset.id,
        name: service.dataset.name,
        product_type: service.dataset.productType,
        version: service.dataset.version,
        status: service.dataset.status
      } : undefined
    }

    // 添加服务健康状态和统计信息
    const serviceStats = {
      total_requests: 0, // 可以从监控表中获取
      error_rate: 0,
      average_response_time: 0,
      last_access: null
    }

    return NextResponse.json({
      service: response,
      stats: serviceStats,
      endpoints: {
        wms: `/api/${response.product_id.toLowerCase()}/wms`,
        wfs: `/api/${response.product_id.toLowerCase()}/wfs`,
        wcs: `/api/${response.product_id.toLowerCase()}/wcs`
      }
    })

  } catch (error) {
    console.error('Error fetching service:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'get_service' })
  }
}

// PUT /admin/services/{id} - 更新服务实例的配置（如更换数据集）
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body: UpdateServiceRequest = await request.json()

    // 验证服务是否存在
    const existingService = await db.service.findUnique({
      where: { id },
      include: {
        dataset: {
          select: {
            id: true,
            productType: true,
            status: true
          }
        }
      }
    })

    if (!existingService) {
      return ApiErrorHandler.createErrorResponse('SERVICE_NOT_FOUND', {
        service_id: id
      })
    }

    const updateData: any = {}

    // 处理数据集更换
    if (body.linked_dataset_id !== undefined) {
      if (body.linked_dataset_id) {
        // 验证新数据集是否存在
        const newDataset = await db.dataset.findUnique({
          where: { id: body.linked_dataset_id }
        })

        if (!newDataset) {
          return ApiErrorHandler.createErrorResponse('DATASET_NOT_FOUND', {
            dataset_id: body.linked_dataset_id
          })
        }

        // 验证产品类型是否匹配
        const currentProductType = existingService.dataset?.productType || 'system'
        if (newDataset.productType !== currentProductType) {
          return ApiErrorHandler.createErrorResponse('PRODUCT_TYPE_MISMATCH', {
            dataset_product: newDataset.productType,
            service_product: currentProductType
          })
        }

        updateData.datasetId = body.linked_dataset_id

        // 更新新数据集状态为已发布
        await db.dataset.update({
          where: { id: body.linked_dataset_id },
          data: { status: 'PUBLISHED' }
        })
      } else {
        updateData.datasetId = null
      }

      // 如果之前有关联的数据集，将其状态改为已上传
      if (existingService.datasetId) {
        await db.dataset.update({
          where: { id: existingService.datasetId },
          data: { status: 'UPLOADED' }
        })
      }
    }

    // 处理配置更新
    if (body.configuration !== undefined) {
      updateData.configuration = JSON.stringify(body.configuration)
    }

    // 处理激活状态更新
    if (body.is_active !== undefined) {
      updateData.isActive = body.is_active
    }

    // 更新服务
    const updatedService = await db.service.update({
      where: { id },
      data: updateData,
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
      }
    })

    const response: ServiceInstance = {
      id: updatedService.id,
      service_id: updatedService.id,
      product_id: updatedService.dataset?.productType || 'system',
      service_type: updatedService.serviceType,
      linked_dataset_id: updatedService.datasetId,
      configuration: updatedService.configuration ? JSON.parse(updatedService.configuration as string) : {},
      is_active: updatedService.isActive,
      created_at: updatedService.createdAt.toISOString(),
      updated_at: updatedService.updatedAt.toISOString(),
      dataset: updatedService.dataset ? {
        id: updatedService.dataset.id,
        name: updatedService.dataset.name,
        product_type: updatedService.dataset.productType,
        version: updatedService.dataset.version,
        status: updatedService.dataset.status
      } : undefined
    }

    return NextResponse.json({
      message: 'Service updated successfully',
      service: response
    })

  } catch (error) {
    console.error('Error updating service:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'update_service' })
  }
}

// DELETE /admin/services/{id} - 删除服务实例的配置
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // 验证服务是否存在
    const service = await db.service.findUnique({
      where: { id },
      include: {
        dataset: {
          select: {
            id: true,
            status: true
          }
        }
      }
    })

    if (!service) {
      return ApiErrorHandler.createErrorResponse('SERVICE_NOT_FOUND', {
        service_id: id
      })
    }

    // 如果服务关联了数据集，更新数据集状态
    if (service.datasetId) {
      await db.dataset.update({
        where: { id: service.datasetId },
        data: { status: 'UPLOADED' }
      })
    }

    // 删除服务
    await db.service.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Service deleted successfully',
      service_id: id
    })

  } catch (error) {
    console.error('Error deleting service:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'delete_service' })
  }
}