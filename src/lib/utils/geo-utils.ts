/**
 * 地理数据工具库
 * 用于处理GeoJSON数据和空间计算
 */

export interface GeoJSONPoint {
  type: 'Point'
  coordinates: [number, number] // [longitude, latitude]
}

export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: number[][][] // 多边形环，第一个环是外环，后续是内环（孔洞）
}

export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon'
  coordinates: number[][][][] // 多个多边形
}

export type GeoJSONGeometry = GeoJSONPoint | GeoJSONPolygon | GeoJSONMultiPolygon

export interface GeoJSONFeature {
  type: 'Feature'
  geometry: GeoJSONGeometry
  properties?: Record<string, any>
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface BoundingBox {
  minLng: number
  minLat: number
  maxLng: number
  maxLat: number
}

export interface CenterPoint {
  latitude: number
  longitude: number
}

/**
 * 解析GeoJSON字符串
 */
export function parseGeoJSON(geojsonString: string): GeoJSONGeometry | null {
  try {
    // 检查是否为中文描述文本（如"全球范围"、"中国沿海"等）
    if (typeof geojsonString === 'string' && 
        (geojsonString.includes('范围') || 
         geojsonString.includes('区域') || 
         geojsonString.includes('沿海') ||
         /^[\u4e00-\u9fa5\s]+$/.test(geojsonString.trim()))) {
      // 对于中文描述，返回null，让调用者处理
      return null
    }
    
    const geojson = JSON.parse(geojsonString)
    
    // 处理Feature类型
    let geometry = geojson
    if (geojson.type === 'Feature' && geojson.geometry) {
      geometry = geojson.geometry
    }
    
    // 验证GeoJSON格式
    if (!geometry.type || !geometry.coordinates) {
      throw new Error('Invalid GeoJSON format')
    }
    
    return geometry
  } catch (error) {
    console.error('Failed to parse GeoJSON:', error)
    return null
  }
}

/**
 * 将几何对象转换为GeoJSON字符串
 */
export function stringifyGeoJSON(geometry: GeoJSONGeometry): string {
  return JSON.stringify(geometry)
}

/**
 * 创建点几何对象
 */
export function createPoint(longitude: number, latitude: number): GeoJSONPoint {
  return {
    type: 'Point',
    coordinates: [longitude, latitude]
  }
}

/**
 * 创建多边形几何对象
 */
export function createPolygon(rings: number[][][]): GeoJSONPolygon {
  return {
    type: 'Polygon',
    coordinates: rings
  }
}

/**
 * 创建矩形多边形（用于框选）
 */
export function createBoundingBoxPolygon(bbox: BoundingBox): GeoJSONPolygon {
  const { minLng, minLat, maxLng, maxLat } = bbox
  
  // 创建矩形环（顺时针）
  const ring = [
    [minLng, minLat], // 左下
    [minLng, maxLat], // 左上
    [maxLng, maxLat], // 右上
    [maxLng, minLat], // 右下
    [minLng, minLat]  // 闭合
  ]
  
  return createPolygon([ring])
}

/**
 * 计算几何对象的中心点
 */
export function calculateCenter(geometry: GeoJSONGeometry): CenterPoint | null {
  try {
    switch (geometry.type) {
      case 'Point':
        return {
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0]
        }
        
      case 'Polygon':
        return calculatePolygonCenter(geometry.coordinates[0]) // 使用外环计算
        
      case 'MultiPolygon':
        // 计算所有多边形中心的平均值
        const centers = geometry.coordinates.map(polygon => 
          calculatePolygonCenter(polygon[0])
        ).filter(Boolean) as CenterPoint[]
        
        if (centers.length === 0) return null
        
        return {
          latitude: centers.reduce((sum, c) => sum + c.latitude, 0) / centers.length,
          longitude: centers.reduce((sum, c) => sum + c.longitude, 0) / centers.length
        }
        
      default:
        return null
    }
  } catch (error) {
    console.error('Failed to calculate center:', error)
    return null
  }
}

/**
 * 计算多边形中心点（简单的算术平均）
 */
function calculatePolygonCenter(ring: number[][]): CenterPoint {
  const sum = ring.reduce((acc, coord) => ({
    lng: acc.lng + coord[0],
    lat: acc.lat + coord[1]
  }), { lng: 0, lat: 0 })
  
  return {
    latitude: sum.lat / ring.length,
    longitude: sum.lng / ring.length
  }
}

