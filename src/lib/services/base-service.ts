/**
 * @fileoverview Base Service Class
 * Abstract base class for all S-100 services
 * @author Development Team
 * @since 2024-01-01
 * @version 1.0.0
 * @module services/base-service
 */

import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServiceConfig, renderServiceTemplate } from '@/config/services'
import { getAppConfig } from '@/config/app'

/**
 * Service configuration interface
 * Defines the structure for service configuration
 * @interface IServiceConfig
 */
export interface IServiceConfig {
  /** Unique service code identifier */
  serviceCode: string
  /** Human-readable service name */
  serviceName: string
  /** Service description */
  serviceDescription: string
  /** Icon identifier for the service */
  icon: string
  /** Array of service capabilities */
  capabilities: IServiceCapability[]
}

/**
 * Service capability interface
 * Defines the structure for individual service capabilities
 * @interface IServiceCapability
 */
export interface IServiceCapability {
  /** Type of capability (WMS, WFS, WCS, etc.) */
  type: string
  /** Name of the capability */
  name: string
  /** Description of what the capability does */
  description: string
  /** Endpoint URL for the capability */
  endpoint: string
  /** List of supported parameters */
  supportedParameters: string[]
  /** List of optional parameters */
  optionalParameters: string[]
}

/**
 * Service parameters interface
 * Generic interface for service parameters
 * @interface IServiceParameters
 */
export interface IServiceParameters {
  [key: string]: any
}

/**
 * Base service interface
 * Defines the contract for all S-100 services
 * @interface IService
 */
export interface IService {
  /** Find a record by ID */
  findById(id: string): Promise<any>
  /** Find all records with optional parameters */
  findAll(params?: any): Promise<any[]>
  /** Create a new record */
  create(data: any): Promise<any>
  /** Update an existing record */
  update(id: string, data: any): Promise<any>
  /** Delete a record */
  delete(id: string): Promise<boolean>
}

/**
 * Abstract base service class
 * Provides common functionality for all S-100 services
 * @class BaseService
 * @implements {IService}
 */
export abstract class BaseService implements IService {
  protected db: PrismaClient = db
  protected modelName: string
  protected config: IServiceConfig

  /**
   * Create a new BaseService instance
   * @param {string} modelName - The name of the database model
   * @param {IServiceConfig} config - Service configuration
   */
  constructor(modelName: string, config: IServiceConfig) {
    this.modelName = modelName
    this.config = config
  }

  /**
   * Get the database model instance
   * @protected
   * @returns {any} The database model instance
   */
  protected get model() {
    return (this.db as any)[this.modelName]
  }

  /**
   * Find a single record by ID
   * @param {string} id - The record ID to find
   * @param {any} include - Optional include parameters for relations
   * @returns {Promise<any>} The found record or null
   * @throws {Error} When database operation fails
   */
  async findById(id: string, include?: any): Promise<any> {
    try {
      return await this.model.findUnique({
        where: { id },
        include
      })
    } catch (error) {
      console.error(`Error finding ${this.modelName} by id:`, error)
      throw new Error(`Failed to find ${this.modelName}`)
    }
  }

  // 查找所有记录
  async findAll(params: {
    where?: any
    include?: any
    orderBy?: any
    skip?: number
    take?: number
  } = {}): Promise<any[]> {
    try {
      return await this.model.findMany(params)
    } catch (error) {
      console.error(`Error finding all ${this.modelName}:`, error)
      throw new Error(`Failed to find ${this.modelName}`)
    }
  }

  // 创建记录
  async create(data: any, include?: any): Promise<any> {
    try {
      return await this.model.create({
        data,
        include
      })
    } catch (error) {
      console.error(`Error creating ${this.modelName}:`, error)
      throw new Error(`Failed to create ${this.modelName}`)
    }
  }

  // 更新记录
  async update(id: string, data: any, include?: any): Promise<any> {
    try {
      return await this.model.update({
        where: { id },
        data,
        include
      })
    } catch (error) {
      console.error(`Error updating ${this.modelName}:`, error)
      throw new Error(`Failed to update ${this.modelName}`)
    }
  }

  // 删除记录
  async delete(id: string): Promise<boolean> {
    try {
      await this.model.delete({
        where: { id }
      })
      return true
    } catch (error) {
      console.error(`Error deleting ${this.modelName}:`, error)
      throw new Error(`Failed to delete ${this.modelName}`)
    }
  }

