import { NextRequest, NextResponse } from 'next/server'
import { CacheManager } from '@/lib/cache-manager'
import { ApiErrorHandler, withApiHandler } from '@/lib/api-error'

// 获取缓存管理器实例
const cacheManager = CacheManager.getInstance()

// 初始化缓存管理器（如果尚未初始化）
let initialized = false
async function ensureInitialized() {
  if (!initialized) {
    await cacheManager.initialize()
    initialized = true
  }
}

const getStatusHandler = withApiHandler(async (request: NextRequest): Promise<NextResponse> => {
  await ensureInitialized()
  const status = await cacheManager.getCacheStatus()
  return NextResponse.json(status)
})

const invalidateHandler = withApiHandler(async (request: NextRequest): Promise<NextResponse> => {
  await ensureInitialized()
  
  const { searchParams } = new URL(request.url)
  const nodeId = searchParams.get('nodeId')
  const productType = searchParams.get('productType')

  await cacheManager.manualInvalidation(
    nodeId || undefined,
    productType || undefined
  )

  return NextResponse.json({
    success: true,
    message: '缓存失效已触发',
    nodeId,
    productType
  })
})

const updateRuleHandler = withApiHandler(async (request: NextRequest): Promise<NextResponse> => {
  await ensureInitialized()
  
  const body = await request.json()
  const { ruleId, updates } = body

  if (!ruleId || !updates) {
    return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
      required: ['ruleId', 'updates'],
      provided: Object.keys(body)
    })
  }

  await cacheManager.updateInvalidationRule(ruleId, updates)

  return NextResponse.json({
    success: true,
    message: '失效规则更新成功',
    ruleId
  })
})

const updateStrategyHandler = withApiHandler(async (request: NextRequest): Promise<NextResponse> => {
  await ensureInitialized()
  
  const body = await request.json()
  const { strategyId, updates } = body

  if (!strategyId || !updates) {
    return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
      required: ['strategyId', 'updates'],
      provided: Object.keys(body)
    })
  }

  await cacheManager.updateUpdateStrategy(strategyId, updates)

  return NextResponse.json({
    success: true,
    message: '更新策略更新成功',
    strategyId
  })
})

export { getStatusHandler as GET, invalidateHandler as POST, updateRuleHandler as PUT, updateStrategyHandler as PATCH }