/**
 * 计算几何对象的边界框
 */
export function calculateBoundingBox(geometry: GeoJSONGeometry): BoundingBox | null {
  try {
    let coordinates: number[][]
    
    switch (geometry.type) {
      case 'Point':
        coordinates = [geometry.coordinates]
        break
        
      case 'Polygon':
        coordinates = geometry.coordinates.flat()
        break
        
      case 'MultiPolygon':
        coordinates = geometry.coordinates.flat(2)
        break
        
      default:
        return null
    }
    
    if (coordinates.length === 0) return null
    
    const lngs = coordinates.map(c => c[0])
    const lats = coordinates.map(c => c[1])
    
    return {
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats)
    }
  } catch (error) {
    console.error('Failed to calculate bounding box:', error)
    return null
  }
}

/**
 * 检查点是否在多边形内（简单的射线法）
 */
export function isPointInPolygon(point: [number, number], polygon: number[][]): boolean {
  const [x, y] = point
  let inside = false
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}

/**
 * 检查两个几何对象是否相交
 */
export function geometriesIntersect(geom1: GeoJSONGeometry, geom2: GeoJSONGeometry): boolean {
  try {
    // 简化实现：检查边界框相交
    const bbox1 = calculateBoundingBox(geom1)
    const bbox2 = calculateBoundingBox(geom2)
    
    if (!bbox1 || !bbox2) return false
    
    return !(bbox1.maxLng < bbox2.minLng || 
             bbox2.maxLng < bbox1.minLng || 
             bbox1.maxLat < bbox2.minLat || 
             bbox2.maxLat < bbox1.minLat)
  } catch (error) {
    console.error('Failed to check intersection:', error)
    return false
  }
}

/**
 * 生成默认的节点覆盖范围（基于经纬度创建小范围圆形区域）
 */
export function generateDefaultCoverage(latitude: number, longitude: number, radiusKm: number = 1): GeoJSONPolygon {
  // 简化实现：创建一个小的正方形区域
  const delta = radiusKm / 111 // 1度约等于111km
  
  return createBoundingBoxPolygon({
    minLng: longitude - delta,
    minLat: latitude - delta,
    maxLng: longitude + delta,
    maxLat: latitude + delta
  })
}

/**
 * 验证GeoJSON数据的有效性
 */
export function validateGeoJSON(geojsonString: string): { valid: boolean; error?: string } {
  try {
    const geojson = JSON.parse(geojsonString)
    
    // 基本结构验证
    if (!geojson.type || !geojson.coordinates) {
      return { valid: false, error: 'Missing type or coordinates' }
    }
    
    // 坐标验证
    const validateCoordinates = (coords: any): boolean => {
      if (!Array.isArray(coords)) return false
      
      if (typeof coords[0] === 'number') {
        // 点坐标 [lng, lat]
        return coords.length === 2 && 
               coords[0] >= -180 && coords[0] <= 180 &&
               coords[1] >= -90 && coords[1] <= 90
      } else if (Array.isArray(coords[0])) {
        // 多边形或线
        return coords.every(validateCoordinates)
      }
      
      return false
    }
    
    if (!validateCoordinates(geojson.coordinates)) {
      return { valid: false, error: 'Invalid coordinates' }
    }
    
    return { valid: true }
  } catch (error) {
    return { valid: false, error: 'Invalid JSON format' }
  }
}

/**
 * 格式化地理数据用于显示
 */
export function formatCoverageForDisplay(coverage: string | null): string {
  if (!coverage) return '未设置覆盖范围'
  
  // 检查是否为中文描述文本
  if (typeof coverage === 'string' && 
      (coverage.includes('范围') || 
       coverage.includes('区域') || 
       coverage.includes('沿海') ||
       /^[\u4e00-\u9fa5\s]+$/.test(coverage.trim()))) {
    return coverage // 直接返回中文描述
  }
  
  const geometry = parseGeoJSON(coverage)
  if (!geometry) return '无效的地理数据'
  
  switch (geometry.type) {
    case 'Point':
      const [lng, lat] = geometry.coordinates
      return `点位置: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
      
    case 'Polygon':
      const center = calculateCenter(geometry)
      if (center) {
        return `多边形区域 (中心: ${center.latitude.toFixed(4)}, ${center.longitude.toFixed(4)})`
      }
      return '多边形区域'
      
    case 'MultiPolygon':
      return '多个多边形区域'
      
    default:
      return '未知地理类型'
  }
}