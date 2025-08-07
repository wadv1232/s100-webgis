import { IServiceConfig } from './base-service'
import { IWmsServiceConfig } from './templates/wms-service'
import { IWfsServiceConfig } from './templates/wfs-service'
import { IWcsServiceConfig } from './templates/wcs-service'

// S-101服务配置
export const S101_SERVICE_CONFIG: IWmsServiceConfig & IWfsServiceConfig = {
  serviceCode: 'S101',
  serviceName: 'S-101 Electronic Navigational Chart',
  serviceDescription: 'Electronic Navigational Chart Service based on S-101 standard',
  icon: 'Map',
  supportedFormats: ['image/png', 'image/jpeg', 'image/svg+xml'],
  defaultFormat: 'image/png',
  supportedCRS: ['EPSG:4326', 'EPSG:3857'],
  defaultCRS: 'EPSG:4326',
  supportedStyles: ['default', 'nautical', 'simplified'],
  defaultStyle: 'default',
  transparentDefault: true,
  supportedOutputFormats: ['GeoJSON', 'GML'],
  defaultOutputFormat: 'GeoJSON',
  maxFeaturesDefault: 1000,
  capabilities: [
    {
      type: 'WMS',
      name: 'Web Map Service',
      description: 'Web Map Service for S-101 Electronic Navigational Chart data visualization',
      endpoint: '/api/s101/wms',
      supportedParameters: ['service', 'version', 'request', 'layers', 'styles', 'crs', 'bbox', 'width', 'height', 'format', 'transparent'],
      optionalParameters: ['time', 'elevation']
    },
    {
      type: 'WFS',
      name: 'Web Feature Service',
      description: 'Web Feature Service for S-101 Electronic Navigational Chart feature data',
      endpoint: '/api/s101/wfs',
      supportedParameters: ['service', 'version', 'request', 'typeName', 'bbox', 'maxFeatures', 'outputFormat'],
      optionalParameters: ['dataset', 'filter']
    }
  ]
}

// S-102服务配置
export const S102_SERVICE_CONFIG: IWmsServiceConfig & IWcsServiceConfig = {
  serviceCode: 'S102',
  serviceName: 'S-102 High Resolution Bathymetry',
  serviceDescription: 'High Resolution Bathymetric Data Service based on S-102 standard',
  icon: 'Waves',
  supportedFormats: ['image/png', 'image/jpeg', 'image/svg+xml', 'GeoTIFF', 'NetCDF'],
  defaultFormat: 'image/png',
  supportedCRS: ['EPSG:4326', 'EPSG:3857'],
  defaultCRS: 'EPSG:4326',
  supportedStyles: ['default', 'contours', 'shaded_relief', 'hillshade', 'slope'],
  defaultStyle: 'default',
  transparentDefault: true,
  supportedCoverageFormats: ['GeoTIFF', 'NetCDF', 'GRIB', 'HDF5'],
  defaultCoverageFormat: 'GeoTIFF',
  supportedInterpolations: ['nearest', 'bilinear', 'cubic'],
  defaultInterpolation: 'nearest',
  capabilities: [
    {
      type: 'WMS',
      name: 'Web Map Service',
      description: 'Web Map Service for S-102 High Resolution Bathymetric Data visualization',
      endpoint: '/api/s102/wms',
      supportedParameters: ['service', 'version', 'request', 'layers', 'styles', 'crs', 'bbox', 'width', 'height', 'format', 'transparent', 'colorScale'],
      optionalParameters: ['time', 'elevation']
    },
    {
      type: 'WCS',
      name: 'Web Coverage Service',
      description: 'Web Coverage Service for S-102 High Resolution Bathymetric Data access',
      endpoint: '/api/s102/wcs',
      supportedParameters: ['service', 'version', 'request', 'coverageid', 'format', 'bbox', 'width', 'height', 'crs'],
      optionalParameters: ['time', 'interpolation', 'resolution']
    }
  ]
}

