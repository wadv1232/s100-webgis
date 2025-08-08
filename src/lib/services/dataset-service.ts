import { BaseService } from './base-service'
import { S100Product, DatasetStatus } from '@prisma/client'

// 数据集相关类型定义
export interface CreateDatasetParams {
  name: string
  description?: string
  productType: S100Product
  version: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  coverage?: string
  metadata?: string
  nodeId: string
}

export interface UpdateDatasetParams {
  name?: string
  description?: string
  version?: string
  status?: DatasetStatus
  fileName?: string
  filePath?: string
  fileSize?: number
  mimeType?: string
  coverage?: string
  metadata?: string
  nodeId?: string
}

export interface DatasetQueryParams {
  page?: number
  limit?: number
  productType?: S100Product
  status?: DatasetStatus
  nodeId?: string
  search?: string
}

export interface DatasetResult {
  id: string
  name: string
  description?: string
  productType: S100Product
  version: string
  status: DatasetStatus
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  coverage?: string
  metadata?: string
  publishedAt?: Date
  nodeId: string
  nodeName?: string
  createdAt: Date
  updatedAt: Date
}

// 数据集服务类
export class DatasetService extends BaseService {
  constructor() {
    super('dataset')
  }

  // 创建数据集
  async createDataset(params: CreateDatasetParams): Promise<DatasetResult> {
    const { name, description, productType, version, fileName, filePath, fileSize, mimeType, coverage, metadata, nodeId } = params

    // 验证必填字段
    if (!name || !productType || !version || !fileName || !filePath || !fileSize || !mimeType || !nodeId) {
      throw new Error('Name, productType, version, fileName, filePath, fileSize, mimeType, and nodeId are required')
    }

    // 验证产品类型
    if (!Object.values(S100Product).includes(productType)) {
      throw new Error('Invalid product type')
    }

    // 验证节点是否存在
    const node = await this.db.node.findUnique({
      where: { id: nodeId }
    })
    if (!node) {
      throw new Error('Node not found')
    }

    // 创建数据集
    const newDataset = await this.create({
      name,
      description,
      productType,
      version,
      fileName,
      filePath,
      fileSize,
      mimeType,
      coverage,
      metadata,
      nodeId,
      status: DatasetStatus.UPLOADED
    }, {
      node: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    })

    return this.transformDataset(newDataset)
  }

