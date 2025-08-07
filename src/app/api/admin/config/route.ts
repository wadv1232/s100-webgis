import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler, withApiHandler } from '@/lib/api-error'

interface SystemConfig {
  key: string
  value: any
  description?: string
  category?: string
  isSystem?: boolean
}

const defaultConfigs: SystemConfig[] = [
  {
    key: 'service_directory.enabled',
    value: true,
    description: '是否启用服务目录缓存模式',
    category: 'service_directory',
    isSystem: true
  },
  {
    key: 'service_directory.cache_ttl',
    value: 24, // 小时
    description: '服务目录缓存过期时间（小时）',
    category: 'service_directory',
    isSystem: true
  },
  {
    key: 'service_directory.min_confidence',
    value: 0.5,
    description: '服务目录最小置信度阈值',
    category: 'service_directory',
    isSystem: true
  },
  {
    key: 'service_directory.sync_interval',
    value: 6, // 小时
    description: '服务目录自动同步间隔（小时）',
    category: 'service_directory',
    isSystem: true
  },
  {
    key: 'service_directory.max_results',
    value: 100,
    description: '服务目录查询最大结果数',
    category: 'service_directory',
    isSystem: true
  },
  {
    key: 'api.performance_monitoring',
    value: true,
    description: '是否启用API性能监控',
    category: 'api',
    isSystem: false
  },
  {
    key: 'api.enable_realtime_fallback',
    value: true,
    description: '是否在缓存失败时启用实时查询回退',
    category: 'api',
    isSystem: true
  }
]

// 获取配置
async function getConfig(key?: string) {
  if (key) {
    const config = await db.systemConfig.findUnique({
      where: { key }
    })
    
    if (!config) {
      // 返回默认配置
      const defaultConfig = defaultConfigs.find(c => c.key === key)
      return defaultConfig ? { ...defaultConfig, value: defaultConfig.value } : null
    }
    
    return {
      ...config,
      value: JSON.parse(config.value)
    }
  }

  // 获取所有配置
  const configs = await db.systemConfig.findMany()
  const configMap = new Map(configs.map(c => [c.key, c]))

  // 合并默认配置和数据库配置
  return defaultConfigs.map(defaultConfig => {
    const dbConfig = configMap.get(defaultConfig.key)
    return {
      key: defaultConfig.key,
      value: dbConfig ? JSON.parse(dbConfig.value) : defaultConfig.value,
      description: defaultConfig.description,
      category: defaultConfig.category,
      isSystem: defaultConfig.isSystem,
      updatedAt: dbConfig?.updatedAt
    }
  })
}

// 设置配置
async function setConfig(key: string, value: any, updatedBy?: string) {
  // 检查是否是系统配置
  const defaultConfig = defaultConfigs.find(c => c.key === key)
  if (!defaultConfig) {
    throw new Error(`未知的配置项: ${key}`)
  }

  if (defaultConfig.isSystem) {
    // 系统配置需要额外验证
    if (key === 'service_directory.cache_ttl' && (typeof value !== 'number' || value < 1 || value > 168)) {
      throw new Error('缓存过期时间必须在1-168小时之间')
    }
    if (key === 'service_directory.min_confidence' && (typeof value !== 'number' || value < 0 || value > 1)) {
      throw new Error('置信度阈值必须在0-1之间')
    }
    if (key === 'service_directory.sync_interval' && (typeof value !== 'number' || value < 1 || value > 24)) {
      throw new Error('同步间隔必须在1-24小时之间')
    }
  }

  // 更新或创建配置
  const config = await db.systemConfig.upsert({
    where: { key },
    update: {
      value: JSON.stringify(value),
      updatedAt: new Date(),
      updatedBy
    },
    create: {
      key,
      value: JSON.stringify(value),
      description: defaultConfig.description,
      category: defaultConfig.category || 'general',
      isSystem: defaultConfig.isSystem,
      updatedAt: new Date(),
      updatedBy
    }
  })

  return {
    ...config,
    value: JSON.parse(config.value)
  }
}

// 重置配置到默认值
async function resetConfig(key: string, updatedBy?: string) {
  const defaultConfig = defaultConfigs.find(c => c.key === key)
  if (!defaultConfig) {
    throw new Error(`未知的配置项: ${key}`)
  }

  await db.systemConfig.delete({
    where: { key }
  })

  return {
    ...defaultConfig,
    updatedAt: new Date(),
    updatedBy
  }
}

const getConfigHandler = withApiHandler(async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  const category = searchParams.get('category')

  if (key) {
    const config = await getConfig(key)
    if (!config) {
      return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
        parameter: 'key',
        message: 'Configuration key not found'
      })
    }
    return NextResponse.json(config)
  }

  let configs = await getConfig()
  
  if (category) {
    configs = configs.filter(c => c.category === category)
  }

  return NextResponse.json(configs)
})

const setConfigHandler = withApiHandler(async (request: NextRequest): Promise<NextResponse> => {
  const body = await request.json()
  const { key, value, updatedBy } = body

  if (!key || value === undefined) {
    return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
      required: ['key', 'value'],
      provided: Object.keys(body)
    })
  }

  try {
    const config = await setConfig(key, value, updatedBy)
    return NextResponse.json({
      success: true,
      message: '配置更新成功',
      config
    })
  } catch (error) {
    return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
      parameter: 'value',
      message: error instanceof Error ? error.message : 'Invalid configuration value'
    })
  }
})

const resetConfigHandler = withApiHandler(async (request: NextRequest): Promise<NextResponse> => {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  const { updatedBy } = await request.json()

  if (!key) {
    return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
      required: ['key'],
      provided: Object.fromEntries(searchParams.entries())
    })
  }

  try {
    const config = await resetConfig(key, updatedBy)
    return NextResponse.json({
      success: true,
      message: '配置已重置为默认值',
      config
    })
  } catch (error) {
    return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
      parameter: 'key',
      message: error instanceof Error ? error.message : 'Invalid configuration key'
    })
  }
})

export { getConfigHandler as GET, setConfigHandler as POST, resetConfigHandler as DELETE }