import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 批量发布数据集
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      datasetIds, 
      options = {
        createServices: true,
        serviceTypes: ['WMS', 'WFS'],
        async: true
      }
    } = body

    // 验证必填字段
    if (!datasetIds || !Array.isArray(datasetIds) || datasetIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段: datasetIds (数组)' },
        { status: 400 }
      )
    }

    // 验证数据集数量限制
    if (datasetIds.length > 100) {
      return NextResponse.json(
        { success: false, error: '单次批量操作最多支持100个数据集' },
        { status: 400 }
      )
    }

    // 检查数据集是否存在
    const datasets = await db.dataset.findMany({
      where: { id: { in: datasetIds } },
      include: { node: true }
    })

    if (datasets.length !== datasetIds.length) {
      const foundIds = datasets.map(d => d.id)
      const missingIds = datasetIds.filter(id => !foundIds.includes(id))
      return NextResponse.json(
        { success: false, error: `以下数据集不存在: ${missingIds.join(', ')}` },
        { status: 404 }
      )
    }

    // 过滤出可以发布的数据集
    const publishableDatasets = datasets.filter(d => d.status === 'UPLOADED')
    const alreadyPublished = datasets.filter(d => d.status === 'PUBLISHED')
    const processingDatasets = datasets.filter(d => d.status === 'PROCESSING')

    if (publishableDatasets.length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有可发布的数据集',
        data: {
          alreadyPublished: alreadyPublished.map(d => d.id),
          processing: processingDatasets.map(d => d.id)
        }
      }, { status: 400 })
    }

    // 创建批量操作记录
    const batchOperation = await db.batchOperation.create({
      data: {
        operationType: 'DATASET_PUBLISH',
        status: 'PENDING',
        totalItems: publishableDatasets.length,
        itemIds: publishableDatasets.map(d => d.id)
      }
    })

    // 开始批量发布
    if (options.async) {
      // 异步处理
      processBatchPublish(publishableDatasets, options, batchOperation.id).catch(error => {
        console.error('批量发布失败:', error)
      })

      return NextResponse.json({
        success: true,
        message: '批量发布任务已启动',
        data: {
          batchOperationId: batchOperation.id,
          totalItems: batchOperation.totalItems,
          alreadyPublished: alreadyPublished.length,
          processing: processingDatasets.length,
          async: true
        }
      })
    } else {
      // 同步处理
      const result = await processBatchPublishSync(publishableDatasets, options)

      return NextResponse.json({
        success: true,
        message: '批量发布完成',
        data: {
          ...result,
          alreadyPublished: alreadyPublished.length,
          processing: processingDatasets.length,
          async: false
        }
      })
    }

  } catch (error) {
    console.error('批量发布数据集失败:', error)
    return NextResponse.json(
      { success: false, error: '批量发布数据集失败' },
      { status: 500 }
    )
  }
}