  // 获取数据集列表
  async getDatasets(params: DatasetQueryParams = {}): Promise<{
    datasets: DatasetResult[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const { page = 1, limit = 10, productType, status, nodeId, search } = params

    // 构建查询条件
    const where: any = {}
    
    if (productType) {
      where.productType = productType
    }
    
    if (status) {
      where.status = status
    }
    
    if (nodeId) {
      where.nodeId = nodeId
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { fileName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 分页查询
    const result = await this.findWithPagination({
      page,
      limit,
      where,
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // 转换数据集数据
    const datasets = result.data.map(dataset => this.transformDataset(dataset))

    return {
      datasets,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    }
  }

  // 获取单个数据集
  async getDatasetById(id: string): Promise<DatasetResult | null> {
    const dataset = await this.findById(id, {
      node: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    })

    return dataset ? this.transformDataset(dataset) : null
  }

  // 更新数据集
  async updateDataset(id: string, params: UpdateDatasetParams): Promise<DatasetResult> {
    const { name, description, version, status, fileName, filePath, fileSize, mimeType, coverage, metadata, nodeId } = params

    // 检查数据集是否存在
    const existingDataset = await this.findById(id)
    if (!existingDataset) {
      throw new Error('Dataset not found')
    }

    // 验证节点（如果提供）
    if (nodeId) {
      const node = await this.db.node.findUnique({
        where: { id: nodeId }
      })
      if (!node) {
        throw new Error('Node not found')
      }
    }

    // 构建更新数据
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (version !== undefined) updateData.version = version
    if (status !== undefined) updateData.status = status
    if (fileName !== undefined) updateData.fileName = fileName
    if (filePath !== undefined) updateData.filePath = filePath
    if (fileSize !== undefined) updateData.fileSize = fileSize
    if (mimeType !== undefined) updateData.mimeType = mimeType
    if (coverage !== undefined) updateData.coverage = coverage
    if (metadata !== undefined) updateData.metadata = metadata
    if (nodeId !== undefined) updateData.nodeId = nodeId

    // 更新数据集
    const updatedDataset = await this.update(id, updateData, {
      node: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    })

    return this.transformDataset(updatedDataset)
  }

  // 删除数据集
  async deleteDataset(id: string): Promise<boolean> {
    const dataset = await this.findById(id)
    if (!dataset) {
      throw new Error('Dataset not found')
    }

    // 删除相关文件（如果存在）
    // 这里可以添加文件删除逻辑

    return await this.delete(id)
  }

  // 发布数据集
  async publishDataset(id: string): Promise<DatasetResult> {
    const dataset = await this.findById(id)
    if (!dataset) {
      throw new Error('Dataset not found')
    }

    if (dataset.status === DatasetStatus.PUBLISHED) {
      throw new Error('Dataset is already published')
    }

    // 更新数据集状态为已发布
    const updatedDataset = await this.update(id, {
      status: DatasetStatus.PUBLISHED,
      publishedAt: new Date()
    }, {
      node: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    })

    // 创建相关服务
    await this.createServicesForDataset(id, dataset.productType)

    return this.transformDataset(updatedDataset)
  }

  // 取消发布数据集
  async unpublishDataset(id: string): Promise<DatasetResult> {
    const dataset = await this.findById(id)
    if (!dataset) {
      throw new Error('Dataset not found')
    }

    if (dataset.status !== DatasetStatus.PUBLISHED) {
      throw new Error('Dataset is not published')
    }

    // 更新数据集状态
    const updatedDataset = await this.update(id, {
      status: DatasetStatus.UPLOADED,
      publishedAt: null
    }, {
      node: {
        select: {
          id: true,
          name: true,
          type: true
        }
      }
    })

    // 删除相关服务
    await this.deleteServicesForDataset(id)

    return this.transformDataset(updatedDataset)
  }

  // 获取数据集统计信息
  async getDatasetStats(): Promise<{
    total: number
    byProductType: Record<S100Product, number>
    byStatus: Record<DatasetStatus, number>
    byNode: Record<string, { name: string; count: number }>
    published: number
    processing: number
    error: number
  }> {
    try {
      const datasets = await this.findAll({
        include: {
          node: {
            select: {
              id: true,
              name: true
            }
          }
        }
      })

      const stats = {
        total: datasets.length,
        byProductType: {} as Record<S100Product, number>,
        byStatus: {} as Record<DatasetStatus, number>,
        byNode: {} as Record<string, { name: string; count: number }>,
        published: 0,
        processing: 0,
        error: 0
      }

      // 初始化统计对象
      Object.values(S100Product).forEach(type => {
        stats.byProductType[type] = 0
      })
      Object.values(DatasetStatus).forEach(status => {
        stats.byStatus[status] = 0
      })

      // 统计数据
      datasets.forEach(dataset => {
        stats.byProductType[dataset.productType]++
        stats.byStatus[dataset.status]++
        
        if (dataset.node) {
          const nodeId = dataset.node.id
          if (!stats.byNode[nodeId]) {
            stats.byNode[nodeId] = {
              name: dataset.node.name,
              count: 0
            }
          }
          stats.byNode[nodeId].count++
        }
        
        switch (dataset.status) {
          case DatasetStatus.PUBLISHED:
            stats.published++
            break
          case DatasetStatus.PROCESSING:
            stats.processing++
            break
          case DatasetStatus.ERROR:
            stats.error++
            break
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting dataset stats:', error)
      throw new Error('Failed to get dataset stats')
    }
  }

  // 获取节点数据集
  async getNodeDatasets(nodeId: string, params: Omit<DatasetQueryParams, 'nodeId'> = {}): Promise<DatasetResult[]> {
    const datasets = await this.findAll({
      where: { nodeId },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return datasets.map(dataset => this.transformDataset(dataset))
  }

  // 私有方法：为数据集创建服务
  private async createServicesForDataset(datasetId: string, productType: S100Product): Promise<void> {
    // 根据产品类型创建相应的服务
    const services = this.getServicesForProductType(productType)
    
    for (const service of services) {
      try {
        await this.db.service.create({
          data: {
            datasetId,
            serviceType: service.type,
            endpoint: service.endpoint,
            isActive: true
          }
        })
      } catch (error) {
        console.error(`Error creating service ${service.type} for dataset ${datasetId}:`, error)
      }
    }
  }

  // 私有方法：删除数据集相关服务
  private async deleteServicesForDataset(datasetId: string): Promise<void> {
    try {
      await this.db.service.deleteMany({
        where: { datasetId }
      })
    } catch (error) {
      console.error(`Error deleting services for dataset ${datasetId}:`, error)
    }
  }

  // 私有方法：根据产品类型获取服务列表
  private getServicesForProductType(productType: S100Product): Array<{ type: string; endpoint: string }> {
    const serviceMap: Record<S100Product, Array<{ type: string; endpoint: string }>> = {
      [S100Product.S101]: [
        { type: 'WMS', endpoint: '/api/v1/s101/wms' },
        { type: 'WFS', endpoint: '/api/v1/s101/wfs' }
      ],
      [S100Product.S102]: [
        { type: 'WMS', endpoint: '/api/v1/s102/wms' },
        { type: 'WCS', endpoint: '/api/v1/s102/wcs' }
      ],
      [S100Product.S104]: [
        { type: 'WMS', endpoint: '/api/v1/s104/wms' }
      ],
      [S100Product.S111]: [
        { type: 'WFS', endpoint: '/api/v1/s111/wfs' }
      ],
      [S100Product.S124]: [
        { type: 'WFS', endpoint: '/api/v1/s124/wfs' }
      ],
      [S100Product.S125]: [
        { type: 'WFS', endpoint: '/api/v1/s125/wfs' }
      ],
      [S100Product.S131]: [
        { type: 'WFS', endpoint: '/api/v1/s131/wfs' }
      ]
    }

    return serviceMap[productType] || []
  }

  // 私有方法：转换数据集数据
  private transformDataset(dataset: any): DatasetResult {
    return {
      id: dataset.id,
      name: dataset.name,
      description: dataset.description,
      productType: dataset.productType,
      version: dataset.version,
      status: dataset.status,
      fileName: dataset.fileName,
      filePath: dataset.filePath,
      fileSize: dataset.fileSize,
      mimeType: dataset.mimeType,
      coverage: dataset.coverage,
      metadata: dataset.metadata,
      publishedAt: dataset.publishedAt,
      nodeId: dataset.nodeId,
      nodeName: dataset.node?.name,
      createdAt: dataset.createdAt,
      updatedAt: dataset.updatedAt
    }
  }
}

// 导出服务实例
export const datasetService = new DatasetService()