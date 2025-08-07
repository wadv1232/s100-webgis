import { NextRequest, NextResponse } from 'next/server'
import { BaseService, IServiceConfig, IServiceParameters, IServiceCapability } from '../base-service'

// WCS服务特定配置接口
export interface IWcsServiceConfig extends IServiceConfig {
  supportedCoverageFormats?: string[]
  defaultCoverageFormat?: string
  supportedInterpolations?: string[]
  defaultInterpolation?: string
}

// WCS服务模板类
export abstract class WcsServiceTemplate extends BaseService {
  protected wcsConfig: IWcsServiceConfig

  constructor(config: IWcsServiceConfig) {
    super('wcs', config)
    this.wcsConfig = config
  }

  // 处理WCS请求
  public async handleRequest(request: NextRequest, capability: string): Promise<NextResponse> {
    const { searchParams } = new URL(request.url)
    const baseUrl = request.url.split('?')[0]

    // 获取WCS特定参数
    const params: IServiceParameters = {
      service: searchParams.get('service'),
      version: searchParams.get('version'),
      request: searchParams.get('request'),
      dataset: searchParams.get('dataset'),
      coverageId: searchParams.get('coverageid') || searchParams.get('coverage'),
      format: searchParams.get('format') || this.wcsConfig.defaultCoverageFormat || 'GeoTIFF',
      bbox: searchParams.get('bbox'),
      width: searchParams.get('width'),
      height: searchParams.get('height'),
      crs: searchParams.get('crs') || searchParams.get('srs') || this.wcsConfig.defaultCRS,
      time: searchParams.get('time'),
      interpolation: searchParams.get('interpolation') || this.wcsConfig.defaultInterpolation || 'nearest'
    }

    // 添加服务特定的可选参数
    this.addServiceSpecificParams(params, searchParams)

    const requestType = params.request

    // 处理GetCapabilities请求
    if (requestType === 'GetCapabilities') {
      const wcsCapability = this.getCapabilities().find(cap => cap.type === 'WCS')
      if (!wcsCapability) {
        return this.errorResponse('WCS capability not found', 404)
      }

      const capabilitiesDoc = this.generateCapabilitiesDoc(baseUrl, wcsCapability)
      return this.successResponse(capabilitiesDoc, 'text/xml')
    }

    // 处理DescribeCoverage请求
    if (requestType === 'DescribeCoverage') {
      return this.handleDescribeCoverage(params)
    }

    // 处理GetCoverage请求
    if (requestType === 'GetCoverage') {
      return this.handleGetCoverage(params)
    }

    return this.errorResponse('Unsupported WCS request type', 400)
  }

  // 处理DescribeCoverage请求
  private async handleDescribeCoverage(params: IServiceParameters): Promise<NextResponse> {
    // 构建查询条件
    const whereClause = this.buildWhereClause(params)

    // 获取数据集
    const datasets = await this.getDatasets(whereClause, 'WCS')

    if (datasets.length === 0) {
      return this.errorResponse(`No available ${this.config.serviceCode} datasets found`, 404)
    }

    try {
      // 生成覆盖描述
      const coverageDescription = await this.generateCoverageDescription(params, datasets)
      return this.successResponse(coverageDescription, 'text/xml')
    } catch (error) {
      console.error(`${this.config.serviceCode} WCS DescribeCoverage error:`, error)
      return this.errorResponse('Internal server error', 500)
    }
  }

  // 处理GetCoverage请求
  private async handleGetCoverage(params: IServiceParameters): Promise<NextResponse> {
    // 验证必需参数
    const requiredParams = ['coverageId', 'bbox', 'width', 'height']
    if (!this.validateRequiredParams(params, requiredParams)) {
      return this.errorResponse('Missing required WCS parameters', 400)
    }

    // 构建查询条件
    const whereClause = this.buildWhereClause(params)

    // 获取数据集
    const datasets = await this.getDatasets(whereClause, 'WCS')

    if (datasets.length === 0) {
      return this.errorResponse(`No available ${this.config.serviceCode} datasets found`, 404)
    }

    try {
      // 生成覆盖数据
      const coverageData = await this.generateCoverageData(params, datasets)
      
      return this.successResponse(coverageData, this.getContentType(params.format || this.wcsConfig.defaultCoverageFormat))
    } catch (error) {
      console.error(`${this.config.serviceCode} WCS GetCoverage error:`, error)
      return this.errorResponse('Internal server error', 500)
    }
  }

