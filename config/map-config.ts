/**
 * 地图配置文件
 * 支持多种底图配置，包括OpenStreetMap、天地图、高德地图等
 */

import { getAppConfig } from './app'

export interface MapTileLayer {
  id: string
  name: string
  type: 'vector' | 'satellite' | 'terrain' | 'traffic' | 'custom'
  url: string
  attribution: string
  maxZoom?: number
  minZoom?: number
  tileSize?: number
  token?: string
  subdomains?: string[]
  options?: {
    // 其他leaflet tilelayer选项
    [key: string]: any
  }
}

export interface MapConfig {
  defaultLayer: string
  layers: MapTileLayer[]
  center: [number, number]
  zoom: number
  minZoom: number
  maxZoom: number
}

// 默认地图配置
export const defaultMapConfig: MapConfig = {
  defaultLayer: 'osm',
  center: [35.8617, 104.1954], // 中国中心坐标
  zoom: 4,
  minZoom: 2,
  maxZoom: 18,
  layers: [
    // OpenStreetMap 标准地图
    {
      id: 'osm',
      name: 'OpenStreetMap',
      type: 'vector',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    },
    
    // OpenStreetMap Hot (人道主义地图)
    {
      id: 'osm-hot',
      name: 'OSM Humanitarian',
      type: 'vector',
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/">Humanitarian OpenStreetMap Team</a>',
      maxZoom: 19
    },
    
    // OpenTopoMap 地形图
    {
      id: 'terrain',
      name: 'OpenTopoMap',
      type: 'terrain',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxZoom: 17
    },
    
    // Esri 卫星影像
    {
      id: 'satellite',
      name: 'Esri Satellite',
      type: 'satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
      maxZoom: 19
    },
    
    // Esri 街道地图
    {
      id: 'esri-streets',
      name: 'Esri Streets',
      type: 'vector',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
      maxZoom: 19
    },
    
    // Esri 地形图
    {
      id: 'esri-topo',
      name: 'Esri Topographic',
      type: 'terrain',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
      maxZoom: 19
    },
    
    // CartoDB 深色主题
    {
      id: 'carto-dark',
      name: 'CartoDB Dark',
      type: 'vector',
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: ['a', 'b', 'c', 'd'],
      maxZoom: 19
    },
    
    // CartoDB 浅色主题
    {
      id: 'carto-light',
      name: 'CartoDB Light',
      type: 'vector',
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: ['a', 'b', 'c', 'd'],
      maxZoom: 19
    },
    
    // Stamen 水彩风格
    {
      id: 'stamen-watercolor',
      name: 'Stamen Watercolor',
      type: 'custom',
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: ['a', 'b', 'c', 'd'],
      maxZoom: 18
    },
    
    // Stamen 地形风格
    {
      id: 'stamen-terrain',
      name: 'Stamen Terrain',
      type: 'terrain',
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.png',
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: ['a', 'b', 'c', 'd'],
      maxZoom: 18
    }
  ]
}

// 天地图配置 (需要申请token)
export const tiandituLayers: MapTileLayer[] = [
  {
    id: 'tianditu-vector',
    name: '天地图矢量',
    type: 'vector',
    url: 'https://t{s}.tianditu.gov.cn/vec_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=vec&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={token}',
    attribution: '&copy; <a href="https://www.tianditu.gov.cn/">天地图</a>',
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    maxZoom: 18,
    token: '{YOUR_TIANDITU_TOKEN}' // 需要替换为实际的token
  },
  {
    id: 'tianditu-satellite',
    name: '天地图影像',
    type: 'satellite',
    url: 'https://t{s}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={token}',
    attribution: '&copy; <a href="https://www.tianditu.gov.cn/">天地图</a>',
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    maxZoom: 18,
    token: '{YOUR_TIANDITU_TOKEN}'
  },
  {
    id: 'tianditu-terrain',
    name: '天地图地形',
    type: 'terrain',
    url: 'https://t{s}.tianditu.gov.cn/ter_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=ter&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk={token}',
    attribution: '&copy; <a href="https://www.tianditu.gov.cn/">天地图</a>',
    subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
    maxZoom: 18,
    token: '{YOUR_TIANDITU_TOKEN}'
  }
]

// 高德地图配置 (需要申请key)
export const gaodeLayers: MapTileLayer[] = [
  {
    id: 'gaode-vector',
    name: '高德地图',
    type: 'vector',
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 20
  },
  {
    id: 'gaode-satellite',
    name: '高德卫星图',
    type: 'satellite',
    url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 20
  },
  {
    id: 'gaode-satellite-label',
    name: '高德卫星图标注',
    type: 'satellite',
    url: 'https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 20
  },
  {
    id: 'gaode-traffic',
    name: '高德实时路况',
    type: 'traffic',
    url: 'https://tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&t=1&x={x}&y={y}&z={z}',
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    maxZoom: 20
  }
]

