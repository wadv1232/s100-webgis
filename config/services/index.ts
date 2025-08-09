/**
 * 服务配置文件
 * 包含所有服务相关的配置项
 */

export interface ServiceConfig {
  // 服务类型配置
  serviceTypes: {
    [key: string]: {
      name: string
      description: string
      endpoints: string[]
      supportedParameters: string[]
      optionalParameters: string[]
      capabilities: string[]
    }
  }
  
  // 产品类型配置
  productTypes: {
    [key: string]: {
      name: string
      description: string
      version: string
      serviceTypes: string[]
      defaultServiceType: string
    }
  }
  
  // 服务模板配置
  serviceTemplates: {
    [key: string]: {
      name: string
      description: string
      template: string
      parameters: {
        required: string[]
        optional: string[]
      }
    }
  }
  
  // 服务提供者配置
  providers: {
    [key: string]: {
      name: string
      description: string
      contact: {
        email: string
        phone: string
        address: string
      }
      baseUrl: string
      capabilities: string[]
    }
  }
  
  // 服务质量配置
  quality: {
    responseTime: {
      excellent: number
      good: number
      acceptable: number
    }
    availability: {
      excellent: number
      good: number
      acceptable: number
    }
    reliability: {
      excellent: number
      good: number
      acceptable: number
    }
  }
  
  // 服务监控配置
  monitoring: {
    healthCheckInterval: number
    metricsCollectionInterval: number
    alertThresholds: {
      responseTime: number
      errorRate: number
      availability: number
    }
  }
  
  // 服务缓存配置
  cache: {
    enabled: boolean
    ttl: number
    maxSize: number
    strategies: {
      capabilities: number
      datasets: number
      metadata: number
    }
  }
}

