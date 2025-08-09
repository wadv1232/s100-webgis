/**
 * 应用配置文件
 * 包含所有应用级别的配置项
 */

export interface AppConfig {
  // 应用基础信息
  app: {
    name: string
    version: string
    description: string
    author: string
    homepage: string
  }
  
  // API配置
  api: {
    baseUrl: string
    version: string
    timeout: number
    retries: number
  }
  
  // 数据库配置
  database: {
    host: string
    port: number
    name: string
    user: string
    password: string
    ssl: boolean
    pool: {
      min: number
      max: number
      idle: number
      acquire: number
    }
  }
  
  // 服务器配置
  server: {
    port: number
    host: string
    cors: {
      origin: string[]
      credentials: boolean
    }
    rateLimit: {
      windowMs: number
      max: number
    }
  }
  
  // 认证配置
  auth: {
    jwt: {
      secret: string
      expiresIn: string
      issuer: string
      audience: string
    }
    apiKey: {
      prefix: string
      length: number
    }
  }
  
  // 文件上传配置
  upload: {
    maxFileSize: number
    allowedTypes: string[]
    destination: string
  }
  
  // 缓存配置
  cache: {
    ttl: number
    maxSize: number
  }
  
  // 日志配置
  logging: {
    level: string
    format: string
    destination: string
  }
  
  // 分页配置
  pagination: {
    defaultLimit: number
    maxLimit: number
  }
  
  // 地理配置
  geo: {
    defaultCenter: [number, number]
    defaultZoom: number
    minZoom: number
    maxZoom: number
    coordinateSystem: string
  }
  
  // 服务配置
  services: {
    validProducts: string[]
    defaultServiceTypes: string[]
    healthCheckInterval: number
    retryAttempts: number
  }
  
  // 节点配置
  nodes: {
    defaultLevel: number
    defaultType: string
    defaultStatus: string
    apiUrlTemplate: string
  }
}

// 默认应用配置
export const defaultAppConfig: AppConfig = {
  app: {
    name: 'S-100 Maritime Services',
    version: '1.0.0',
    description: 'Maritime data services platform',
    author: 'Maritime Services Team',
    homepage: 'https://github.com/wadv1232/s100-webgis'
  },
  
  api: {
    baseUrl: 'http://localhost:3001',
    version: 'v1',
    timeout: 30000,
    retries: 3
  },
  
  database: {
    host: 'localhost',
    port: 5432,
    name: 's100_services',
    user: 'postgres',
    password: 'postgres',
    ssl: false,
    pool: {
      min: 2,
      max: 10,
      idle: 30000,
      acquire: 60000
    }
  },
  
  server: {
    port: 3001,
    host: '0.0.0.0',
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100 // 限制每个IP 15分钟内最多100个请求
    }
  },
  
  auth: {
    jwt: {
      secret: 'your-secret-key-change-in-production',
      expiresIn: '24h',
      issuer: 's100-services',
      audience: 's100-clients'
    },
    apiKey: {
      prefix: 'sk-',
      length: 32
    }
  },
  
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['.json', '.xml', '.zip', '.gz'],
    destination: './uploads'
  },
  
  cache: {
    ttl: 3600, // 1小时
    maxSize: 1000
  },
  
  logging: {
    level: 'info',
    format: 'combined',
    destination: './logs'
  },
  
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },
  
  geo: {
    defaultCenter: [35.8617, 104.1954], // 中国中心坐标
    defaultZoom: 4,
    minZoom: 2,
    maxZoom: 18,
    coordinateSystem: 'WGS84'
  },
  
  services: {
    validProducts: ['S101', 'S102', 'S104', 'S111', 'S124', 'S131'],
    defaultServiceTypes: ['WMS', 'WFS', 'SOS'],
    healthCheckInterval: 30000, // 30秒
    retryAttempts: 3
  },
  
  nodes: {
    defaultLevel: 3,
    defaultType: 'LEAF',
    defaultStatus: 'OFFLINE',
    apiUrlTemplate: 'https://api.example.com/{nodeId}'
  }
}

// 开发环境配置
export const developmentConfig: Partial<AppConfig> = {
  database: {
    host: 'localhost',
    name: 's100_services_dev',
    user: 'postgres',
    password: 'postgres',
    ssl: false
  },
  logging: {
    level: 'debug'
  },
  api: {
    baseUrl: 'http://localhost:3001'
  }
}

// 生产环境配置
export const productionConfig: Partial<AppConfig> = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    name: process.env.DB_NAME || 's100_services',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: true
  },
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET || 'production-secret-key'
    }
  },
  logging: {
    level: 'warn'
  },
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://api.s100-services.com'
  }
}

// 测试环境配置
export const testConfig: Partial<AppConfig> = {
  database: {
    host: 'localhost',
    name: 's100_services_test',
    user: 'postgres',
    password: 'postgres',
    ssl: false
  },
  logging: {
    level: 'error'
  },
  api: {
    baseUrl: 'http://localhost:3001'
  }
}

// 获取当前环境配置
export function getAppConfig(): AppConfig {
  const env = process.env.NODE_ENV || 'development'
  
  let config = { ...defaultAppConfig }
  
  switch (env) {
    case 'production':
      config = { ...config, ...productionConfig }
      break
    case 'test':
      config = { ...config, ...testConfig }
      break
    case 'development':
    default:
      config = { ...config, ...developmentConfig }
      break
  }
  
  // 环境变量覆盖
  if (process.env.PORT) {
    config.server.port = parseInt(process.env.PORT)
  }
  
  if (process.env.DB_HOST) {
    config.database.host = process.env.DB_HOST
  }
  
  if (process.env.DB_PORT) {
    config.database.port = parseInt(process.env.DB_PORT)
  }
  
  if (process.env.DB_NAME) {
    config.database.name = process.env.DB_NAME
  }
  
  if (process.env.DB_USER) {
    config.database.user = process.env.DB_USER
  }
  
  if (process.env.DB_PASSWORD) {
    config.database.password = process.env.DB_PASSWORD
  }
  
  if (process.env.JWT_SECRET) {
    config.auth.jwt.secret = process.env.JWT_SECRET
  }
  
  if (process.env.API_BASE_URL) {
    config.api.baseUrl = process.env.API_BASE_URL
  }
  
  return config
}

// 获取特定配置项
export function getConfigValue<T extends keyof AppConfig>(key: T): AppConfig[T] {
  const config = getAppConfig()
  return config[key]
}

// 验证配置
export function validateConfig(config: AppConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 验证必需的配置项
  if (!config.app.name) errors.push('App name is required')
  if (!config.api.baseUrl) errors.push('API base URL is required')
  if (!config.database.host) errors.push('Database host is required')
  if (!config.database.name) errors.push('Database name is required')
  if (!config.auth.jwt.secret) errors.push('JWT secret is required')
  
  // 验证数值范围
  if (config.server.port < 1 || config.server.port > 65535) {
    errors.push('Server port must be between 1 and 65535')
  }
  
  if (config.database.port < 1 || config.database.port > 65535) {
    errors.push('Database port must be between 1 and 65535')
  }
  
  if (config.pagination.defaultLimit < 1 || config.pagination.defaultLimit > config.pagination.maxLimit) {
    errors.push('Default limit must be between 1 and max limit')
  }
  
  // 验证URL格式
  try {
    new URL(config.api.baseUrl)
  } catch {
    errors.push('API base URL must be a valid URL')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// 导出默认配置
export default getAppConfig