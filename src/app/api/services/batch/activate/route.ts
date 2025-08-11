import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 批量激活服务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      serviceIds, 
      options = {
        async: true,
        validateBeforeActivate: true
      }
    } = body

    // 验证必填字段
    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段: serviceIds (数组)' },
        { status: 400 }
      )
    }

    // 验证服务数量限制
    if (serviceIds.length > 200) {
      return NextResponse.json(
        { success: false, error: '单次批量操作最多支持200个服务' },
        { status: 400 }
      )
    }

    // 检查服务是否存在
    const services = await db.service.findMany({
      where: { id: { in: serviceIds } },
      include: { 
        dataset: {
          include: { node: true }
        }
      }
    })

    if (services.length !== serviceIds.length) {
      const foundIds = services.map(s => s.id)
      const missingIds = serviceIds.filter(id => !foundIds.includes(id))
      return NextResponse.json(
        { success: false, error: `以下服务不存在: ${missingIds.join(', ')}` },
        { status: 404 }
      )
    }

    // 过滤出可以激活的服务
    const activableServices = services.filter(s => !s.isActive)
    const alreadyActive = services.filter(s => s.isActive)

    if (activableServices.length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有可激活的服务',
        data: {
          alreadyActive: alreadyActive.map(s => s.id)
        }
      }, { status: 400 })
    }

    // 如果需要验证，先检查服务可用性
    if (options.validateBeforeActivate) {
      const validationResults = await validateServices(activableServices)
      const invalidServices = validationResults.filter(r => !r.isValid)
      
      if (invalidServices.length > 0) {
        return NextResponse.json({
          success: false,
          error: '部分服务验证失败，无法激活',
          data: {
            validationResults,
            invalidServices: invalidServices.map(s => s.serviceId)
          }
        }, { status: 400 })
      }
    }

    // 创建批量操作记录
    const batchOperation = await db.batchOperation.create({
      data: {
        operationType: 'SERVICE_ACTIVATE',
        status: 'PENDING',
        totalItems: activableServices.length,
        itemIds: activableServices.map(s => s.id)
      }
    })

    // 开始批量激活
    if (options.async) {
      // 异步处理
      processBatchActivate(activableServices, batchOperation.id).catch(error => {
        console.error('批量激活失败:', error)
      })

      return NextResponse.json({
        success: true,
        message: '批量激活任务已启动',
        data: {
          batchOperationId: batchOperation.id,
          totalItems: batchOperation.totalItems,
          alreadyActive: alreadyActive.length,
          async: true
        }
      })
    } else {
      // 同步处理
      const result = await processBatchActivateSync(activableServices)

      return NextResponse.json({
        success: true,
        message: '批量激活完成',
        data: {
          ...result,
          alreadyActive: alreadyActive.length,
          async: false
        }
      })
    }

  } catch (error) {
    console.error('批量激活服务失败:', error)
    return NextResponse.json(
      { success: false, error: '批量激活服务失败' },
      { status: 500 }
    )
  }
}

// 批量停用服务
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      serviceIds, 
      options = {
        async: true,
        force: false
      }
    } = body

    // 验证必填字段
    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段: serviceIds (数组)' },
        { status: 400 }
      )
    }

    // 检查服务是否存在
    const services = await db.service.findMany({
      where: { id: { in: serviceIds } }
    })

    if (services.length !== serviceIds.length) {
      const foundIds = services.map(s => s.id)
      const missingIds = serviceIds.filter(id => !foundIds.includes(id))
      return NextResponse.json(
        { success: false, error: `以下服务不存在: ${missingIds.join(', ')}` },
        { status: 404 }
      )
    }

    // 过滤出可以停用的服务
    const deactivableServices = services.filter(s => s.isActive)
    const alreadyInactive = services.filter(s => !s.isActive)

    if (deactivableServices.length === 0) {
      return NextResponse.json({
        success: false,
        error: '没有可停用的服务',
        data: {
          alreadyInactive: alreadyInactive.map(s => s.id)
        }
      }, { status: 400 })
    }

    // 创建批量操作记录
    const batchOperation = await db.batchOperation.create({
      data: {
        operationType: 'SERVICE_DEACTIVATE',
        status: 'PENDING',
        totalItems: deactivableServices.length,
        itemIds: deactivableServices.map(s => s.id)
      }
    })

    // 开始批量停用
    if (options.async) {
      // 异步处理
      processBatchDeactivate(deactivableServices, batchOperation.id).catch(error => {
        console.error('批量停用失败:', error)
      })

      return NextResponse.json({
        success: true,
        message: '批量停用任务已启动',
        data: {
          batchOperationId: batchOperation.id,
          totalItems: batchOperation.totalItems,
          alreadyInactive: alreadyInactive.length,
          async: true
        }
      })
    } else {
      // 同步处理
      const result = await processBatchDeactivateSync(deactivableServices)

      return NextResponse.json({
        success: true,
        message: '批量停用完成',
        data: {
          ...result,
          alreadyInactive: alreadyInactive.length,
          async: false
        }
      })
    }

  } catch (error) {
    console.error('批量停用服务失败:', error)
    return NextResponse.json(
      { success: false, error: '批量停用服务失败' },
      { status: 500 }
    )
  }
}

