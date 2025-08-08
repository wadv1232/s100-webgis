import { serviceRegistry, serviceRegistrar } from './service-registry'
import { s101WmsService, s101WfsService } from './implementations/s101-service'
import { s102WmsService, s102WcsService } from './implementations/s102-service'
import { S101_SERVICE_CONFIG, S102_SERVICE_CONFIG } from './service-config'

// 服务初始化和注册
export class ServiceInitializer {
  
  // 初始化所有服务
  public static initializeServices(): void {
    console.log('Initializing S-100 services...')
    
    try {
      // 注册S-101服务
      this.registerS101Services()
      
      // 注册S-102服务
      this.registerS102Services()
      
      // 输出服务注册统计信息
      const stats = serviceRegistry.getStatistics()
      console.log('Service initialization completed:', {
        totalServices: stats.totalServices,
        servicesByType: stats.servicesByType,
        capabilitiesByType: stats.capabilitiesByType
      })
      
    } catch (error) {
      console.error('Service initialization failed:', error)
      throw error
    }
  }
  
  // 注册S-101服务
  private static registerS101Services(): void {
    console.log('Registering S-101 services...')
    
    // 注册WMS服务
    serviceRegistry.register(s101WmsService)
    
    // 注册WFS服务
    serviceRegistry.register(s101WfsService)
    
    console.log(`S-101 services registered: ${S101_SERVICE_CONFIG.serviceCode} (WMS, WFS)`)
  }
  
  // 注册S-102服务
  private static registerS102Services(): void {
    console.log('Registering S-102 services...')
    
    // 注册WMS服务
    serviceRegistry.register(s102WmsService)
    
    // 注册WCS服务
    serviceRegistry.register(s102WcsService)
    
    console.log(`S-102 services registered: ${S102_SERVICE_CONFIG.serviceCode} (WMS, WCS)`)
  }
  
  // 动态注册新服务（用于运行时扩展）
  public static registerService(serviceCode: string, serviceFactory: () => any): boolean {
    try {
      const service = serviceFactory()
      serviceRegistry.register(service)
      console.log(`Dynamic service registered: ${serviceCode}`)
      return true
    } catch (error) {
      console.error(`Failed to register dynamic service ${serviceCode}:`, error)
      return false
    }
  }
  
  // 注销服务
  public static unregisterService(serviceCode: string): boolean {
    try {
      serviceRegistry.unregister(serviceCode)
      console.log(`Service unregistered: ${serviceCode}`)
      return true
    } catch (error) {
      console.error(`Failed to unregister service ${serviceCode}:`, error)
      return false
    }
  }
  
  // 获取服务注册表状态
  public static getServiceRegistryStatus(): any {
    const services = serviceRegistry.getAllServices()
    const stats = serviceRegistry.getStatistics()
    
    return {
      initialized: true,
      serviceCount: services.length,
      serviceCodes: services.map(s => s.getConfig().serviceCode),
      capabilities: Array.from(new Set(
        services.flatMap(s => s.getCapabilities().map(c => c.type))
      )),
      statistics: stats
    }
  }
  
  // 验证服务健康状态
  public static async validateServiceHealth(): Promise<any> {
    const services = serviceRegistry.getAllServices()
    const healthStatus: any = {}
    
    for (const service of services) {
      const config = service.getConfig()
      try {
        // 简单的健康检查 - 验证服务配置和基本功能
        const capabilities = service.getCapabilities()
        const isHealthy = capabilities.length > 0
        
        healthStatus[config.serviceCode] = {
          healthy: isHealthy,
          capabilities: capabilities.length,
          lastChecked: new Date().toISOString()
        }
      } catch (error) {
        healthStatus[config.serviceCode] = {
          healthy: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          lastChecked: new Date().toISOString()
        }
      }
    }
    
    return healthStatus
  }
}

// 自动初始化服务（在应用启动时调用）
export function initializeServices(): void {
  try {
    ServiceInitializer.initializeServices()
  } catch (error) {
    console.error('Failed to initialize services:', error)
    // 在实际项目中，这里可能需要更优雅的错误处理
    // 例如：重试机制、降级模式等
  }
}

// 导出服务注册表实例，供其他模块使用
export { serviceRegistry, serviceRegistrar }

// 导出服务实例，供API路由使用
export {
  s101WmsService,
  s101WfsService,
  s102WmsService,
  s102WcsService
}