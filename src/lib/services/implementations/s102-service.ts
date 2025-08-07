import { NextRequest } from 'next/server'
import { WmsServiceTemplate, IWmsServiceConfig } from '../templates/wms-service'
import { WcsServiceTemplate, IWcsServiceConfig } from '../templates/wcs-service'
import { IServiceParameters } from '../base-service'
import { S102_SERVICE_CONFIG } from '../service-config'

// S-102 WMS服务实现
class S102WmsService extends WmsServiceTemplate {
  constructor() {
    super(S102_SERVICE_CONFIG)
  }

  protected addServiceSpecificParams(params: IServiceParameters, searchParams: URLSearchParams): void {
    // S-102特定的可选参数
    params.colorScale = searchParams.get('colorScale') || 'viridis'
    params.time = searchParams.get('time')
    params.elevation = searchParams.get('elevation')
    params.resolution = searchParams.get('resolution')
    params.verticalDatum = searchParams.get('verticalDatum')
  }

  protected async generateMapImage(params: IServiceParameters, datasets: any[]): Promise<Buffer> {
    const { minX, minY, maxX, maxY } = this.parseBBox(params.bbox!)
    const width = parseInt(params.width!)
    const height = parseInt(params.height!)
    const format = params.format!
    const colorScale = params.colorScale || 'viridis'
    const style = params.styles || 'default'

    // 在实际项目中，这里应该：
    // 1. 从S-102 HDF5文件读取水深格网数据
    // 2. 使用GDAL、Mapnik或专门的渲染库生成水深地图
    // 3. 应用颜色映射和样式
    // 4. 支持时间维度和高程维度的切片

    // 根据颜色映射方案生成不同的渐变
    const colorGradient = this.getColorGradient(colorScale)

    // 这里生成一个模拟的S-102水深地图图像
    const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- 颜色映射渐变 -->
        <linearGradient id="depthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          ${colorGradient}
        </linearGradient>
        
        <!-- 水深模式 -->
        <pattern id="depthPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="url(#depthGradient)"/>
          <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.3)"/>
        </pattern>
        
        <!-- 等深线样式 -->
        <pattern id="contourPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="none"/>
          <line x1="0" y1="20" x2="40" y2="20" stroke="#ffffff" stroke-width="1" opacity="0.7"/>
          <line x1="20" y1="0" x2="20" y2="40" stroke="#ffffff" stroke-width="1" opacity="0.7"/>
        </pattern>
      </defs>
      
      <!-- 背景 -->
      <rect width="100%" height="100%" fill="#f0f8ff"/>
      
      <!-- 标题 -->
      <text x="50%" y="30" text-anchor="middle" font-family="Arial" font-size="16" font-weight="bold" fill="#2c3e50">
        S-102 High Resolution Bathymetry
      </text>
      
      <!-- 模拟水深数据区域 -->
      <g transform="translate(50, 60)">
        <!-- 主要水深区域 -->
        <rect x="0" y="0" width="${width-100}" height="${height-120}" fill="url(#depthPattern)" opacity="0.8"/>
        
        <!-- 根据样式应用不同的渲染效果 -->
        ${this.generateStyleSpecificElements(style, width-100, height-120)}
        
        <!-- 模拟等深线 -->
        <g stroke="#ffffff" stroke-width="1" fill="none" opacity="0.7">
          <path d="M 50,50 Q 150,30 250,60 T 450,50" stroke-dasharray="5,3"/>
          <path d="M 30,100 Q 130,80 230,110 T 430,100" stroke-dasharray="5,3"/>
          <path d="M 70,150 Q 170,130 270,160 T 470,150" stroke-dasharray="5,3"/>
          <path d="M 20,200 Q 120,180 220,210 T 420,200" stroke-dasharray="5,3"/>
        </g>
        
        <!-- 模拟深度标注 -->
        <g font-family="Arial" font-size="10" fill="#ffffff" font-weight="bold">
          <text x="100" y="55">10m</text>
          <text x="200" y="105">20m</text>
          <text x="300" y="155">30m</text>
          <text x="150" y="205">40m</text>
        </g>
        
        <!-- 模拟特殊区域 -->
        <g>
          <!-- 浅水区 -->
          <circle cx="150" cy="120" r="25" fill="#4ecdc4" opacity="0.5"/>
          <text x="150" y="125" text-anchor="middle" font-family="Arial" font-size="8" fill="#ffffff">浅水区</text>
          
          <!-- 深水区 -->
          <rect x="300" y="80" width="60" height="40" fill="#2c5aa0" opacity="0.6"/>
          <text x="330" y="105" text-anchor="middle" font-family="Arial" font-size="8" fill="#ffffff">深水区</text>
          
          <!-- 危险区 -->
          <ellipse cx="250" cy="180" rx="30" ry="20" fill="#ff6b6b" opacity="0.4"/>
          <text x="250" y="185" text-anchor="middle" font-family="Arial" font-size="8" fill="#ffffff">危险区</text>
        </g>
        
        <!-- 时间和高程信息（如果有） -->
        ${params.time ? `
        <text x="10" y="${height-140}" font-family="Arial" font-size="8" fill="#666">
          时间: ${new Date(params.time).toLocaleString()}
        </text>` : ''}
        
        ${params.elevation ? `
        <text x="10" y="${height-130}" font-family="Arial" font-size="8" fill="#666">
          高程: ${params.elevation}m
        </text>` : ''}
      </g>
      
      <!-- 图例 -->
      <g transform="translate(50, ${height-80})">
        <text x="0" y="0" font-family="Arial" font-size="12" font-weight="bold" fill="#2c3e50">深度图例 (m)</text>
        <defs>
          <linearGradient id="legendGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            ${colorGradient}
          </linearGradient>
        </defs>
        <rect x="0" y="10" width="200" height="15" fill="url(#legendGradient)"/>
        <text x="0" y="35" font-family="Arial" font-size="10" fill="#2c3e50">0</text>
        <text x="95" y="35" font-family="Arial" font-size="10" fill="#2c3e50" text-anchor="middle">25</text>
        <text x="200" y="35" font-family="Arial" font-size="10" fill="#2c3e50" text-anchor="end">50+</text>
        
        <text x="0" y="55" font-family="Arial" font-size="10" fill="#666">色彩: ${colorScale}</text>
      </g>
      
      <!-- 元数据信息 -->
      <g transform="translate(${width-200}, 60)">
        <rect x="0" y="0" width="180" height="100" fill="rgba(255,255,255,0.9)" stroke="#ddd" rx="5"/>
        <text x="10" y="20" font-family="Arial" font-size="12" font-weight="bold" fill="#2c3e50">数据集信息</text>
        <text x="10" y="35" font-family="Arial" font-size="10" fill="#2c3e50">数据集: ${datasets.length}个</text>
        <text x="10" y="48" font-family="Arial" font-size="10" fill="#2c3e50">样式: ${style}</text>
        <text x="10" y="61" font-family="Arial" font-size="10" fill="#2c3e50">色彩: ${colorScale}</text>
        <text x="10" y="74" font-family="Arial" font-size="10" fill="#2c3e50">范围: ${minX.toFixed(2)},${minY.toFixed(2)} - ${maxX.toFixed(2)},${maxY.toFixed(2)}</text>
        <text x="10" y="87" font-family="Arial" font-size="10" fill="#2c3e50">分辨率: ${params.resolution || '5m'}</text>
      </g>
    </svg>`

    if (format === 'image/svg+xml') {
      return Buffer.from(svg)
    }

    // 对于其他格式，返回占位图像
    return this.generatePlaceholderImage(width, height, format, datasets)
  }

  private getColorGradient(colorScale: string): string {
    const gradients: Record<string, string> = {
      'viridis': `
        <stop offset="0%" style="stop-color:#440154;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#31688e;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#35b779;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#fde725;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#fde725;stop-opacity:1" />`,
      'plasma': `
        <stop offset="0%" style="stop-color:#0d0887;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#7e03a8;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#cc4778;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#f89441;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#f0f921;stop-opacity:1" />`,
      'inferno': `
        <stop offset="0%" style="stop-color:#000004;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#56106d;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#b8376d;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#fc8961;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#fcfdbf;stop-opacity:1" />`,
      'turbo': `
        <stop offset="0%" style="stop-color:#23191e;stop-opacity:1" />
        <stop offset="25%" style="stop-color:#003f5c;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#2f4b7c;stop-opacity:1" />
        <stop offset="75%" style="stop-color:#ffa600;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#fcfdbf;stop-opacity:1" />`
    }
    
    return gradients[colorScale] || gradients.viridis
  }

  private generateStyleSpecificElements(style: string, width: number, height: number): string {
    switch (style) {
      case 'contours':
        return `
        <!-- 等深线样式 -->
        <g stroke="#ffffff" stroke-width="2" fill="none" opacity="0.9">
          <circle cx="${width/2}" cy="${height/2}" r="50"/>
          <circle cx="${width/2}" cy="${height/2}" r="80"/>
          <circle cx="${width/2}" cy="${height/2}" r="120"/>
        </g>`
      
      case 'shaded_relief':
        return `
        <!-- 阴影地形样式 -->
        <defs>
          <filter id="relief">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" result="turbulence"/>
            <feColorMatrix in="turbulence" type="saturate" values="0"/>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#depthGradient)" opacity="0.6" filter="url(#relief)"/>`
      
      case 'hillshade':
        return `
        <!-- 山体阴影样式 -->
        <defs>
          <linearGradient id="hillshade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.8" />
            <stop offset="50%" style="stop-color:#cccccc;stop-opacity:0.4" />
            <stop offset="100%" style="stop-color:#666666;stop-opacity:0.2" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#hillshade)"/>`
      
      default:
        return ''
    }
  }
}

