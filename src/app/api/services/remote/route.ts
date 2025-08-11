import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 注册远程服务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      name, 
      endpoint, 
      productType, 
      serviceType, 
      description,
      validationConfig 
    } = body

    // 验证必填字段
    if (!name || !endpoint || !productType || !serviceType) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段: name, endpoint, productType, serviceType' },
        { status: 400 }
      )
    }

    // 验证服务端点URL格式
    try {
      new URL(endpoint)
    } catch {
      return NextResponse.json(
        { success: false, error: '无效的服务端点URL' },
        { status: 400 }
      )
    }

    // 验证产品类型
    const validProductTypes = ['S101', 'S102', 'S104', 'S111', 'S124', 'S125', 'S131']
    if (!validProductTypes.includes(productType)) {
      return NextResponse.json(
        { success: false, error: `无效的产品类型，支持的类型: ${validProductTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // 验证服务类型
    const validServiceTypes = ['WMS', 'WFS', 'WCS']
    if (!validServiceTypes.includes(serviceType)) {
      return NextResponse.json(
        { success: false, error: `无效的服务类型，支持的类型: ${validServiceTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // 创建远程服务记录
    const remoteService = await db.remoteService.create({
      data: {
        name,
        endpoint,
        productType,
        serviceType,
        description: description || '',
        validationConfig: validationConfig || {},
        status: 'PENDING_VALIDATION'
      }
    })

    // 异步验证服务可用性
    validateRemoteService(remoteService.id).catch(error => {
      console.error('远程服务验证失败:', error)
    })

    return NextResponse.json({
      success: true,
      message: '远程服务注册成功，正在验证服务可用性',
      data: {
        serviceId: remoteService.id,
        name: remoteService.name,
        endpoint: remoteService.endpoint,
        status: remoteService.status,
        createdAt: remoteService.createdAt
      }
    })

  } catch (error) {
    console.error('注册远程服务失败:', error)
    return NextResponse.json(
      { success: false, error: '注册远程服务失败' },
      { status: 500 }
    )
  }
}

// 获取远程服务列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productType = searchParams.get('productType')
    const serviceType = searchParams.get('serviceType')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const whereClause: any = {}
    if (productType) whereClause.productType = productType
    if (serviceType) whereClause.serviceType = serviceType
    if (status) whereClause.status = status

    const [services, total] = await Promise.all([
      db.remoteService.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.remoteService.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: {
        services,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('获取远程服务列表失败:', error)
    return NextResponse.json(
      { success: false, error: '获取远程服务列表失败' },
      { status: 500 }
    )
  }
}

// 异步验证远程服务
async function validateRemoteService(serviceId: string) {
  try {
    const service = await db.remoteService.findUnique({
      where: { id: serviceId }
    })

    if (!service) return

    // 更新状态为验证中
    await db.remoteService.update({
      where: { id: serviceId },
      data: { status: 'VALIDATING' }
    })

    const validationConfig = service.validationConfig as any
    const timeout = validationConfig?.timeout || 30000
    const retryCount = validationConfig?.retryCount || 3

    let isValid = false
    let lastError = null

    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(service.endpoint, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'S100-WebGIS/1.0'
          }
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          isValid = true
          break
        } else {
          lastError = `HTTP ${response.status}: ${response.statusText}`
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : '连接失败'
      }

      // 如果不是最后一次尝试，等待一段时间再重试
      if (attempt < retryCount) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    // 更新服务状态
    await db.remoteService.update({
      where: { id: serviceId },
      data: {
        status: isValid ? 'ACTIVE' : 'INACTIVE',
        lastValidation: new Date(),
        lastValidationResult: {
          isValid,
          error: lastError,
          validatedAt: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('验证远程服务失败:', error)
    await db.remoteService.update({
      where: { id: serviceId },
      data: {
        status: 'ERROR',
        lastValidation: new Date(),
        lastValidationResult: {
          isValid: false,
          error: error instanceof Error ? error.message : '验证失败',
          validatedAt: new Date().toISOString()
        }
      }
    })
  }
}