'use client'

import { useState, useEffect } from 'react'
import { 
  MapConfig, 
  MapTileLayer, 
  getCompleteMapConfig, 
  getLayerById, 
  getLayersByType,
  processLayerUrl,
  validateLayerConfig 
} from '../../config/map-config'
import { 
  MapEnvironmentConfig, 
  getMapEnvConfig, 
  validateMapEnvConfig 
} from '../../config/map-env'

export interface UseMapConfigReturn {
  // 配置状态
  mapConfig: MapConfig
  envConfig: MapEnvironmentConfig
  isLoading: boolean
  error: string | null
  
  // 当前选中的图层
  currentLayer: MapTileLayer | null
  setCurrentLayer: (layerId: string) => void
  
  // 图层操作
  getLayerUrl: (layerId: string) => string
  getLayersByType: (type: MapTileLayer['type']) => MapTileLayer[]
  validateCurrentLayer: () => { valid: boolean; errors: string[] }
  
  // 配置验证
  configWarnings: string[]
  isValidConfig: boolean
  
  // 重新加载配置
  reloadConfig: () => void
}

export function useMapConfig(): UseMapConfigReturn {
  const [mapConfig, setMapConfig] = useState<MapConfig | null>(null)
  const [envConfig, setEnvConfig] = useState<MapEnvironmentConfig | null>(null)
  const [currentLayerId, setCurrentLayerId] = useState<string>('osm')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [configWarnings, setConfigWarnings] = useState<string[]>([])

  // 加载配置
  const loadConfig = () => {
    try {
      setIsLoading(true)
      setError(null)

      // 获取环境配置
      const env = getMapEnvConfig()
      setEnvConfig(env)

      // 生成完整地图配置
      const config = getCompleteMapConfig({
        includeTianditu: env.tianditu.enabled,
        includeGaode: env.gaode.enabled,
        includeTencent: env.tencent.enabled,
        includeBaidu: env.baidu.enabled,
        tiandituToken: env.tianditu.token,
        gaodeKey: env.gaode.key,
        tencentKey: env.tencent.key,
        baiduKey: env.baidu.key
      })

      setMapConfig(config)

      // 验证配置
      const validation = validateMapEnvConfig(env)
      setConfigWarnings(validation.warnings)

      // 验证默认图层
      if (config.defaultLayer) {
        const defaultLayer = getLayerById(config, config.defaultLayer)
        if (defaultLayer) {
          const layerValidation = validateLayerConfig(defaultLayer)
          if (!layerValidation.valid) {
            setConfigWarnings(prev => [...prev, ...layerValidation.errors])
          }
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : '加载地图配置失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 初始化加载配置
  useEffect(() => {
    loadConfig()
  }, [])

  // 获取当前图层
  const currentLayer = mapConfig && currentLayerId 
    ? getLayerById(mapConfig, currentLayerId) 
    : null

  // 设置当前图层
  const setCurrentLayer = (layerId: string) => {
    if (mapConfig && getLayerById(mapConfig, layerId)) {
      setCurrentLayerId(layerId)
    }
  }

  // 获取图层URL（处理token替换）
  const getLayerUrl = (layerId: string): string => {
    if (!mapConfig || !envConfig) return ''

    const layer = getLayerById(mapConfig, layerId)
    if (!layer) return ''

    // 构建token映射
    const tokens: Record<string, string> = {}
    
    if (envConfig.tianditu.token && layerId.startsWith('tianditu-')) {
      tokens[layerId] = envConfig.tianditu.token
    }
    
    if (envConfig.gaode.key && layerId.startsWith('gaode-')) {
      tokens[layerId] = envConfig.gaode.key
    }
    
    if (envConfig.tencent.key && layerId.startsWith('tencent-')) {
      tokens[layerId] = envConfig.tencent.key
    }
    
    if (envConfig.baidu.key && layerId.startsWith('baidu-')) {
      tokens[layerId] = envConfig.baidu.key
    }

    return processLayerUrl(layer, tokens)
  }

  // 按类型获取图层
  const getLayersByTypeHandler = (type: MapTileLayer['type']): MapTileLayer[] => {
    return mapConfig ? getLayersByType(mapConfig, type) : []
  }

  // 验证当前图层
  const validateCurrentLayer = () => {
    if (!currentLayer) {
      return { valid: false, errors: ['未选择图层'] }
    }
    return validateLayerConfig(currentLayer)
  }

  // 重新加载配置
  const reloadConfig = () => {
    loadConfig()
  }

  return {
    // 配置状态
    mapConfig: mapConfig || {
      defaultLayer: 'osm',
      center: [35.8617, 104.1954],
      zoom: 4,
      minZoom: 2,
      maxZoom: 18,
      layers: []
    },
    envConfig: envConfig || {
      tianditu: { enabled: false, token: '' },
      gaode: { enabled: true, key: '' },
      tencent: { enabled: true, key: '' },
      baidu: { enabled: true, key: '' },
      custom: {}
    },
    isLoading,
    error,
    
    // 当前选中的图层
    currentLayer,
    setCurrentLayer,
    
    // 图层操作
    getLayerUrl,
    getLayersByType: getLayersByTypeHandler,
    validateCurrentLayer,
    
    // 配置验证
    configWarnings,
    isValidConfig: configWarnings.length === 0,
    
    // 重新加载配置
    reloadConfig
  }
}