// S-102 WCS服务实现
class S102WcsService extends WcsServiceTemplate {
  constructor() {
    super(S102_SERVICE_CONFIG)
  }

  protected addServiceSpecificParams(params: IServiceParameters, searchParams: URLSearchParams): void {
    // S-102 WCS特定参数
    params.resolution = searchParams.get('resolution')
    params.verticalDatum = searchParams.get('verticalDatum')
    params.horizontalDatum = searchParams.get('horizontalDatum')
    params.depthRange = searchParams.get('depthRange')
    params.interpolation = searchParams.get('interpolation') || 'nearest'
  }

  protected async generateCoverageDescription(params: IServiceParameters, datasets: any[]): Promise<string> {
    // 在实际项目中，这里应该从S-102数据文件中读取真实的元数据
    const coverageDescription = `<?xml version="1.0" encoding="UTF-8"?>
<CoverageDescriptions xmlns="http://www.opengis.net/wcs/2.0" xmlns:gml="http://www.opengis.net/gml/3.2">
  ${datasets.map(dataset => `
  <CoverageDescription gml:id="${dataset.id}">
    <gml:boundedBy>
      <gml:Envelope srsName="EPSG:4326">
        <gml:lowerCorner>120.0 30.0</gml:lowerCorner>
        <gml:upperCorner>122.0 32.0</gml:upperCorner>
      </gml:Envelope>
    </gml:boundedBy>
    <DomainSet>
      <gml:RectifiedGrid gml:id="grid_${dataset.id}" dimension="2">
        <gml:limits>
          <gml:GridEnvelope>
            <gml:low>0 0</gml:low>
            <gml:high>1000 800</gml:high>
          </gml:GridEnvelope>
        </gml:limits>
        <gml:axisLabels>lon lat</gml:axisLabels>
        <gml:origin>
          <gml:Point gml:id="origin_${dataset.id}" srsName="EPSG:4326">
            <gml:pos>120.0 30.0</gml:pos>
          </gml:Point>
        </gml:origin>
        <gml:offsetVector srsName="EPSG:4326">0.002 0</gml:offsetVector>
        <gml:offsetVector srsName="EPSG:4326">0 0.0025</gml:offsetVector>
      </gml:RectifiedGrid>
    </DomainSet>
    <RangeSet>
      <DataBlock>
        <fileRange>
          <FileName>${dataset.id}_bathymetry.tif</FileName>
          <Axis>depth</Axis>
          <uom>m</uom>
        </fileRange>
      </DataBlock>
    </RangeSet>
    <SupportedFormat>
      <format>GeoTIFF</format>
      <format>NetCDF</format>
      <format>GRIB</format>
      <format>HDF5</format>
    </SupportedFormat>
    <SupportedCRS>
      <CRS>EPSG:4326</CRS>
      <CRS>EPSG:3857</CRS>
    </SupportedCRS>
    ${params.time ? `
    <Domain>
      <TemporalDomain>
        <TimePeriod>
          <beginPosition>${params.time}</beginPosition>
          <endPosition>${params.time}</endPosition>
        </TimePeriod>
      </TemporalDomain>
    </Domain>` : ''}
  </CoverageDescription>`).join('')}
</CoverageDescriptions>`

    return coverageDescription
  }

