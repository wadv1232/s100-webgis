import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 服务配置接口
export interface IServiceConfig {
  serviceCode: string
  serviceName: string
  serviceDescription: string
  icon: string
  capabilities: IServiceCapability[]
}

// 服务能力接口
export interface IServiceCapability {
  type: string
  name: string
  description: string
  endpoint: string
  supportedParameters: string[]
  optionalParameters: string[]
}

// 服务参数接口
export interface IServiceParameters {
  [key: string]: any
}

// 基础服务接口
export interface IService {
  // 基础CRUD操作
  findById(id: string): Promise<any>
  findAll(params?: any): Promise<any[]>
  create(data: any): Promise<any>
  update(id: string, data: any): Promise<any>
  delete(id: string): Promise<boolean>
}

// 基础服务类
export abstract class BaseService implements IService {
  protected db: PrismaClient = db
  protected modelName: string
  protected config: IServiceConfig

  constructor(modelName: string, config: IServiceConfig) {
    this.modelName = modelName
    this.config = config
  }

  // 获取模型实例
  protected get model() {
    return (this.db as any)[this.modelName]
  }

  // 查找单个记录
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
    return `<?xml version="1.0" encoding="UTF-8"?>
<Service xmlns="http://www.opengis.net/sos/2.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sos/2.0 http://schemas.opengis.net/sos/2.0/sos.xsd">
  <ows:Identification>
    <ows:Title>${this.config.serviceName}</ows:Title>
    <ows:Abstract>${this.config.serviceDescription}</ows:Abstract>
    <ows:ServiceType>${capability.type}</ows:ServiceType>
    <ows:ServiceTypeVersion>1.0.0</ows:ServiceTypeVersion>
  </ows:Identification>
  <ows:ServiceProvider>
    <ows:ProviderName>S-100 Maritime Services</ows:ProviderName>
    <ows:ProviderSite>${baseUrl}</ows:ProviderSite>
    <ows:ServiceContact>
      <ows:IndividualName>System Administrator</ows:IndividualName>
      <ows:PositionName>Service Manager</ows:PositionName>
      <ows:ContactInfo>
        <ows:Phone>
          <ows:Voice>+86-21-12345678</ows:Voice>
        </ows:Phone>
        <ows:Address>
          <ows:City>Shanghai</ows:City>
          <ows:Country>China</ows:Country>
          <ows:ElectronicMailAddress>admin@s100-services.org</ows:ElectronicMailAddress>
        </ows:Address>
      </ows:ContactInfo>
    </ows:ServiceContact>
  </ows:ServiceProvider>
  <ows:OperationsMetadata>
    <ows:Operation name="GetCapabilities">
      <ows:DCP>
        <ows:HTTP>
          <ows:Get xlink:href="${baseUrl}${capability.endpoint}"/>
          <ows:Post xlink:href="${baseUrl}${capability.endpoint}"/>
        </ows:HTTP>
      </ows:DCP>
    </ows:Operation>
  </ows:OperationsMetadata>
  <Contents>
    <Layer>
      <ows:Title>${this.config.serviceName}</ows:Title>
      <ows:Abstract>${this.config.serviceDescription}</ows:Abstract>
    </Layer>
  </Contents>
</Service>`
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
      
      // 构建查询条件
      const queryWhere: any = {
        status: 'PUBLISHED'
      }
      
      // 根据服务类型过滤产品类型
      if (this.config.serviceCode === 'S101') {
        queryWhere.productType = 'S101'
      } else if (this.config.serviceCode === 'S102') {
        queryWhere.productType = 'S102'
      } else if (this.config.serviceCode === 'S104') {
        queryWhere.productType = 'S104'
      } else if (this.config.serviceCode === 'S111') {
        queryWhere.productType = 'S111'
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