// 获取批量操作状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const operationId = searchParams.get('operationId')
    const operationType = searchParams.get('operationType')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const whereClause: any = {}
    if (operationId) whereClause.id = operationId
    if (operationType) whereClause.operationType = operationType
    if (status) whereClause.status = status

    const [operations, total] = await Promise.all([
      db.batchOperation.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.batchOperation.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: {
        operations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('获取批量操作状态失败:', error)
    return NextResponse.json(
      { success: false, error: '获取批量操作状态失败' },
      { status: 500 }
    )
  }
}

// 异步处理批量发布
async function processBatchPublish(datasets: any[], options: any, batchOperationId: string) {
  try {
    // 更新批量操作状态为处理中
    await db.batchOperation.update({
      where: { id: batchOperationId },
      data: { status: 'PROCESSING' }
    })

    let successCount = 0
    let failureCount = 0
    const errors: string[] = []

    // 逐个处理数据集
    for (let i = 0; i < datasets.length; i++) {
      const dataset = datasets[i]
      
      try {
        // 更新数据集状态为处理中
        await db.dataset.update({
          where: { id: dataset.id },
          data: { status: 'PROCESSING' }
        })

        // 创建服务
        const services = createServicesForDataset(dataset, options.serviceTypes)
        
        // 批量创建服务
        await db.service.createMany({
          data: services
        })

        // 更新数据集状态为已发布
        await db.dataset.update({
          where: { id: dataset.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date()
          }
        })

        successCount++

      } catch (error) {
        failureCount++
        const errorMsg = `数据集 ${dataset.name} 发布失败: ${error instanceof Error ? error.message : '未知错误'}`
        errors.push(errorMsg)
        
        // 更新数据集状态为错误
        await db.dataset.update({
          where: { id: dataset.id },
          data: { status: 'ERROR' }
        })
      }

      // 更新批量操作进度
      await db.batchOperation.update({
        where: { id: batchOperationId },
        data: {
          processedItems: i + 1,
          successCount,
          failureCount,
          errors: errors.length > 10 ? errors.slice(0, 10) : errors // 限制错误数量
        }
      })

      // 添加延迟避免过载
      if (i < datasets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // 更新批量操作状态为完成
    await db.batchOperation.update({
      where: { id: batchOperationId },
      data: {
        status: failureCount === 0 ? 'COMPLETED' : 'PARTIAL_SUCCESS',
        completedAt: new Date(),
        errors: errors.length > 50 ? errors.slice(0, 50) : errors // 限制错误数量
      }
    })

  } catch (error) {
    console.error('批量发布处理失败:', error)
    await db.batchOperation.update({
      where: { id: batchOperationId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errors: [`批量发布处理失败: ${error instanceof Error ? error.message : '未知错误'}`]
      }
    })
  }
}

// 同步处理批量发布
async function processBatchPublishSync(datasets: any[], options: any) {
  let successCount = 0
  let failureCount = 0
  const errors: string[] = []
  const results: any[] = []

  // 逐个处理数据集
  for (const dataset of datasets) {
    try {
      // 更新数据集状态为处理中
      await db.dataset.update({
        where: { id: dataset.id },
        data: { status: 'PROCESSING' }
      })

      // 创建服务
      const services = createServicesForDataset(dataset, options.serviceTypes)
      
      // 批量创建服务
      await db.service.createMany({
        data: services
      })

      // 更新数据集状态为已发布
      await db.dataset.update({
        where: { id: dataset.id },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date()
        }
      })

      successCount++
      results.push({
        datasetId: dataset.id,
        status: 'SUCCESS',
        servicesCreated: services.length
      })

    } catch (error) {
      failureCount++
      const errorMsg = `数据集 ${dataset.name} 发布失败: ${error instanceof Error ? error.message : '未知错误'}`
      errors.push(errorMsg)
      
      // 更新数据集状态为错误
      await db.dataset.update({
        where: { id: dataset.id },
        data: { status: 'ERROR' }
      })

      results.push({
        datasetId: dataset.id,
        status: 'FAILED',
        error: errorMsg
      })
    }
  }

  return {
    totalItems: datasets.length,
    successCount,
    failureCount,
    errors: errors.length > 10 ? errors.slice(0, 10) : errors,
    results
  }
}

// 为数据集创建服务
function createServicesForDataset(dataset: any, serviceTypes: string[]) {
  const services: any[] = []

  for (const serviceType of serviceTypes) {
    let configuration = {}

    switch (dataset.productType) {
      case 'S101':
        if (serviceType === 'WFS') {
          configuration = {
            supportedFormats: ['GeoJSON', 'GML'],
            maxFeatures: 1000
          }
        } else if (serviceType === 'WMS') {
          configuration = {
            supportedFormats: ['image/png', 'image/jpeg'],
            maxWidth: 2048,
            maxHeight: 2048
          }
        }
        break

      case 'S102':
        if (serviceType === 'WCS') {
          configuration = {
            supportedFormats: ['GeoTIFF', 'NetCDF'],
            interpolation: 'nearest'
          }
        } else if (serviceType === 'WMS') {
          configuration = {
            supportedFormats: ['image/png', 'image/jpeg'],
            colorScale: 'viridis'
          }
        }
        break

      default:
        if (serviceType === 'WMS') {
          configuration = {
            supportedFormats: ['image/png', 'image/jpeg']
          }
        }
    }

    services.push({
      datasetId: dataset.id,
      serviceType,
      endpoint: `/api/v1/${dataset.productType.toLowerCase()}/${serviceType.toLowerCase()}?dataset=${dataset.id}`,
      configuration: JSON.stringify(configuration)
    })
  }

  return services
}