// 腾讯地图配置
export const tencentLayers: MapTileLayer[] = [
  {
    id: 'tencent-vector',
    name: '腾讯地图',
    type: 'vector',
    url: 'https://rt{s}.map.gtimg.com/realtimerender?z={z}&x={x}&y={y}&type=vector&style=0',
    attribution: '&copy; <a href="https://map.qq.com/">腾讯地图</a>',
    subdomains: ['0', '1', '2'],
    maxZoom: 20
  },
  {
    id: 'tencent-satellite',
    name: '腾讯卫星图',
    type: 'satellite',
    url: 'https://p{s}.map.gtimg.com/sateTiles/{z}/{x}/{y}.jpg',
    attribution: '&copy; <a href="https://map.qq.com/">腾讯地图</a>',
    subdomains: ['0', '1', '2'],
    maxZoom: 20
  }
]

// 百度地图配置 (需要申请key)
export const baiduLayers: MapTileLayer[] = [
  {
    id: 'baidu-vector',
    name: '百度地图',
    type: 'vector',
    url: 'https://api{s}.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid=normal',
    attribution: '&copy; <a href="https://map.baidu.com/">百度地图</a>',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 19
  },
  {
    id: 'baidu-satellite',
    name: '百度卫星图',
    type: 'satellite',
    url: 'https://api{s}.map.baidu.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid=satellite',
    attribution: '&copy; <a href="https://map.baidu.com/">百度地图</a>',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 19
  }
]

// 获取完整地图配置（包含所有图层）
export function getCompleteMapConfig(
  options: {
    includeTianditu?: boolean
    includeGaode?: boolean
    includeTencent?: boolean
    includeBaidu?: boolean
    tiandituToken?: string
    gaodeKey?: string
    tencentKey?: string
    baiduKey?: string
  } = {}
): MapConfig {
  const {
    includeTianditu = false,
    includeGaode = true,
    includeTencent = true,
    includeBaidu = true,
    tiandituToken = '',
    gaodeKey = '',
    tencentKey = '',
    baiduKey = ''
  } = options

  const layers: MapTileLayer[] = [...defaultMapConfig.layers]

  // 添加天地图图层
  if (includeTianditu && tiandituToken) {
    layers.push(...tiandituLayers.map(layer => ({
      ...layer,
      url: layer.url.replace('{token}', tiandituToken)
    })))
  }

  // 添加高德地图图层
  if (includeGaode) {
    layers.push(...gaodeLayers)
  }

  // 添加腾讯地图图层
  if (includeTencent) {
    layers.push(...tencentLayers)
  }

  // 添加百度地图图层
  if (includeBaidu) {
    layers.push(...baiduLayers)
  }

  return {
    ...defaultMapConfig,
    layers
  }
}

// 根据应用配置获取地图配置
export function getAppMapConfig(): MapConfig {
  const appConfig = getAppConfig()
  
  // 使用应用配置中的地理设置
  const mapConfig: MapConfig = {
    ...defaultMapConfig,
    center: appConfig.geo.defaultCenter,
    zoom: appConfig.geo.defaultZoom,
    minZoom: appConfig.geo.minZoom,
    maxZoom: appConfig.geo.maxZoom
  }
  
  return mapConfig
}

// 根据类型获取图层
export function getLayersByType(config: MapConfig, type: MapTileLayer['type']): MapTileLayer[] {
  return config.layers.filter(layer => layer.type === type)
}

// 根据ID获取图层
export function getLayerById(config: MapConfig, id: string): MapTileLayer | undefined {
  return config.layers.find(layer => layer.id === id)
}

// 处理URL中的token替换
export function processLayerUrl(layer: MapTileLayer, tokens: Record<string, string> = {}): string {
  let url = layer.url
  
  // 替换token
  if (layer.token && tokens[layer.id]) {
    url = url.replace('{token}', tokens[layer.id])
  }
  
  // 替换其他占位符
  Object.entries(tokens).forEach(([key, value]) => {
    url = url.replace(`{${key}}`, value)
  })
  
  return url
}

// 验证图层配置
export function validateLayerConfig(layer: MapTileLayer): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!layer.id) errors.push('图层ID不能为空')
  if (!layer.name) errors.push('图层名称不能为空')
  if (!layer.url) errors.push('图层URL不能为空')
  if (!layer.attribution) errors.push('图层归属信息不能为空')

  // 检查URL中是否包含token占位符但没有提供token
  if (layer.url.includes('{token}') && !layer.token) {
    errors.push('图层URL包含token占位符但未提供token')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// 获取默认地图配置
export function getDefaultMapConfig(): MapConfig {
  return defaultMapConfig
}

// 导出默认配置
export default getAppMapConfig