// 默认服务配置
export const defaultServiceConfig: ServiceConfig = {
  serviceTypes: {
    WMS: {
      name: 'Web Map Service',
      description: 'Provides map images as tiles',
      endpoints: ['/wms', '/map'],
      supportedParameters: ['SERVICE', 'VERSION', 'REQUEST', 'LAYERS', 'STYLES', 'CRS', 'BBOX', 'WIDTH', 'HEIGHT', 'FORMAT'],
      optionalParameters: ['TRANSPARENT', 'BGCOLOR', 'EXCEPTIONS', 'TIME', 'ELEVATION'],
      capabilities: ['GetCapabilities', 'GetMap', 'GetFeatureInfo']
    },
    WFS: {
      name: 'Web Feature Service',
      description: 'Provides vector data in GML format',
      endpoints: ['/wfs', '/features'],
      supportedParameters: ['SERVICE', 'VERSION', 'REQUEST', 'TYPENAME', 'PROPERTYNAME', 'FILTER'],
      optionalParameters: ['MAXFEATURES', 'STARTINDEX', 'SORTBY', 'OUTPUTFORMAT'],
      capabilities: ['GetCapabilities', 'DescribeFeatureType', 'GetFeature']
    },
    SOS: {
      name: 'Sensor Observation Service',
      description: 'Provides sensor observations and measurements',
      endpoints: ['/sos', '/observations'],
      supportedParameters: ['SERVICE', 'VERSION', 'REQUEST', 'OFFERING', 'OBSERVEDPROPERTY', 'PROCEDURE'],
      optionalParameters: ['FEATUREOFINTEREST', 'TEMPORALFILTER', 'RESPONSEFORMAT'],
      capabilities: ['GetCapabilities', 'DescribeSensor', 'GetObservation', 'GetFeatureOfInterest']
    },
    WCS: {
      name: 'Web Coverage Service',
      description: 'Provides coverage data',
      endpoints: ['/wcs', '/coverage'],
      supportedParameters: ['SERVICE', 'VERSION', 'REQUEST', 'COVERAGEID', 'FORMAT', 'BBOX'],
      optionalParameters: ['TIME', 'RESOLUTIONX', 'RESOLUTIONY', 'INTERPOLATION'],
      capabilities: ['GetCapabilities', 'DescribeCoverage', 'GetCoverage']
    }
  },
  
  productTypes: {
    S101: {
      name: 'S-101 Electronic Navigational Chart',
      description: 'Vector electronic navigational chart data',
      version: '1.0.0',
      serviceTypes: ['WMS', 'WFS'],
      defaultServiceType: 'WMS'
    },
    S102: {
      name: 'S-102 Bathymetric Surface',
      description: 'Bathymetric surface data',
      version: '1.0.0',
      serviceTypes: ['WMS', 'WCS'],
      defaultServiceType: 'WCS'
    },
    S104: {
      name: 'S-104 Water Level Information',
      description: 'Water level and tidal information',
      version: '1.0.0',
      serviceTypes: ['WMS', 'SOS'],
      defaultServiceType: 'SOS'
    },
    S111: {
      name: 'S-111 Surface Currents',
      description: 'Surface current information',
      version: '1.0.0',
      serviceTypes: ['WMS', 'SOS'],
      defaultServiceType: 'SOS'
    },
    S124: {
      name: 'S-124 Navigational Warnings',
      description: 'Navigational warnings and notices',
      version: '1.0.0',
      serviceTypes: ['WFS', 'SOS'],
      defaultServiceType: 'WFS'
    },
    S131: {
      name: 'S-131 Radio Navigation Warnings',
      description: 'Radio navigational warnings',
      version: '1.0.0',
      serviceTypes: ['WFS', 'SOS'],
      defaultServiceType: 'WFS'
    }
  },
  
  serviceTemplates: {
    capabilities: {
      name: 'Service Capabilities Template',
      description: 'Standard OGC service capabilities document template',
      template: `<?xml version="1.0" encoding="UTF-8"?>
<Service xmlns="http://www.opengis.net/sos/2.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sos.xsd">
  <ows:Identification>
    <ows:Title>{serviceName}</ows:Title>
    <ows:Abstract>{serviceDescription}</ows:Abstract>
    <ows:ServiceType>{serviceType}</ows:ServiceType>
    <ows:ServiceTypeVersion>1.0.0</ows:ServiceTypeVersion>
  </ows:Identification>
  <ows:ServiceProvider>
    <ows:ProviderName>{providerName}</ows:ProviderName>
    <ows:ProviderSite>{providerSite}</ows:ProviderSite>
    <ows:ServiceContact>
      <ows:IndividualName>{contactName}</ows:IndividualName>
      <ows:PositionName>{contactPosition}</ows:PositionName>
      <ows:ContactInfo>
        <ows:Phone>
          <ows:Voice>{contactPhone}</ows:Voice>
        </ows:Phone>
        <ows:Address>
          <ows:City>{contactCity}</ows:City>
          <ows:Country>{contactCountry}</ows:Country>
          <ows:ElectronicMailAddress>{contactEmail}</ows:ElectronicMailAddress>
        </ows:Address>
      </ows:ContactInfo>
    </ows:ServiceContact>
  </ows:ServiceProvider>
  <ows:OperationsMetadata>
    <ows:Operation name="GetCapabilities">
      <ows:DCP>
        <ows:HTTP>
          <ows:Get xlink:href="{baseUrl}{endpoint}"/>
          <ows:Post xlink:href="{baseUrl}{endpoint}"/>
        </ows:HTTP>
      </ows:DCP>
    </ows:Operation>
  </ows:OperationsMetadata>
  <Contents>
    <Layer>
      <ows:Title>{serviceName}</ows:Title>
      <ows:Abstract>{serviceDescription}</ows:Abstract>
    </Layer>
  </Contents>
</Service>`,
      parameters: {
        required: ['serviceName', 'serviceDescription', 'serviceType', 'providerName', 'providerSite'],
        optional: ['contactName', 'contactPosition', 'contactPhone', 'contactCity', 'contactCountry', 'contactEmail']
      }
    }
  },
  
  providers: {
    default: {
      name: 'S-100 Maritime Services',
      description: 'Default service provider',
      contact: {
        email: 'admin@s100-services.org',
        phone: '+86-21-12345678',
        address: 'Shanghai, China'
      },
      baseUrl: 'https://api.s100-services.com',
      capabilities: ['WMS', 'WFS', 'SOS', 'WCS']
    },
    iho: {
      name: 'International Hydrographic Organization',
      description: 'IHO S-100 services provider',
      contact: {
        email: 'info@iho.int',
        phone: '+44-20-7584-5400',
        address: 'Monaco'
      },
      baseUrl: 'https://services.iho.int',
      capabilities: ['WMS', 'WFS', 'SOS']
    }
  },
  
  quality: {
    responseTime: {
      excellent: 1000,    // 1秒
      good: 3000,         // 3秒
      acceptable: 5000    // 5秒
    },
    availability: {
      excellent: 0.99,   // 99%
      good: 0.95,        // 95%
      acceptable: 0.90   // 90%
    },
    reliability: {
      excellent: 0.99,   // 99%
      good: 0.95,        // 95%
      acceptable: 0.90   // 90%
    }
  },
  
  monitoring: {
    healthCheckInterval: 30000,     // 30秒
    metricsCollectionInterval: 60000, // 1分钟
    alertThresholds: {
      responseTime: 5000,           // 5秒
      errorRate: 0.05,              // 5%
      availability: 0.90             // 90%
    }
  },
  
  cache: {
    enabled: true,
    ttl: 3600,                      // 1小时
    maxSize: 1000,                  // 最大缓存1000个条目
    strategies: {
      capabilities: 1800,           // 30分钟
      datasets: 3600,               // 1小时
      metadata: 7200                // 2小时
    }
  }
}

