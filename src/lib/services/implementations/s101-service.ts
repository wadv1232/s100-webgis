import { NextRequest } from 'next/server'
import { WmsServiceTemplate, IWmsServiceConfig } from '../templates/wms-service'
import { WfsServiceTemplate, IWfsServiceConfig } from '../templates/wfs-service'
import { IServiceParameters } from '../base-service'
import { S101_SERVICE_CONFIG } from '../service-config'

// S-101 WMS服务实现
class S101WmsService extends WmsServiceTemplate {
  constructor() {
    super(S101_SERVICE_CONFIG)
  }

  protected addServiceSpecificParams(params: IServiceParameters, searchParams: URLSearchParams): void {
    // S-101特定的可选参数
    params.featureType = searchParams.get('featureType')
    params.safetyContour = searchParams.get('safetyContour')
    params.shallowContour = searchParams.get('shallowContour')
    params.deepContour = searchParams.get('deepContour')
  }

  protected async generateMapImage(params: IServiceParameters, datasets: any[]): Promise<Buffer> {
    const { minX, minY, maxX, maxY } = this.parseBBox(params.bbox!)
    const width = parseInt(params.width!)
    const height = parseInt(params.height!)
    const format = params.format!

    // 在实际项目中，这里应该：
    // 1. 从S-101 S-57文件读取海图数据
    // 2. 使用地图渲染库（如Mapnik、GeoServer）生成海图图像
    // 3. 应用S-101特定的符号化和样式
    // 4. 支持不同要素类型的显示控制

    // 这里生成一个模拟的S-101海图图像
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- S-101特定符号定义 -->
        <pattern id="depthPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#4a90e2" opacity="0.3"/>
          <circle cx="10" cy="10" r="2" fill="#2c5aa0"/>
        </pattern>
        
        <!-- 航道符号 -->
        <g id="channelSymbol">
          <line x1="0" y1="0" x2="20" y2="0" stroke="#ff6b6b" stroke-width="2"/>
          <circle cx="10" cy="0" r="3" fill="#ff6b6b"/>
        </g>
      </defs>
      
      <!-- 背景 -->
      <rect width="100%" height="100%" fill="#e6f3ff"/>
      
      <!-- 标题 -->
      <text x="50%" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#2c3e50">
        S-101 Electronic Navigational Chart
      </text>
      
      <!-- 模拟海图要素 -->
      <g transform="translate(50, 60)">
        <!-- 深度区域 -->
        <rect x="0" y="0" width="${width-100}" height="${height-120}" fill="url(#depthPattern)" opacity="0.6"/>
        
        <!-- 模拟等深线 -->
        <g stroke="#ffffff" stroke-width="1" fill="none" opacity="0.8">
          <path d="M 50,50 Q 150,30 250,60 T 450,50" stroke-dasharray="5,3"/>
          <path d="M 30,100 Q 130,80 230,110 T 430,100" stroke-dasharray="5,3"/>
          <path d="M 70,150 Q 170,130 270,160 T 470,150" stroke-dasharray="5,3"/>
        </g>
        
        <!-- 模拟航道 -->
        <g stroke="#ff6b6b" stroke-width="3" fill="none" opacity="0.7">
          <path d="M 20,200 Q 200,180 400,220"/>
        </g>
        
        <!-- 模拟浮标 -->
        <g fill="#ff7043" stroke="#d84315" stroke-width="2">
          <circle cx="150" cy="120" r="8"/>
          <text x="150" y="125" text-anchor="middle" font-family="Arial" font-size="8" fill="#ffffff">B1</text>
          
          <circle cx="300" cy="180" r="8"/>
          <text x="300" y="185" text-anchor="middle" font-family="Arial" font-size="8" fill="#ffffff">B2</text>
        </g>
        
        <!-- 模拟灯标 -->
        <g fill="#ffd93d" stroke="#f39c12" stroke-width="2">
          <polygon points="250,80 255,90 245,90"/>
          <text x="250" y="105" text-anchor="middle" font-family="Arial" font-size="8" fill="#2c3e50">L1</text>
        </g>
        
        <!-- 模拟危险区域 -->
        <g>
          <circle cx="350" cy="140" r="25" fill="#ff6b6b" opacity="0.3" stroke="#d84315" stroke-width="2" stroke-dasharray="5,5"/>
          <text x="350" y="145" text-anchor="middle" font-family="Arial" font-size="10" fill="#d84315" font-weight="bold">危险区</text>
        </g>
        
        <!-- 深度标注 -->
        <g font-family="Arial" font-size="10" fill="#2c5aa0" font-weight="bold">
          <text x="100" y="75">12.5</text>
          <text x="200" y="125">8.3</text>
          <text x="320" y="175">15.7</text>
          <text x="180" y="225">6.2</text>
        </g>
      </g>
      
      <!-- 图例 -->
      <g transform="translate(50, ${height-80})">
        <rect x="0" y="0" width="200" height="60" fill="rgba(255,255,255,0.9)" stroke="#ddd" rx="5"/>
        <text x="10" y="20" font-family="Arial" font-size="12" font-weight="bold" fill="#2c3e50">图例</text>
        
        <circle cx="20" cy="35" r="5" fill="#ff7043"/>
        <text x="30" y="40" font-family="Arial" font-size="10" fill="#2c3e50">浮标</text>
        
        <polygon points="70,32 73,38 67,38" fill="#ffd93d"/>
        <text x="80" y="40" font-family="Arial" font-size="10" fill="#2c3e50">灯标</text>
        
        <line x1="120" y1="35" x2="140" y2="35" stroke="#ff6b6b" stroke-width="2"/>
        <text x="145" y="40" font-family="Arial" font-size="10" fill="#2c3e50">航道</text>
      </g>
      
      <!-- 元数据信息 -->
      <g transform="translate(${width-200}, 60)">
        <rect x="0" y="0" width="180" height="80" fill="rgba(255,255,255,0.9)" stroke="#ddd" rx="5"/>
        <text x="10" y="20" font-family="Arial" font-size="12" font-weight="bold" fill="#2c3e50">数据集信息</text>
        <text x="10" y="35" font-family="Arial" font-size="10" fill="#2c3e50">数据集: ${datasets.length}个</text>
        <text x="10" y="48" font-family="Arial" font-size="10" fill="#2c3e50">样式: ${params.styles}</text>
        <text x="10" y="61" font-family="Arial" font-size="10" fill="#2c3e50">范围: ${minX.toFixed(2)},${minY.toFixed(2)} - ${maxX.toFixed(2)},${maxY.toFixed(2)}</text>
        <text x="10" y="74" font-family="Arial" font-size="10" fill="#2c3e50">比例: 1:${Math.round((maxX-minX)/(width/1000))}</text>
      </g>
    </svg>`

    if (format === 'image/svg+xml') {
      return Buffer.from(svg)
    }

    // 对于其他格式，返回占位图像
    return this.generatePlaceholderImage(width, height, format, datasets)
  }
}

// S-101 WFS服务实现
class S101WfsService extends WfsServiceTemplate {
  constructor() {
    super(S101_SERVICE_CONFIG)
  }

  protected addServiceSpecificParams(params: IServiceParameters, searchParams: URLSearchParams): void {
    // S-101 WFS特定参数
    params.featureCode = searchParams.get('featureCode')
    params.safetyDepth = searchParams.get('safetyDepth')
    params.qualityOfSurvey = searchParams.get('qualityOfSurvey')
  }

  protected async generateFeatures(params: IServiceParameters, datasets: any[]): Promise<any> {
    try {
      // 从数据库查询真实的S-101要素数据
      const { db } = await import('@/lib/db')
      
      // 构建查询条件
      const whereClause: any = {
        productType: 'S101',
        status: 'PUBLISHED'
      }
      
      // 如果指定了数据集ID，添加过滤条件
      if (params.dataset) {
        whereClause.id = params.dataset
      }
      
      // 查询数据集
      const dbDatasets = await db.dataset.findMany({
        where: whereClause,
        include: {
          node: true
        },
        orderBy: {
          publishedAt: 'desc'
        }
      })
      
      if (dbDatasets.length === 0) {
        // 如果没有真实数据，返回模拟数据
        return this.generateMockFeatures(params, datasets)
      }
      
      // 从数据集的coverage字段提取GeoJSON要素
      const features = dbDatasets.flatMap(dataset => {
        let geoJsonFeatures = []
        
        // 尝试解析coverage字段中的GeoJSON数据
        if (dataset.coverage) {
          try {
            const coverageData = JSON.parse(dataset.coverage)
            if (coverageData.type === 'FeatureCollection') {
              geoJsonFeatures = coverageData.features || []
            } else if (coverageData.type === 'Feature') {
              geoJsonFeatures = [coverageData]
            }
          } catch (e) {
            console.warn(`Failed to parse coverage for dataset ${dataset.id}:`, e)
          }
        }
        
        // 如果没有GeoJSON数据，生成基于数据集信息的要素
        if (geoJsonFeatures.length === 0) {
          geoJsonFeatures = this.generateDatasetFeatures(dataset, params)
        }
        
        // 为每个要素添加数据集属性
        return geoJsonFeatures.map((feature, index) => ({
          ...feature,
          id: feature.id || `${dataset.id}_${index}`,
          properties: {
            ...feature.properties,
            datasetId: dataset.id,
            datasetName: dataset.name,
            nodeId: dataset.nodeId,
            nodeName: dataset.node.name,
            productType: dataset.productType,
            version: dataset.version,
            publishedAt: dataset.publishedAt,
            // S-101特定属性
            featureCode: params.featureCode || feature.properties?.featureCode || 'DEPARE',
            safetyDepth: params.safetyDepth ? parseFloat(params.safetyDepth) : feature.properties?.safetyDepth || 10.5,
            qualityOfSurvey: params.qualityOfSurvey || feature.properties?.qualityOfSurvey || 'Zone of Confidence A',
            scaleMinimum: feature.properties?.scaleMinimum || 50000,
            scaleMaximum: feature.properties?.scaleMaximum || 5000000,
            horizontalDatum: feature.properties?.horizontalDatum || 'WGS84',
            verticalDatum: feature.properties?.verticalDatum || 'Mean Sea Level'
          }
        }))
      })
      
      // 应用边界框过滤
      let filteredFeatures = features
      if (params.bbox) {
        filteredFeatures = this.filterByBBox(filteredFeatures, params.bbox)
      }
      
      // 应用要素代码过滤
      if (params.featureCode) {
        filteredFeatures = filteredFeatures.filter(feature => 
          feature.properties.featureCode === params.featureCode
        )
      }
      
      // 限制要素数量
      const limitedFeatures = this.limitFeatures(filteredFeatures, parseInt(params.maxFeatures!))
      
      return this.generateGeoJsonResponse(limitedFeatures, dbDatasets)
    } catch (error) {
      console.error('Error generating S-101 features:', error)
      // 如果数据库查询失败，返回模拟数据
      return this.generateMockFeatures(params, datasets)
    }
  }
  
  // 生成基于数据集的要素
  private generateDatasetFeatures(dataset: any, params: IServiceParameters): any[] {
    const baseCoordinates = this.parseDatasetCoordinates(dataset)
    
    return [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [baseCoordinates]
      },
      properties: {
        name: dataset.name,
        description: dataset.description,
        featureType: this.getFeatureTypeName(params.featureCode || 'DEPARE')
      }
    }]
  }
  
  // 解析数据集坐标
  private parseDatasetCoordinates(dataset: any): number[][] {
    // 如果数据集有经纬度信息，使用它
    if (dataset.node?.latitude && dataset.node?.longitude) {
      const lat = dataset.node.latitude
      const lng = dataset.node.longitude
      const delta = 0.1 // 生成一个小的多边形区域
      
      return [
        [lng - delta, lat - delta],
        [lng + delta, lat - delta],
        [lng + delta, lat + delta],
        [lng - delta, lat + delta],
        [lng - delta, lat - delta]
      ]
    }
    
    // 默认坐标（上海附近）
    return [
      [121.0, 31.0],
      [121.5, 31.0],
      [121.5, 31.5],
      [121.0, 31.5],
      [121.0, 31.0]
    ]
  }
  
  // 生成模拟要素数据（后备方案）
  private generateMockFeatures(params: IServiceParameters, datasets: any[]): any {
    const features = datasets.flatMap(dataset => {
      const baseFeature = {
        type: 'Feature',
        id: dataset.id,
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [120.0 + Math.random() * 2, 30.0 + Math.random() * 2],
            [121.0 + Math.random() * 2, 30.0 + Math.random() * 2],
            [121.0 + Math.random() * 2, 31.0 + Math.random() * 2],
            [120.0 + Math.random() * 2, 31.0 + Math.random() * 2],
            [120.0 + Math.random() * 2, 30.0 + Math.random() * 2]
          ]]
        },
        properties: {
          name: dataset.name,
          datasetId: dataset.id,
          nodeId: dataset.nodeId,
          nodeName: dataset.node.name,
          productType: dataset.productType,
          version: dataset.version,
          publishedAt: dataset.publishedAt,
          // S-101特定属性
          featureCode: params.featureCode || 'DEPARE',
          featureType: this.getFeatureTypeName(params.featureCode || 'DEPARE'),
          safetyDepth: params.safetyDepth ? parseFloat(params.safetyDepth) : 10.5,
          qualityOfSurvey: params.qualityOfSurvey || 'Zone of Confidence A',
          scaleMinimum: 50000,
          scaleMaximum: 5000000,
          horizontalDatum: 'WGS84',
          verticalDatum: 'Mean Sea Level'
        }
      }

      // 根据要素代码生成多个要素
      return this.generateMultipleFeatures(baseFeature, params.featureCode || 'DEPARE')
    })

    // 应用边界框过滤
    let filteredFeatures = features
    if (params.bbox) {
      filteredFeatures = this.filterByBBox(features, params.bbox)
    }

    // 限制要素数量
    const limitedFeatures = this.limitFeatures(filteredFeatures, parseInt(params.maxFeatures!))

    return this.generateGeoJsonResponse(limitedFeatures, datasets)
  }

  private getFeatureTypeName(featureCode: string): string {
    const featureTypes: Record<string, string> = {
      'DEPARE': '深度区域',
      'BOYLAT': '浮标、立标',
      'LIGHTS': '灯标',
      'BUOY': '浮标',
      'SOUNDG': '测深点',
      'COALNE': '海岸线',
      'DEPCNT': '等深线',
      'OBSTRN': '障碍物'
    }
    return featureTypes[featureCode] || '未知要素'
  }

  private generateMultipleFeatures(baseFeature: any, featureCode: string): any[] {
    const features = [baseFeature]
    
    // 根据要素类型生成不同的几何图形
    if (featureCode === 'LIGHTS') {
      // 生成点状要素（灯标）
      for (let i = 0; i < 5; i++) {
        features.push({
          ...baseFeature,
          id: `${baseFeature.id}_light_${i}`,
          geometry: {
            type: 'Point',
            coordinates: [
              120.5 + Math.random() * 1.5,
              30.5 + Math.random() * 1.5
            ]
          },
          properties: {
            ...baseFeature.properties,
            featureType: '灯标',
            lightCharacteristic: 'Flashing',
            lightColour: 'White',
            lightPeriod: 5
          }
        })
      }
    } else if (featureCode === 'BUOY') {
      // 生成点状要素（浮标）
      for (let i = 0; i < 8; i++) {
        features.push({
          ...baseFeature,
          id: `${baseFeature.id}_buoy_${i}`,
          geometry: {
            type: 'Point',
            coordinates: [
              120.8 + Math.random() * 1.2,
              30.8 + Math.random() * 1.2
            ]
          },
          properties: {
            ...baseFeature.properties,
            featureType: '浮标',
            buoyShape: 'Can',
            buoyColour: 'Red',
            buoyPurpose: 'Lateral'
          }
        })
      }
    } else if (featureCode === 'DEPCNT') {
      // 生成线状要素（等深线）
      for (let i = 0; i < 3; i++) {
        features.push({
          ...baseFeature,
          id: `${baseFeature.id}_contour_${i}`,
          geometry: {
            type: 'LineString',
            coordinates: [
              [120.5 + i * 0.3, 30.5],
              [121.0 + i * 0.3, 30.7],
              [121.5 + i * 0.3, 30.6],
              [122.0 + i * 0.3, 30.8]
            ]
          },
          properties: {
            ...baseFeature.properties,
            featureType: '等深线',
            depthValue: 10 + i * 5,
            contourInterval: 5
          }
        })
      }
    }

    return features
  }
}

// 导出S-101服务实例
export const s101WmsService = new S101WmsService()
export const s101WfsService = new S101WfsService()