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

interface CreateServiceRequest {
  service_id: string
  product_id: string
  service_type: string
  linked_dataset_id?: string
  configuration: Record<string, any>
}

// GET /admin/services - 列出本节点配置的所有服务实例
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productType = searchParams.get('product_type')
    const serviceType = searchParams.get('service_type')
    const isActive = searchParams.get('is_active')
    const datasetId = searchParams.get('dataset_id')

    const whereClause: any = {}
    if (productType) {
      // 需要通过关联的dataset来过滤
      whereClause.dataset = {
        productType: productType
      }
    }
    if (serviceType) {
      whereClause.serviceType = serviceType
    }
    if (isActive !== null) {
      whereClause.isActive = isActive === 'true'
    }
    if (datasetId) {
      whereClause.datasetId = datasetId
    }

    const services = await db.service.findMany({
      where: whereClause,
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
            productType: true,
            version: true,
            status: true,
            nodeId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const response: ServiceInstance[] = services.map(service => ({
      id: service.id,
      service_id: service.id, // 使用相同的ID作为service_id
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
    }))

    return NextResponse.json({
      services: response,
      total: response.length
    })

  } catch (error) {
    console.error('Error fetching services:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'list_services' })
  }
}

// POST /admin/services - 创建一个新的服务实例来发布数据集
export async function POST(request: NextRequest) {
  try {
    const body: CreateServiceRequest = await request.json()
    const {
      service_id,
      product_id,
      service_type,
      linked_dataset_id,
      configuration = {}
    } = body

    // 验证必填字段
    if (!service_id || !product_id || !service_type) {
      return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
        required: ['service_id', 'product_id', 'service_type'],
        provided: Object.keys(body)
      })
    }

    // 验证服务类型
    const validServiceTypes = ['WFS', 'WMS', 'WCS']
    if (!validServiceTypes.includes(service_type.toUpperCase())) {
      return ApiErrorHandler.createErrorResponse('INVALID_SERVICE_TYPE', {
        service_type: service_type,
        valid_types: validServiceTypes
      })
    }

    // 验证产品类型
    const validProductTypes = ['S101', 'S102', 'S104', 'S111', 'S124', 'S125', 'S131']
    if (!validProductTypes.includes(product_id.toUpperCase())) {
      return ApiErrorHandler.createErrorResponse('INVALID_PRODUCT_TYPE', {
        product_id: product_id,
        valid_types: validProductTypes
      })
    }

    // 如果指定了数据集，验证数据集是否存在
    if (linked_dataset_id) {
      const dataset = await db.dataset.findUnique({
        where: { id: linked_dataset_id }
      })

      if (!dataset) {
        return ApiErrorHandler.createErrorResponse('DATASET_NOT_FOUND', {
          dataset_id: linked_dataset_id
        })
      }

      // 验证数据集产品类型是否匹配
      if (dataset.productType !== product_id.toUpperCase()) {
        return ApiErrorHandler.createErrorResponse('PRODUCT_TYPE_MISMATCH', {
          dataset_product: dataset.productType,
          requested_product: product_id
        })
      }
    }

    // 检查服务ID是否已存在
    const existingService = await db.service.findUnique({
      where: { id: service_id }
    })

    if (existingService) {
      return ApiErrorHandler.createErrorResponse('SERVICE_ALREADY_EXISTS', {
        service_id: service_id
      })
    }

    // 创建服务实例
    const newService = await db.service.create({
      data: {
        id: service_id,
        datasetId: linked_dataset_id || null,
        serviceType: service_type.toUpperCase() as any,
        endpoint: `/api/${product_id.toLowerCase()}/${service_type.toLowerCase()}`,
        configuration: JSON.stringify(configuration),
        isActive: true
      },
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

    // 如果关联了数据集，更新数据集状态
    if (linked_dataset_id) {
      await db.dataset.update({
        where: { id: linked_dataset_id },
        data: { status: 'PUBLISHED' }
      })
    }

    const response: ServiceInstance = {
      id: newService.id,
      service_id: newService.id,
      product_id: newService.dataset?.productType || product_id,
      service_type: newService.serviceType,
      linked_dataset_id: newService.datasetId,
      configuration: newService.configuration ? JSON.parse(newService.configuration as string) : {},
      is_active: newService.isActive,
      created_at: newService.createdAt.toISOString(),
      updated_at: newService.updatedAt.toISOString(),
      dataset: newService.dataset ? {
        id: newService.dataset.id,
        name: newService.dataset.name,
        product_type: newService.dataset.productType,
        version: newService.dataset.version,
        status: newService.dataset.status
      } : undefined
    }

    return NextResponse.json({
      message: 'Service instance created successfully',
      service: response
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating service:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', { operation: 'create_service' })
  }
}