// 预定义的其他S10x服务配置（用于扩展）
export const S104_SERVICE_CONFIG: IWmsServiceConfig = {
  serviceCode: 'S104',
  serviceName: 'S-104 Water Level Information',
  serviceDescription: 'Water Level Information Service based on S-104 standard',
  icon: 'Anchor',
  supportedFormats: ['image/png', 'image/jpeg', 'image/svg+xml'],
  defaultFormat: 'image/png',
  supportedCRS: ['EPSG:4326', 'EPSG:3857'],
  defaultCRS: 'EPSG:4326',
  supportedStyles: ['default', 'contours', 'gradient'],
  defaultStyle: 'default',
  transparentDefault: true,
  capabilities: [
    {
      type: 'WMS',
      name: 'Web Map Service',
      description: 'Web Map Service for S-104 Water Level Information visualization',
      endpoint: '/api/s104/wms',
      supportedParameters: ['service', 'version', 'request', 'layers', 'styles', 'crs', 'bbox', 'width', 'height', 'format', 'transparent'],
      optionalParameters: ['time', 'datum']
    }
  ]
}

export const S111_SERVICE_CONFIG: IWmsServiceConfig = {
  serviceCode: 'S111',
  serviceName: 'S-111 Surface Currents',
  serviceDescription: 'Surface Currents Service based on S-111 standard',
  icon: 'Waves',
  supportedFormats: ['image/png', 'image/jpeg', 'image/svg+xml'],
  defaultFormat: 'image/png',
  supportedCRS: ['EPSG:4326', 'EPSG:3857'],
  defaultCRS: 'EPSG:4326',
  supportedStyles: ['default', 'arrows', 'streamlines'],
  defaultStyle: 'default',
  transparentDefault: true,
  capabilities: [
    {
      type: 'WMS',
      name: 'Web Map Service',
      description: 'Web Map Service for S-111 Surface Currents visualization',
      endpoint: '/api/s111/wms',
      supportedParameters: ['service', 'version', 'request', 'layers', 'styles', 'crs', 'bbox', 'width', 'height', 'format', 'transparent'],
      optionalParameters: ['time', 'depth']
    }
  ]
}

export const S124_SERVICE_CONFIG: IWmsServiceConfig = {
  serviceCode: 'S124',
  serviceName: 'S-124 Navigational Warnings',
  serviceDescription: 'Navigational Warnings Service based on S-124 standard',
  icon: 'AlertTriangle',
  supportedFormats: ['image/png', 'image/jpeg', 'image/svg+xml'],
  defaultFormat: 'image/png',
  supportedCRS: ['EPSG:4326', 'EPSG:3857'],
  defaultCRS: 'EPSG:4326',
  supportedStyles: ['default', 'priority', 'category'],
  defaultStyle: 'default',
  transparentDefault: true,
  capabilities: [
    {
      type: 'WMS',
      name: 'Web Map Service',
      description: 'Web Map Service for S-124 Navigational Warnings visualization',
      endpoint: '/api/s124/wms',
      supportedParameters: ['service', 'version', 'request', 'layers', 'styles', 'crs', 'bbox', 'width', 'height', 'format', 'transparent'],
      optionalParameters: ['time', 'warningType', 'priority']
    }
  ]
}

// 所有可用的服务配置
export const ALL_SERVICE_CONFIGS = [
  S101_SERVICE_CONFIG,
  S102_SERVICE_CONFIG,
  S104_SERVICE_CONFIG,
  S111_SERVICE_CONFIG,
  S124_SERVICE_CONFIG
]

// 服务配置映射
export const SERVICE_CONFIG_MAP = {
  S101: S101_SERVICE_CONFIG,
  S102: S102_SERVICE_CONFIG,
  S104: S104_SERVICE_CONFIG,
  S111: S111_SERVICE_CONFIG,
  S124: S124_SERVICE_CONFIG
}

// 根据服务代码获取配置
export function getServiceConfig(serviceCode: string): IServiceConfig | null {
  return SERVICE_CONFIG_MAP[serviceCode as keyof typeof SERVICE_CONFIG_MAP] || null
}

// 检查服务是否支持特定能力
export function serviceSupportsCapability(serviceCode: string, capability: string): boolean {
  const config = getServiceConfig(serviceCode)
  if (!config) return false
  
  return config.capabilities.some(cap => cap.type === capability)
}

// 获取支持特定能力的所有服务
export function getServicesByCapability(capability: string): IServiceConfig[] {
  return ALL_SERVICE_CONFIGS.filter(config => 
    config.capabilities.some(cap => cap.type === capability)
  )
}