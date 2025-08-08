import { BaseService } from './base-service'
import { NodeType, NodeHealth } from '@prisma/client'
import { 
  parseGeoJSON, 
  calculateCenter, 
  generateDefaultCoverage,
  validateGeoJSON,
  formatCoverageForDisplay
} from '@/lib/utils/geo-utils'

// 节点相关类型定义
export interface CreateNodeParams {
  code: string
  name: string
  type: NodeType
  level: number
  description?: string
  apiUrl: string
  adminUrl?: string
  coverage?: string
  isActive?: boolean
  parentId?: string
  latitude?: number
  longitude?: number
}

export interface UpdateNodeParams {
  code?: string
  name?: string
  type?: NodeType
  level?: number
  description?: string
  apiUrl?: string
  adminUrl?: string
  coverage?: string
  isActive?: boolean
  parentId?: string
  latitude?: number
  longitude?: number
}

export interface NodeQueryParams {
  page?: number
  limit?: number
  type?: NodeType
  level?: number
  parentId?: string
  isActive?: boolean
  search?: string
  // 地理空间查询参数
  bbox?: string // 边界框 "minLng,minLat,maxLng,maxLat"
  intersects?: string // GeoJSON几何对象，用于相交查询
  within?: string // GeoJSON几何对象，用于包含查询
}

export interface NodeResult {
  id: string
  code: string
  name: string
  type: NodeType
  level: number
  description?: string
  apiUrl: string
  adminUrl?: string
  coverage?: string
  isActive: boolean
  healthStatus: NodeHealth
  lastHealthCheck?: Date
  parentId?: string
  latitude?: number
  longitude?: number
  // 地理信息显示字段
  coverageDisplay?: string // 格式化的覆盖范围显示文本
  hasCoverage: boolean // 是否有覆盖范围数据
  createdAt: Date
  updatedAt: Date
}

// 节点服务类
export class NodeService extends BaseService {
  constructor() {
    super('node', {
      serviceCode: 'NODE',
      serviceName: 'Node Management Service',
      serviceDescription: 'Service for managing hierarchical node structure',
      icon: 'Network',
      capabilities: []
    })
  }

  // 创建节点
  async createNode(params: CreateNodeParams): Promise<NodeResult> {
    const { code, name, type, level, description, apiUrl, adminUrl, coverage, isActive = true, parentId, latitude, longitude } = params

    // 验证必填字段
    if (!code || !name || !type || level === undefined || !apiUrl) {
      throw new Error('Code, name, type, level, and apiUrl are required')
    }

    // 验证层级
    if (level < 0 || level > 3) {
      throw new Error('Level must be between 0 and 3')
    }

    // 验证父节点（如果提供）
    if (parentId) {
      const parentNode = await this.findById(parentId)
      if (!parentNode) {
        throw new Error('Parent node not found')
      }
      if (parentNode.level >= level) {
        throw new Error('Parent node level must be less than child node level')
      }
    }

    // 处理地理数据
    let finalCoverage = coverage
    let finalLatitude = latitude
    let finalLongitude = longitude

    // 如果提供了覆盖范围，计算中心点
    if (coverage) {
      const validation = validateGeoJSON(coverage)
      if (!validation.valid) {
        throw new Error(`Invalid coverage data: ${validation.error}`)
      }
      
      const geometry = parseGeoJSON(coverage)
      if (geometry) {
        const center = calculateCenter(geometry)
        if (center) {
          finalLatitude = center.latitude
          finalLongitude = center.longitude
        }
      }
    } 
    // 如果只提供了经纬度，生成默认覆盖范围
    else if (latitude !== undefined && longitude !== undefined) {
      const defaultCoverage = generateDefaultCoverage(latitude, longitude)
      finalCoverage = JSON.stringify(defaultCoverage)
    }

    // 创建节点
    const newNode = await this.create({
      code,
      name,
      type,
      level,
      description,
      apiUrl,
      adminUrl,
      coverage: finalCoverage,
      isActive,
      parentId,
      latitude: finalLatitude,
      longitude: finalLongitude
    })

    return this.transformNode(newNode)
  }