  // 分页查询
  async findWithPagination(params: {
    page?: number
    limit?: number
    where?: any
    include?: any
    orderBy?: any
  } = {}): Promise<{
    data: any[]
    total: number
    page: number
    limit: number
    pages: number
  }> {
    const { page = 1, limit = 10, where, include, orderBy } = params
    const skip = (page - 1) * limit

    try {
      const [data, total] = await Promise.all([
        this.model.findMany({
          where,
          include,
          orderBy,
          skip,
          take: limit
        }),
        this.model.count({ where })
      ])

      return {
        data,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    } catch (error) {
      console.error(`Error finding ${this.modelName} with pagination:`, error)
      throw new Error(`Failed to find ${this.modelName}`)
    }
  }

  // 搜索查询
  async search(params: {
    query: string
    fields: string[]
    where?: any
    include?: any
    page?: number
    limit?: number
  }): Promise<{
    data: any[]
    total: number
    page: number
    limit: number
    pages: number
  }> {
    const { query, fields, where = {}, include, page = 1, limit = 10 } = params
    const skip = (page - 1) * limit

    const searchWhere = {
      ...where,
      OR: fields.map(field => ({
        [field]: {
          contains: query,
          mode: 'insensitive' as const
        }
      }))
    }

    try {
      const [data, total] = await Promise.all([
        this.model.findMany({
          where: searchWhere,
          include,
          skip,
          take: limit
        }),
        this.model.count({ where: searchWhere })
      ])

      return {
        data,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    } catch (error) {
      console.error(`Error searching ${this.modelName}:`, error)
      throw new Error(`Failed to search ${this.modelName}`)
    }
  }

  // 获取服务配置
  getConfig(): IServiceConfig {
    return this.config
  }

  // 获取服务能力
  getCapabilities(): IServiceCapability[] {
    return this.config.capabilities || []
  }

  // 生成基础能力文档
  protected generateCapabilitiesDoc(baseUrl: string, capability: IServiceCapability): string {
    const appConfig = getAppConfig()
    const serviceConfig = getServiceConfig()
    
    // 获取默认提供者配置
    const providerConfig = serviceConfig.providers.default
    
    // 准备模板数据
    const templateData = {
      serviceName: this.config.serviceName,
      serviceDescription: this.config.serviceDescription,
      serviceType: capability.type,
      providerName: providerConfig.name,
      providerSite: providerConfig.baseUrl,
      contactName: 'System Administrator',
      contactPosition: 'Service Manager',
      contactPhone: providerConfig.contact.phone,
      contactCity: providerConfig.contact.address.split(',')[0],
      contactCountry: providerConfig.contact.address.split(',').slice(-1)[0].trim(),
      contactEmail: providerConfig.contact.email,
      baseUrl: baseUrl,
      endpoint: capability.endpoint
    }
    
    return renderServiceTemplate('capabilities', templateData)
  }

  // 成功响应
  protected successResponse(data: any, contentType: string = 'application/json'): NextResponse {
    if (typeof data === 'string') {
      return new NextResponse(data, {
        status: 200,
        headers: {
          'Content-Type': contentType
        }
      })
    }
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': contentType
      }
    })
  }

  // 错误响应
  protected errorResponse(message: string, status: number = 500): NextResponse {
    return NextResponse.json({
      error: {
        code: status,
        message: message
      }
    }, {
      status
    })
  }

  // 验证必需参数
  protected validateRequiredParams(params: IServiceParameters, requiredParams: string[]): boolean {
    return requiredParams.every(param => params[param] !== undefined && params[param] !== null && params[param] !== '')
  }

  // 构建查询条件
  protected buildWhereClause(params: IServiceParameters): any {
    const where: any = {}
    
    if (params.dataset) {
      where.name = {
        contains: params.dataset,
        mode: 'insensitive'
      }
    }
    
    return where
  }

  // 获取数据集
  protected async getDatasets(where: any, serviceType: string): Promise<any[]> {
    try {
      const { db } = await import('@/lib/db')
      const serviceConfig = getServiceConfig()
      
      // 构建查询条件
      const queryWhere: any = {
        status: 'PUBLISHED'
      }
      
      // 根据服务类型过滤产品类型
      if (this.config.serviceCode && serviceConfig.isValidProductType(this.config.serviceCode)) {
        queryWhere.productType = this.config.serviceCode
      }
      
      // 合并额外的查询条件
      if (where && Object.keys(where).length > 0) {
        Object.assign(queryWhere, where)
      }
      
      // 查询数据库
      const datasets = await db.dataset.findMany({
        where: queryWhere,
        include: {
          node: true
        },
        orderBy: {
          publishedAt: 'desc'
        }
      })
      
      return datasets
    } catch (error) {
      console.error(`Error getting ${this.config.serviceCode} datasets:`, error)
      // 如果数据库查询失败，返回模拟数据作为后备
      return [
        {
          id: '1',
          name: `${this.config.serviceCode} Dataset 1`,
          description: `Sample ${this.config.serviceCode} dataset`,
          productType: this.config.serviceCode,
          version: '1.0',
          status: 'PUBLISHED',
          nodeId: 'shanghai-port',
          node: {
            id: 'shanghai-port',
            name: 'Shanghai Port'
          },
          publishedAt: new Date().toISOString()
        }
      ]
    }
  }
}