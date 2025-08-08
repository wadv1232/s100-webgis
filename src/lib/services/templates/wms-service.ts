import { NextRequest, NextResponse } from 'next/server'
import { BaseService, IServiceConfig, IServiceParameters, IServiceCapability } from '../base-service'

// WMS服务特定配置接口
export interface IWmsServiceConfig extends IServiceConfig {
  supportedStyles?: string[]
  defaultStyle?: string
  transparentDefault?: boolean
}

// WMS服务模板类
export abstract class WmsServiceTemplate extends BaseService {
  protected wmsConfig: IWmsServiceConfig

  constructor(config: IWmsServiceConfig) {
    super('wms', config)
    this.wmsConfig = config
  }

  // 处理WMS请求
  public async handleRequest(request: NextRequest, capability: string): Promise<NextResponse> {
    const { searchParams } = new URL(request.url)
    const baseUrl = request.url.split('?')[0]

    // 获取WMS特定参数
    const params: IServiceParameters = {
      service: searchParams.get('service'),
      version: searchParams.get('version'),
      request: searchParams.get('request'),
      dataset: searchParams.get('dataset') || searchParams.get('layers'),
      layers: searchParams.get('layers'),
      styles: searchParams.get('styles') || this.wmsConfig.defaultStyle || 'default',
      crs: searchParams.get('crs') || searchParams.get('srs') || this.wmsConfig.defaultCRS,
      bbox: searchParams.get('bbox'),
      width: searchParams.get('width'),
      height: searchParams.get('height'),
      format: searchParams.get('format') || this.wmsConfig.defaultFormat,
      transparent: searchParams.get('transparent') || (this.wmsConfig.transparentDefault !== false ? 'TRUE' : 'FALSE')
    }

    // 添加服务特定的可选参数
    this.addServiceSpecificParams(params, searchParams)

    const requestType = params.request

    // 处理GetCapabilities请求
    if (requestType === 'GetCapabilities') {
      const wmsCapability = this.getCapabilities().find(cap => cap.type === 'WMS')
      if (!wmsCapability) {
        return this.errorResponse('WMS capability not found', 404)
      }

      const capabilitiesDoc = this.generateCapabilitiesDoc(baseUrl, wmsCapability)
      return this.successResponse(capabilitiesDoc, 'text/xml')
    }

    // 处理GetMap请求
    if (requestType === 'GetMap') {
      return this.handleGetMap(params)
    }

    return this.errorResponse('Unsupported WMS request type', 400)
  }

  // 处理GetMap请求
  private async handleGetMap(params: IServiceParameters): Promise<NextResponse> {
    // 验证必需参数
    const requiredParams = ['bbox', 'width', 'height']
    if (!this.validateRequiredParams(params, requiredParams)) {
      return this.errorResponse('Missing required WMS parameters', 400)
    }

    // 构建查询条件
    const whereClause = this.buildWhereClause(params)

    // 获取数据集
    const datasets = await this.getDatasets(whereClause, 'WMS')

    if (datasets.length === 0) {
      return this.errorResponse(`No available ${this.config.serviceCode} datasets found`, 404)
    }

    try {
      // 生成地图图像
      const imageData = await this.generateMapImage(params, datasets)
      
      return this.successResponse(imageData, params.format || this.wmsConfig.defaultFormat)
    } catch (error) {
      console.error(`${this.config.serviceCode} WMS service error:`, error)
      return this.errorResponse('Internal server error', 500)
    }
  }

  // 抽象方法：添加服务特定参数
  protected abstract addServiceSpecificParams(params: IServiceParameters, searchParams: URLSearchParams): void

  // 抽象方法：生成地图图像
  protected abstract generateMapImage(params: IServiceParameters, datasets: any[]): Promise<Buffer>

  // 生成WMS特定的能力文档
  protected generateCapabilitiesDoc(baseUrl: string, capability: IServiceCapability): string {
    const baseDoc = super.generateCapabilitiesDoc(baseUrl, capability)
    
    // 添加WMS特定的样式信息
    if (this.wmsConfig.supportedStyles && this.wmsConfig.supportedStyles.length > 0) {
      const stylesSection = this.wmsConfig.supportedStyles.map(style => `
        <Style>
          <Name>${style}</Name>
          <Title>${style} Style</Title>
          <LegendURL width="200" height="50">
            <Format>image/png</Format>
            <OnlineResource xlink:href="${baseUrl}/legend/${style}.png"/>
          </LegendURL>
        </Style>`).join('')

      return baseDoc.replace(
        '</Layer>',
        `${stylesSection}
        </Layer>`
      )
    }

    return baseDoc
  }

  // 解析边界框
  protected parseBBox(bbox: string): { minX: number; minY: number; maxX: number; maxY: number } {
    const [minX, minY, maxX, maxY] = bbox.split(',').map(Number)
    return { minX, minY, maxX, maxY }
  }

  // 生成占位图像（用于开发阶段）
  protected generatePlaceholderImage(width: number, height: number, format: string, datasets: any[]): Buffer {
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f8ff"/>
      <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#2c3e50">
        ${this.config.serviceName}
      </text>
      <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="12" fill="#7f8c8d">
        ${datasets.length} dataset(s)
      </text>
      <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="10" fill="#95a5a6">
        WMS Service
      </text>
    </svg>`

    if (format === 'image/svg+xml') {
      return Buffer.from(svg)
    }

    // 对于其他格式，返回简单的占位图像
    return Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
  }
}