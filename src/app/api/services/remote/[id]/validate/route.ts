import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 验证远程服务可用性
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { forceValidation = false } = body

    // 检查远程服务是否存在
    const service = await db.remoteService.findUnique({
      where: { id }
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: '远程服务不存在' },
        { status: 404 }
      )
    }

    // 如果不是强制验证，检查是否在验证冷却期内
    if (!forceValidation && service.lastValidation) {
      const timeSinceLastValidation = Date.now() - new Date(service.lastValidation).getTime()
      const cooldownPeriod = 5 * 60 * 1000 // 5分钟冷却期

      if (timeSinceLastValidation < cooldownPeriod) {
        return NextResponse.json({
          success: true,
          message: '服务验证在冷却期内，返回上次验证结果',
          data: {
            serviceId: id,
            status: service.status,
            lastValidation: service.lastValidation,
            validationResult: service.lastValidationResult
          }
        })
      }
    }

    // 更新状态为验证中
    await db.remoteService.update({
      where: { id },
      data: { status: 'VALIDATING' }
    })

    // 执行验证
    const validationResult = await performServiceValidation(service)

    // 更新验证结果
    const updatedService = await db.remoteService.update({
      where: { id },
      data: {
        status: validationResult.isValid ? 'ACTIVE' : 'INACTIVE',
        lastValidation: new Date(),
        lastValidationResult: validationResult
      }
    })

    return NextResponse.json({
      success: true,
      message: validationResult.isValid ? '服务验证成功' : '服务验证失败',
      data: {
        serviceId: id,
        status: updatedService.status,
        lastValidation: updatedService.lastValidation,
        validationResult
      }
    })

  } catch (error) {
    console.error('验证远程服务失败:', error)
    return NextResponse.json(
      { success: false, error: '验证远程服务失败' },
      { status: 500 }
    )
  }
}

// 获取远程服务验证状态
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const service = await db.remoteService.findUnique({
      where: { id }
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: '远程服务不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        serviceId: id,
        name: service.name,
        endpoint: service.endpoint,
        status: service.status,
        lastValidation: service.lastValidation,
        validationResult: service.lastValidationResult,
        validationConfig: service.validationConfig
      }
    })

  } catch (error) {
    console.error('获取远程服务验证状态失败:', error)
    return NextResponse.json(
      { success: false, error: '获取远程服务验证状态失败' },
      { status: 500 }
    )
  }
}

// 执行服务验证
async function performServiceValidation(service: any) {
  const validationConfig = service.validationConfig as any
  const timeout = validationConfig?.timeout || 30000
  const retryCount = validationConfig?.retryCount || 3

  let isValid = false
  let lastError = null
  let responseTime = 0
  let availability = 0

  for (let attempt = 1; attempt <= retryCount; attempt++) {
    try {
      const startTime = Date.now()
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
      responseTime = Date.now() - startTime

      if (response.ok) {
        isValid = true
        availability = Math.round((1 / attempt) * 100)
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

  return {
    isValid,
    error: lastError,
    responseTime,
    availability,
    validatedAt: new Date().toISOString(),
    attemptCount: retryCount
  }
}