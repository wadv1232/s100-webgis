import { NextRequest, NextResponse } from 'next/server'
import { BaseService, IServiceConfig, IServiceParameters, IServiceCapability } from '../base-service'

// WFS服务特定配置接口
export interface IWfsServiceConfig extends IServiceConfig {
  supportedOutputFormats?: string[]
  defaultOutputFormat?: string
  maxFeaturesDefault?: number
}

// WFS服务模板类
export abstract class WfsServiceTemplate extends BaseService {
  protected wfsConfig: IWfsServiceConfig

  constructor(config: IWfsServiceConfig) {
    super('wfs', config)
    this.wfsConfig = config
  }

  // 处理WFS请求
  public async handleRequest(request: NextRequest, capability: string): Promise<NextResponse> {
    const { searchParams } = new URL(request.url)
    const baseUrl = request.url.split('?')[0]

    // 获取WFS特定参数
    const params: IServiceParameters = {
      service: searchParams.get('service'),
      version: searchParams.get('version'),
      request: searchParams.get('request'),
      dataset: searchParams.get('dataset'),
      typeName: searchParams.get('typeName'),
      bbox: searchParams.get('bbox'),
      maxFeatures: searchParams.get('maxFeatures') || (this.wfsConfig.maxFeaturesDefault?.toString() || '1000'),
      outputFormat: searchParams.get('outputFormat') || this.wfsConfig.defaultOutputFormat || 'GeoJSON'
    }

    // 添加服务特定的可选参数
    this.addServiceSpecificParams(params, searchParams)

    const requestType = params.request

    // 处理GetCapabilities请求
    if (requestType === 'GetCapabilities') {
      const wfsCapability = this.getCapabilities().find(cap => cap.type === 'WFS')
      if (!wfsCapability) {
        return this.errorResponse('WFS capability not found', 404)
      }

      const capabilitiesDoc = this.generateCapabilitiesDoc(baseUrl, wfsCapability)
      return this.successResponse(capabilitiesDoc, 'text/xml')
    }

    // 处理GetFeature请求
    if (requestType === 'GetFeature') {
      return this.handleGetFeature(params)
    }

    return this.errorResponse('Unsupported WFS request type', 400)
  }

  // 处理GetFeature请求
  private async handleGetFeature(params: IServiceParameters): Promise<NextResponse> {
    // 构建查询条件
    const whereClause = this.buildWhereClause(params)

    // 获取数据集
    const datasets = await this.getDatasets(whereClause, 'WFS')

    if (datasets.length === 0) {
      return this.errorResponse(`No available ${this.config.serviceCode} datasets found`, 404)
    }

    try {
      // 生成要素数据
      const featureData = await this.generateFeatures(params, datasets)
      
      // 根据输出格式返回响应
      if (params.outputFormat === 'GeoJSON') {
        return this.successResponse(featureData, 'application/json')
      } else if (params.outputFormat === 'GML') {
        const gmlData = this.convertToGml(featureData)
        return this.successResponse(gmlData, 'application/gml+xml')
      } else {
        return this.errorResponse('Unsupported output format', 400)
      }
    } catch (error) {
      console.error(`${this.config.serviceCode} WFS service error:`, error)
      return this.errorResponse('Internal server error', 500)
    }
  }

  // 抽象方法：添加服务特定参数
  protected abstract addServiceSpecificParams(params: IServiceParameters, searchParams: URLSearchParams): void

  // 抽象方法：生成要素数据
  protected abstract generateFeatures(params: IServiceParameters, datasets: any[]): Promise<any>

  // 转换为GML格式
  protected convertToGml(geojson: any): string {
    const features = geojson.features || []
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml" xmlns:${this.config.serviceCode.toLowerCase()}="http://www.iho.int/s100/${this.config.serviceCode.toLowerCase()}">
  ${features.map((feature: any) => `
  <gml:featureMember>
    <${this.config.serviceCode.toLowerCase()}:feature gml:id="${feature.id}">
      <${this.config.serviceCode.toLowerCase()}:name>${feature.properties?.name || ''}</${this.config.serviceCode.toLowerCase()}:name>
      ${this.generateGmlProperties(feature.properties)}
      <${this.config.serviceCode.toLowerCase()}:geometry>
        ${this.convertGeometryToGml(feature.geometry)}
      </${this.config.serviceCode.toLowerCase()}:geometry>
    </${this.config.serviceCode.toLowerCase()}:feature>
  </gml:featureMember>`).join('')}
</wfs:FeatureCollection>`
  }

  // 生成GML属性
  protected generateGmlProperties(properties: any): string {
    if (!properties) return ''
    
    return Object.entries(properties)
      .filter(([key, value]) => key !== 'name' && value !== undefined)
      .map(([key, value]) => `<${this.config.serviceCode.toLowerCase()}:${key}>${value}</${this.config.serviceCode.toLowerCase()}:${key}>`)
      .join('\n      ')
  }

  // 转换几何图形到GML
  protected convertGeometryToGml(geometry: any): string {
    if (!geometry) return '<gml:Null/>'
    
    switch (geometry.type) {
      case 'Point':
        return `<gml:Point><gml:pos>${geometry.coordinates.join(' ')}</gml:pos></gml:Point>`
      case 'LineString':
        return `<gml:LineString><gml:posList>${geometry.coordinates.flat().join(' ')}</gml:posList></gml:LineString>`
      case 'Polygon':
        return `<gml:Polygon><gml:exterior><gml:LinearRing><gml:posList>${geometry.coordinates[0].flat().join(' ')}</gml:posList></gml:LinearRing></gml:exterior></gml:Polygon>`
      default:
        return '<gml:Null/>'
    }
  }

  // 应用边界框过滤
  protected filterByBBox(features: any[], bbox?: string): any[] {
    if (!bbox) return features
    
    const [minX, minY, maxX, maxY] = bbox.split(',').map(Number)
    
    return features.filter(feature => {
      if (!feature.geometry || !feature.geometry.coordinates) return false
      
      const coords = feature.geometry.coordinates
      if (feature.geometry.type === 'Point') {
        const [x, y] = coords
        return x >= minX && x <= maxX && y >= minY && y <= maxY
      } else if (feature.geometry.type === 'Polygon') {
        return coords[0].some(([x, y]: number[]) => 
          x >= minX && x <= maxX && y >= minY && y <= maxY
        )
      }
      
      return false
    })
  }

  // 限制要素数量
  protected limitFeatures(features: any[], maxFeatures: number): any[] {
    return features.slice(0, parseInt(maxFeatures.toString()))
  }

  // 生成GeoJSON响应
  protected generateGeoJsonResponse(features: any[], datasets: any[]): any {
    return {
      type: 'FeatureCollection',
      features,
      crs: {
        type: 'name',
        properties: {
          name: 'EPSG:4326'
        }
      },
      metadata: {
        totalFeatures: features.length,
        returnedFeatures: features.length,
        datasets: datasets.map(d => ({
          id: d.id,
          name: d.name,
          node: d.node.name
        }))
      }
    }
  }
}