// 验证服务可用性
async function validateServices(services: any[]) {
  const validationResults = []

  for (const service of services) {
    try {
      // 构建服务端点URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const serviceUrl = `${baseUrl}${service.endpoint}`

      const response = await fetch(serviceUrl, {
        method: 'GET',
        timeout: 10000
      })

      validationResults.push({
        serviceId: service.id,
        isValid: response.ok,
        status: response.status,
        responseTime: Date.now()
      })

    } catch (error) {
      validationResults.push({
        serviceId: service.id,
        isValid: false,
        error: error instanceof Error ? error.message : '验证失败'
      })
    }
  }

  return validationResults
}

// 异步处理批量激活
async function processBatchActivate(services: any[], batchOperationId: string) {
  try {
    await db.batchOperation.update({
      where: { id: batchOperationId },
      data: { status: 'PROCESSING' }
    })

    let successCount = 0
    let failureCount = 0
    const errors: string[] = []

    for (let i = 0; i < services.length; i++) {
      const service = services[i]
      
      try {
        await db.service.update({
          where: { id: service.id },
          data: { 
            isActive: true,
            activatedAt: new Date()
          }
        })
        successCount++
      } catch (error) {
        failureCount++
        const errorMsg = `服务 ${service.id} 激活失败: ${error instanceof Error ? error.message : '未知错误'}`
        errors.push(errorMsg)
      }

      await db.batchOperation.update({
        where: { id: batchOperationId },
        data: {
          processedItems: i + 1,
          successCount,
          failureCount,
          errors: errors.length > 10 ? errors.slice(0, 10) : errors
        }
      })
    }

    await db.batchOperation.update({
      where: { id: batchOperationId },
      data: {
        status: failureCount === 0 ? 'COMPLETED' : 'PARTIAL_SUCCESS',
        completedAt: new Date(),
        errors: errors.length > 50 ? errors.slice(0, 50) : errors
      }
    })

  } catch (error) {
    console.error('批量激活处理失败:', error)
    await db.batchOperation.update({
      where: { id: batchOperationId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errors: [`批量激活处理失败: ${error instanceof Error ? error.message : '未知错误'}`]
      }
    })
  }
}

// 同步处理批量激活
async function processBatchActivateSync(services: any[]) {
  let successCount = 0
  let failureCount = 0
  const errors: string[] = []
  const results: any[] = []

  for (const service of services) {
    try {
      await db.service.update({
        where: { id: service.id },
        data: { 
          isActive: true,
          activatedAt: new Date()
        }
      })
      successCount++
      results.push({
        serviceId: service.id,
        status: 'SUCCESS'
      })
    } catch (error) {
      failureCount++
      const errorMsg = `服务 ${service.id} 激活失败: ${error instanceof Error ? error.message : '未知错误'}`
      errors.push(errorMsg)
      results.push({
        serviceId: service.id,
        status: 'FAILED',
        error: errorMsg
      })
    }
  }

  return {
    totalItems: services.length,
    successCount,
    failureCount,
    errors: errors.length > 10 ? errors.slice(0, 10) : errors,
    results
  }
}

// 异步处理批量停用
async function processBatchDeactivate(services: any[], batchOperationId: string) {
  try {
    await db.batchOperation.update({
      where: { id: batchOperationId },
      data: { status: 'PROCESSING' }
    })

    let successCount = 0
    let failureCount = 0
    const errors: string[] = []

    for (let i = 0; i < services.length; i++) {
      const service = services[i]
      
      try {
        await db.service.update({
          where: { id: service.id },
          data: { 
            isActive: false,
            deactivatedAt: new Date()
          }
        })
        successCount++
      } catch (error) {
        failureCount++
        const errorMsg = `服务 ${service.id} 停用失败: ${error instanceof Error ? error.message : '未知错误'}`
        errors.push(errorMsg)
      }

      await db.batchOperation.update({
        where: { id: batchOperationId },
        data: {
          processedItems: i + 1,
          successCount,
          failureCount,
          errors: errors.length > 10 ? errors.slice(0, 10) : errors
        }
      })
    }

    await db.batchOperation.update({
      where: { id: batchOperationId },
      data: {
        status: failureCount === 0 ? 'COMPLETED' : 'PARTIAL_SUCCESS',
        completedAt: new Date(),
        errors: errors.length > 50 ? errors.slice(0, 50) : errors
      }
    })

  } catch (error) {
    console.error('批量停用处理失败:', error)
    await db.batchOperation.update({
      where: { id: batchOperationId },
      data: {
        status: 'FAILED',
        completedAt: new Date(),
        errors: [`批量停用处理失败: ${error instanceof Error ? error.message : '未知错误'}`]
      }
    })
  }
}

// 同步处理批量停用
async function processBatchDeactivateSync(services: any[]) {
  let successCount = 0
  let failureCount = 0
  const errors: string[] = []
  const results: any[] = []

  for (const service of services) {
    try {
      await db.service.update({
        where: { id: service.id },
        data: { 
          isActive: false,
          deactivatedAt: new Date()
        }
      })
      successCount++
      results.push({
        serviceId: service.id,
        status: 'SUCCESS'
      })
    } catch (error) {
      failureCount++
      const errorMsg = `服务 ${service.id} 停用失败: ${error instanceof Error ? error.message : '未知错误'}`
      errors.push(errorMsg)
      results.push({
        serviceId: service.id,
        status: 'FAILED',
        error: errorMsg
      })
    }
  }

  return {
    totalItems: services.length,
    successCount,
    failureCount,
    errors: errors.length > 10 ? errors.slice(0, 10) : errors,
    results
  }
}