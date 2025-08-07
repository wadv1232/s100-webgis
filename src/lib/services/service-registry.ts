import { BaseService, IServiceConfig } from './base-service'

// 服务注册表接口
export interface IServiceRegistry {
  register(service: BaseService): void
  unregister(serviceCode: string): void
  getService(serviceCode: string): BaseService | null
  getAllServices(): BaseService[]
  getServicesByCapability(capability: string): BaseService[]
  getServiceConfigs(): IServiceConfig[]
}

// 单例服务注册表实现
export class ServiceRegistry implements IServiceRegistry {
  private static instance: ServiceRegistry
  private services: Map<string, BaseService> = new Map()

  private constructor() {}

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry()
    }
    return ServiceRegistry.instance
  }

  // 注册服务
  public register(service: BaseService): void {
    const config = service.getConfig()
    this.services.set(config.serviceCode, service)
    console.log(`Service ${config.serviceCode} registered successfully`)
  }

  // 注销服务
  public unregister(serviceCode: string): void {
    if (this.services.has(serviceCode)) {
      this.services.delete(serviceCode)
      console.log(`Service ${serviceCode} unregistered successfully`)
    }
  }

  // 获取指定服务
  public getService(serviceCode: string): BaseService | null {
    return this.services.get(serviceCode) || null
  }

  // 获取所有服务
  public getAllServices(): BaseService[] {
    return Array.from(this.services.values())
  }

  // 根据能力获取服务
  public getServicesByCapability(capability: string): BaseService[] {
    return Array.from(this.services.values()).filter(service => {
      const capabilities = service.getCapabilities()
      return capabilities.some(cap => cap.type === capability)
    })
  }

  // 获取所有服务配置
  public getServiceConfigs(): IServiceConfig[] {
    return Array.from(this.services.values()).map(service => service.getConfig())
  }

  // 检查服务是否存在
  public hasService(serviceCode: string): boolean {
    return this.services.has(serviceCode)
  }

  // 获取服务统计信息
  public getStatistics() {
    const services = this.getAllServices()
    const stats = {
      totalServices: services.length,
      servicesByType: {} as Record<string, number>,
      capabilitiesByType: {} as Record<string, number>
    }

    services.forEach(service => {
      const config = service.getConfig()
      stats.servicesByType[config.serviceCode] = (stats.servicesByType[config.serviceCode] || 0) + 1

      const capabilities = service.getCapabilities()
      capabilities.forEach(cap => {
        stats.capabilitiesByType[cap.type] = (stats.capabilitiesByType[cap.type] || 0) + 1
      })
    })

    return stats
  }
}

// 导出单例实例
export const serviceRegistry = ServiceRegistry.getInstance()

// 服务工厂函数类型
export type ServiceFactory = () => BaseService

// 服务注册器类 - 用于批量注册服务
export class ServiceRegistrar {
  private registry: ServiceRegistry

  constructor(registry: ServiceRegistry = serviceRegistry) {
    this.registry = registry
  }

  // 批量注册服务
  public registerServices(factories: Record<string, ServiceFactory>): void {
    Object.entries(factories).forEach(([serviceCode, factory]) => {
      try {
        const service = factory()
        this.registry.register(service)
      } catch (error) {
        console.error(`Failed to register service ${serviceCode}:`, error)
      }
    })
  }

  // 从配置文件注册服务
  public registerFromConfig(configs: IServiceConfig[], implementations: Record<string, new (config: IServiceConfig) => BaseService>): void {
    configs.forEach(config => {
      const Implementation = implementations[config.serviceCode]
      if (Implementation) {
        try {
          const service = new Implementation(config)
          this.registry.register(service)
        } catch (error) {
          console.error(`Failed to register service ${config.serviceCode}:`, error)
        }
      } else {
        console.error(`No implementation found for service ${config.serviceCode}`)
      }
    })
  }
}

// 导出服务注册器实例
export const serviceRegistrar = new ServiceRegistrar()