  protected async generateCoverageData(params: IServiceParameters, datasets: any[]): Promise<Buffer> {
    const { minX, minY, maxX, maxY } = this.parseBBox(params.bbox!)
    const width = parseInt(params.width!)
    const height = parseInt(params.height!)
    const format = params.format!

    // 在实际项目中，这里应该：
    // 1. 从数据库或文件系统读取S-102 HDF5文件
    // 2. 使用GDAL/Rasterio等库处理格网数据
    // 3. 根据请求的bbox和尺寸提取数据子集
    // 4. 按照指定格式输出

    if (format === 'NetCDF') {
      // 生成模拟的NetCDF数据
      const netcdfData = `netcdf s102_bathymetry {
dimensions:
  lon = ${width};
  lat = ${height};
  time = UNLIMITED; // (1 currently)
variables:
  double lon(lon);
    lon:units = "degrees_east";
    lon:long_name = "longitude";
    lon:standard_name = "longitude";
  double lat(lat);
    lat:units = "degrees_north"; 
    lat:long_name = "latitude";
    lat:standard_name = "latitude";
  double time(time);
    time:units = "seconds since 1970-01-01 00:00:00";
    time:calendar = "gregorian";
    time:standard_name = "time";
  float depth(time, lat, lon);
    depth:units = "m";
    depth:long_name = "bathymetric depth";
    depth:standard_name = "sea_floor_depth_below_sea_level";
    depth:positive = "down";
    depth:_FillValue = -9999.f;
    depth:coordinates = "time lat lon";

// global attributes:
  :title = "S-102 High Resolution Bathymetry";
  :source = "S-102 Bathymetric Data";
  :history = "Generated from WCS request";
  :Conventions = "CF-1.8";
  :institution = "Maritime Data Provider";
  :references = "S-102 Standard Edition 1.0";
  ${params.verticalDatum ? `:vertical_datum = "${params.verticalDatum}";` : ''}
  ${params.resolution ? `:resolution = "${params.resolution}";` : ''}

data:
  lon = ${Array.from({length: width}, (_, i) => minX + (maxX - minX) * i / (width - 1)).join(', ')};
  lat = ${Array.from({length: height}, (_, i) => minY + (maxY - minY) * i / (height - 1)).join(', ')};
  time = ${params.time ? Math.floor(new Date(params.time).getTime() / 1000) : Math.floor(Date.now() / 1000)};
  depth =
${Array.from({length: height}, (_, i) => 
  '  ' + Array.from({length: width}, (_, j) => {
    // 生成模拟的水深数据，使用正弦函数创建真实的地形变化
    const x = i / height * Math.PI * 2
    const y = j / width * Math.PI * 2
    const depth = -20 - 15 * Math.sin(x) * Math.cos(y) - 5 * Math.sin(x * 2) * Math.cos(y * 2)
    return depth.toFixed(1)
  }).join(', ')
).join(',\n')}
;
}`

      return Buffer.from(netcdfData)
    }

    if (format === 'GeoTIFF') {
      // 生成模拟的GeoTIFF二进制数据
      // 在实际项目中应该使用GDAL等库生成真正的GeoTIFF
      const tiffHeader = Buffer.from('II*\x00', 'ascii') // Little-endian TIFF
      const depthData = Buffer.from(new Float32Array(width * height).map((_, i) => {
        const x = Math.floor(i / width) / height * Math.PI * 2
        const y = (i % width) / width * Math.PI * 2
        return -20 - 15 * Math.sin(x) * Math.cos(y)
      }).buffer)
      
      return Buffer.concat([tiffHeader, depthData])
    }

    // 默认返回二进制数据
    return this.generatePlaceholderCoverage(width, height, format)
  }
}

// 导出S-102服务实例
export const s102WmsService = new S102WmsService()
export const s102WcsService = new S102WcsService()