  // 获取节点列表
  async getNodes(params: NodeQueryParams = {}): Promise<{
    nodes: NodeResult[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const { page = 1, limit = 10, type, level, parentId, isActive, search, bbox, intersects, within } = params

    // 构建查询条件
    const where: any = {}
    
    if (type) {
      where.type = type
    }
    
    if (level !== undefined) {
      where.level = level
    }
    
    if (parentId !== undefined) {
      where.parentId = parentId
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // 地理空间查询条件
    if (bbox) {
      // 边界框查询 "minLng,minLat,maxLng,maxLat"
      const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number)
      if (!isNaN(minLng) && !isNaN(minLat) && !isNaN(maxLng) && !isNaN(maxLat)) {
        where.AND = [
          where.AND || {},
          {
            latitude: { gte: minLat, lte: maxLat },
            longitude: { gte: minLng, lte: maxLng }
          }
        ]
      }
    }

    // 注意：更复杂的地理空间查询（如intersects, within）需要PostGIS等空间数据库支持
    // 这里先实现基本的边界框查询，后续可以扩展

    // 分页查询
    const result = await this.findWithPagination({
      page,
      limit,
      where,
      orderBy: [{ level: 'asc' }, { name: 'asc' }]
    })

    // 转换节点数据
    const nodes = result.data.map(node => this.transformNode(node))

    return {
      nodes,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages
      }
    }
  }

  // 获取单个节点
  async getNodeById(id: string): Promise<NodeResult | null> {
    const node = await this.findById(id)
    return node ? this.transformNode(node) : null
  }

  // 更新节点
  async updateNode(id: string, params: UpdateNodeParams): Promise<NodeResult> {
    const { code, name, type, level, description, apiUrl, adminUrl, coverage, isActive, parentId, latitude, longitude } = params

    // 检查节点是否存在
    const existingNode = await this.findById(id)
    if (!existingNode) {
      throw new Error('Node not found')
    }

    // 验证层级
    if (level !== undefined && (level < 0 || level > 3)) {
      throw new Error('Level must be between 0 and 3')
    }

    // 验证父节点（如果提供）
    if (parentId !== undefined) {
      if (parentId) {
        const parentNode = await this.findById(parentId)
        if (!parentNode) {
          throw new Error('Parent node not found')
        }
        const newLevel = level !== undefined ? level : existingNode.level
        if (parentNode.level >= newLevel) {
          throw new Error('Parent node level must be less than child node level')
        }
      }
    }

    // 构建更新数据
    const updateData: any = {}
    if (code !== undefined) updateData.code = code
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (level !== undefined) updateData.level = level
    if (description !== undefined) updateData.description = description
    if (apiUrl !== undefined) updateData.apiUrl = apiUrl
    if (adminUrl !== undefined) updateData.adminUrl = adminUrl
    if (coverage !== undefined) updateData.coverage = coverage
    if (isActive !== undefined) updateData.isActive = isActive
    if (parentId !== undefined) updateData.parentId = parentId
    if (latitude !== undefined) updateData.latitude = latitude
    if (longitude !== undefined) updateData.longitude = longitude

    // 更新节点
    const updatedNode = await this.update(id, updateData)
    return this.transformNode(updatedNode)
  }

  // 删除节点
  async deleteNode(id: string): Promise<boolean> {
    const node = await this.findById(id)
    if (!node) {
      throw new Error('Node not found')
    }

    // 检查是否有子节点
    const childNodes = await this.findAll({ where: { parentId: id } })
    if (childNodes.length > 0) {
      throw new Error('Cannot delete node with child nodes')
    }

    return await this.delete(id)
  }