// 获取服务配置
export function getServiceConfig(): ServiceConfig {
  return defaultServiceConfig
}

// 获取服务类型配置
export function getServiceTypeConfig(serviceType: string) {
  const config = getServiceConfig()
  return config.serviceTypes[serviceType]
}

// 获取产品类型配置
export function getProductTypeConfig(productType: string) {
  const config = getServiceConfig()
  return config.productTypes[productType]
}

// 获取服务提供者配置
export function getProviderConfig(providerId: string) {
  const config = getServiceConfig()
  return config.providers[providerId]
}

// 验证服务类型
export function isValidServiceType(serviceType: string): boolean {
  const config = getServiceConfig()
  return serviceType in config.serviceTypes
}

// 验证产品类型
export function isValidProductType(productType: string): boolean {
  const config = getServiceConfig()
  return productType in config.productTypes
}

// 获取产品类型支持的服务类型
export function getSupportedServiceTypes(productType: string): string[] {
  const productConfig = getProductTypeConfig(productType)
  return productConfig ? productConfig.serviceTypes : []
}

// 获取产品类型的默认服务类型
export function getDefaultServiceType(productType: string): string {
  const productConfig = getProductTypeConfig(productType)
  return productConfig ? productConfig.defaultServiceType : 'WMS'
}

// 获取服务能力
export function getServiceCapabilities(serviceType: string): string[] {
  const serviceConfig = getServiceTypeConfig(serviceType)
  return serviceConfig ? serviceConfig.capabilities : []
}

// 获取服务支持的参数
export function getSupportedParameters(serviceType: string): {
  required: string[]
  optional: string[]
} {
  const serviceConfig = getServiceTypeConfig(serviceType)
  if (!serviceConfig) {
    return { required: [], optional: [] }
  }
  
  return {
    required: serviceConfig.supportedParameters,
    optional: serviceConfig.optionalParameters
  }
}

// 渲染服务模板
export function renderServiceTemplate(templateId: string, data: Record<string, string>): string {
  const config = getServiceConfig()
  const template = config.serviceTemplates[templateId]
  
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }
  
  let rendered = template.template
  
  // 替换模板变量
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{${key}}`, 'g')
    rendered = rendered.replace(regex, value)
  })
  
  return rendered
}

// 导出默认配置
export default getServiceConfig