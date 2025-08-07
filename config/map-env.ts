/**
 * 地图环境配置
 * 用于存储各种地图服务的API密钥和token
 */

export interface MapEnvironmentConfig {
  // 天地图配置
  tianditu: {
    enabled: boolean
    token: string
  }
  
  // 高德地图配置
  gaode: {
    enabled: boolean
    key: string
  }
  
  // 腾讯地图配置
  tencent: {
    enabled: boolean
    key: string
  }
  
  // 百度地图配置
  baidu: {
    enabled: boolean
    key: string
  }
  
  // 其他自定义配置
  custom: {
    [key: string]: {
      enabled: boolean
      token?: string
      key?: string
      config?: Record<string, any>
    }
  }
}

// 默认环境配置
export const defaultMapEnvConfig: MapEnvironmentConfig = {
  tianditu: {
    enabled: false,
    token: process.env.NEXT_PUBLIC_TIANDITU_TOKEN || ''
  },
  gaode: {
    enabled: true,
    key: process.env.NEXT_PUBLIC_GAODE_MAP_KEY || ''
  },
  tencent: {
    enabled: true,
    key: process.env.NEXT_PUBLIC_TENCENT_MAP_KEY || ''
  },
  baidu: {
    enabled: true,
    key: process.env.NEXT_PUBLIC_BAIDU_MAP_KEY || ''
  },
  custom: {}
}

// 从环境变量获取配置
export function getMapEnvConfig(): MapEnvironmentConfig {
  return {
    tianditu: {
      enabled: process.env.NEXT_PUBLIC_TIANDITU_ENABLED === 'true',
      token: process.env.NEXT_PUBLIC_TIANDITU_TOKEN || ''
    },
    gaode: {
      enabled: process.env.NEXT_PUBLIC_GAODE_MAP_ENABLED !== 'false',
      key: process.env.NEXT_PUBLIC_GAODE_MAP_KEY || ''
    },
    tencent: {
      enabled: process.env.NEXT_PUBLIC_TENCENT_MAP_ENABLED !== 'false',
      key: process.env.NEXT_PUBLIC_TENCENT_MAP_KEY || ''
    },
    baidu: {
      enabled: process.env.NEXT_PUBLIC_BAIDU_MAP_ENABLED !== 'false',
      key: process.env.NEXT_PUBLIC_BAIDU_MAP_KEY || ''
    },
    custom: {}
  }
}

// 验证环境配置
export function validateMapEnvConfig(config: MapEnvironmentConfig): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []

  if (config.tianditu.enabled && !config.tianditu.token) {
    warnings.push('天地图已启用但未提供token')
  }

  if (config.gaode.enabled && !config.gaode.key) {
    warnings.push('高德地图已启用但未提供key')
  }

  if (config.tencent.enabled && !config.tencent.key) {
    warnings.push('腾讯地图已启用但未提供key')
  }

  if (config.baidu.enabled && !config.baidu.key) {
    warnings.push('百度地图已启用但未提供key')
  }

  return {
    valid: warnings.length === 0,
    warnings
  }
}

// 生成环境变量示例
export function generateEnvExample(): string {
  return `# 地图服务配置

# 天地图配置
# 申请地址: https://console.tianditu.gov.cn/api/key
NEXT_PUBLIC_TIANDITU_ENABLED=false
NEXT_PUBLIC_TIANDITU_TOKEN=your_tianditu_token_here

# 高德地图配置
# 申请地址: https://lbs.amap.com/api/javascript-api/guide/create-project/key
NEXT_PUBLIC_GAODE_MAP_ENABLED=true
NEXT_PUBLIC_GAODE_MAP_KEY=your_gaode_map_key_here

# 腾讯地图配置
# 申请地址: https://lbs.qq.com/webApi/javascriptGL/glGuide/glBasic
NEXT_PUBLIC_TENCENT_MAP_ENABLED=true
NEXT_PUBLIC_TENCENT_MAP_KEY=your_tencent_map_key_here

# 百度地图配置
# 申请地址: https://lbsyun.baidu.com/apiconsole/key
NEXT_PUBLIC_BAIDU_MAP_ENABLED=true
NEXT_PUBLIC_BAIDU_MAP_KEY=your_baidu_map_key_here`
}

// 导出类型已在文件开头定义，这里不需要重复导出