  // 获取节点层级结构
  async getNodeHierarchy(): Promise<NodeResult[]> {
    try {
      const nodes = await this.findAll({
        orderBy: [{ level: 'asc' }, { name: 'asc' }]
      })

      return nodes.map(node => this.transformNode(node))
    } catch (error) {
      console.error('Error getting node hierarchy:', error)
      throw new Error('Failed to get node hierarchy')
    }
  }

  // 获取子节点
  async getChildNodes(parentId: string): Promise<NodeResult[]> {
    try {
      const childNodes = await this.findAll({
        where: { parentId },
        orderBy: [{ level: 'asc' }, { name: 'asc' }]
      })

      return childNodes.map(node => this.transformNode(node))
    } catch (error) {
      console.error('Error getting child nodes:', error)
      throw new Error('Failed to get child nodes')
    }
  }

  // 更新节点健康状态
  async updateNodeHealth(id: string, healthStatus: NodeHealth): Promise<void> {
    try {
      await this.update(id, {
        healthStatus,
        lastHealthCheck: new Date()
      })
    } catch (error) {
      console.error('Error updating node health:', error)
      throw new Error('Failed to update node health')
    }
  }

  // 检查节点健康状态
  async checkNodeHealth(id: string): Promise<{
    status: NodeHealth
    lastCheck: Date
    responseTime?: number
    services?: {
      total: number
      healthy: number
      unhealthy: number
    }
  }> {
    try {
      const node = await this.findById(id)
      if (!node) {
        throw new Error('Node not found')
      }

      // 这里可以添加实际的HTTP健康检查逻辑
      // 现在返回数据库中的状态
      return {
        status: node.healthStatus,
        lastCheck: node.lastHealthCheck || new Date(),
        responseTime: Math.floor(Math.random() * 1000), // 模拟响应时间
        services: {
          total: 5,
          healthy: 4,
          unhealthy: 1
        }
      }
    } catch (error) {
      console.error('Error checking node health:', error)
      throw new Error('Failed to check node health')
    }
  }

  // 获取节点统计信息
  async getNodeStats(): Promise<{
    total: number
    byType: Record<NodeType, number>
    byLevel: Record<number, number>
    healthy: number
    unhealthy: number
    offline: number
  }> {
    try {
      const nodes = await this.findAll()

      const stats = {
        total: nodes.length,
        byType: {} as Record<NodeType, number>,
        byLevel: {} as Record<number, number>,
        healthy: 0,
        unhealthy: 0,
        offline: 0
      }

      // 初始化统计对象
      Object.values(NodeType).forEach(type => {
        stats.byType[type] = 0
      })
      [0, 1, 2, 3].forEach(level => {
        stats.byLevel[level] = 0
      })

      // 统计数据
      nodes.forEach(node => {
        stats.byType[node.type]++
        stats.byLevel[node.level]++
        
        switch (node.healthStatus) {
          case NodeHealth.HEALTHY:
            stats.healthy++
            break
          case NodeHealth.WARNING:
          case NodeHealth.ERROR:
            stats.unhealthy++
            break
          case NodeHealth.OFFLINE:
            stats.offline++
            break
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting node stats:', error)
      throw new Error('Failed to get node stats')
    }
  }

  // 私有方法：转换节点数据
  private transformNode(node: any): NodeResult {
    const hasCoverage = !!node.coverage
    const coverageDisplay = hasCoverage ? formatCoverageForDisplay(node.coverage) : undefined

    return {
      id: node.id,
      code: node.code,
      name: node.name,
      type: node.type,
      level: node.level,
      description: node.description,
      apiUrl: node.apiUrl,
      adminUrl: node.adminUrl,
      coverage: node.coverage,
      isActive: node.isActive,
      healthStatus: node.healthStatus,
      lastHealthCheck: node.lastHealthCheck,
      parentId: node.parentId,
      latitude: node.latitude,
      longitude: node.longitude,
      // 地理信息显示字段
      coverageDisplay,
      hasCoverage,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt
    }
  }
}

// 导出服务实例
export const nodeService = new NodeService()