  // 抽象方法：添加服务特定参数
  protected abstract addServiceSpecificParams(params: IServiceParameters, searchParams: URLSearchParams): void

  // 抽象方法：生成覆盖描述
  protected abstract generateCoverageDescription(params: IServiceParameters, datasets: any[]): Promise<string>

  // 抽象方法：生成覆盖数据
  protected abstract generateCoverageData(params: IServiceParameters, datasets: any[]): Promise<Buffer>

  // 获取内容类型
  protected getContentType(format: string): string {
    switch (format.toLowerCase()) {
      case 'geotiff':
        return 'image/tiff'
      case 'netcdf':
        return 'application/netcdf'
      case 'grib':
        return 'application/x-grib'
      case 'hdf5':
        return 'application/x-hdf5'
      default:
        return 'application/octet-stream'
    }
  }

  // 获取文件扩展名
  protected getFileExtension(format: string): string {
    switch (format.toLowerCase()) {
      case 'geotiff':
        return 'tif'
      case 'netcdf':
        return 'nc'
      case 'grib':
        return 'grib2'
      case 'hdf5':
        return 'h5'
      default:
        return 'bin'
    }
  }

  // 解析边界框
  protected parseBBox(bbox: string): { minX: number; minY: number; maxX: number; maxY: number } {
    const [minX, minY, maxX, maxY] = bbox.split(',').map(Number)
    return { minX, minY, maxX, maxY }
  }

  // 生成WCS特定的能力文档
  protected generateCapabilitiesDoc(baseUrl: string, capability: IServiceCapability): string {
    const baseDoc = super.generateCapabilitiesDoc(baseUrl, capability)
    
    // 添加WCS特定的覆盖格式信息
    if (this.wcsConfig.supportedCoverageFormats && this.wcsConfig.supportedCoverageFormats.length > 0) {
      const formatsSection = this.wcsConfig.supportedCoverageFormats.map(format => 
        `        <Format>${format}</Format>`
      ).join('\n')

      return baseDoc.replace(
        '<GetCoverage>',
        `<GetCoverage>
${formatsSection}`
      )
    }

    return baseDoc
  }

  // 生成占位覆盖数据（用于开发阶段）
  protected generatePlaceholderCoverage(width: number, height: number, format: string): Buffer {
    if (format === 'NetCDF') {
      const netcdfData = `netcdf ${this.config.serviceCode.toLowerCase()}_coverage {
dimensions:
  lon = ${width};
  lat = ${height};
variables:
  double lon(lon);
    lon:units = "degrees_east";
    lon:long_name = "longitude";
  double lat(lat);
    lat:units = "degrees_north"; 
    lat:long_name = "latitude";
  float value(lat, lon);
    value:units = "unknown";
    value:long_name = "${this.config.serviceName} coverage";
    value:_FillValue = -9999.f;

// global attributes:
  :title = "${this.config.serviceName}";
  :source = "${this.config.serviceCode} Coverage Data";
  :history = "Generated from WCS request";
  :Conventions = "CF-1.8";

data:
  lon = ${Array.from({length: width}, (_, i) => i).join(', ')};
  lat = ${Array.from({length: height}, (_, i) => i).join(', ')};
  value =
${Array.from({length: height}, (_, i) => 
  '  ' + Array.from({length: width}, (_, j) => 
    Math.random() * 100
  ).join(', ')
).join(',\n')}
;
}`
      return Buffer.from(netcdfData)
    }

    // 对于其他格式，返回简单的二进制数据
    return Buffer.from(new Uint8Array(width * height * 4))
  }
}