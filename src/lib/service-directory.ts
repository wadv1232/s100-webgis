import { db } from '@/lib/db'

interface ServiceQuery {
  bbox: [number, number, number, number] // [minX, minY, maxX, maxY]
  productTypes?: string[]
  serviceTypes?: string[]
  minConfidence?: number
}

interface ServiceResult {
  productId: string
  productName: string
  serviceType: string
  endpoint: string
  nodeId: string
  nodeName: string
  coverage: any
  version?: string
  confidence: number
  lastSyncedAt: string
}

interface DirectoryQueryOptions {
  useCache?: boolean
  maxResults?: number
  sortBy?: 'confidence' | 'distance' | 'lastSynced'
  sortOrder?: 'asc' | 'desc'
}

export class ServiceDirectory {
  private static instance: ServiceDirectory

  static getInstance(): ServiceDirectory {
    if (!ServiceDirectory.instance) {
      ServiceDirectory.instance = new ServiceDirectory()
    }
    return ServiceDirectory.instance
  }

  /**
   * 查询服务目录
   */
  async queryServices(query: ServiceQuery, options: DirectoryQueryOptions = {}): Promise<ServiceResult[]> {
    const {
      useCache = true,
      maxResults = 50,
      sortBy = 'confidence',
      sortOrder = 'desc'
    } = options

    const [minX, minY, maxX, maxY] = query.bbox

    // 构建查询条件
    const whereClause: any = {
      isEnabled: true,
      expiresAt: {
        gte: new Date() // 只查询未过期的条目
      }
    }

    if (query.productTypes && query.productTypes.length > 0) {
      whereClause.productType = {
        in: query.productTypes
      }
    }

    if (query.serviceTypes && query.serviceTypes.length > 0) {
      whereClause.serviceType = {
        in: query.serviceTypes
      }
    }

    if (query.minConfidence) {
      whereClause.confidence = {
        gte: query.minConfidence
      }
    }

    try {
      // 查询服务目录
      const entries = await db.serviceDirectoryEntry.findMany({
        where: whereClause,
        include: {
          node: {
            select: {
              id: true,
              name: true,
              healthStatus: true,
              isActive: true
            }
          }
        },
        orderBy: this.getOrderBy(sortBy, sortOrder),
        take: maxResults
      })

      // 在应用层进行空间过滤和评分
      const filteredResults: ServiceResult[] = []

      for (const entry of entries) {
        if (!entry.node.isActive) continue

        let coverage = null
        try {
          coverage = JSON.parse(entry.coverage as string)
        } catch (error) {
          console.warn(`Failed to parse coverage for entry ${entry.id}`)
          continue
        }

        // 检查覆盖范围是否与查询bbox相交
        if (this.isBboxIntersectsWithCoverage(query.bbox, coverage)) {
          // 计算距离分数（基于覆盖范围中心点）
          const distanceScore = this.calculateDistanceScore(query.bbox, coverage)
          
          filteredResults.push({
            productId: entry.productType,
            productName: this.getProductName(entry.productType),
            serviceType: entry.serviceType,
            endpoint: entry.endpoint,
            nodeId: entry.nodeId,
            nodeName: entry.node.name,
            coverage,
            version: entry.version,
            confidence: entry.confidence,
            lastSyncedAt: entry.lastSyncedAt.toISOString()
          })
        }
      }

      // 按指定方式排序
      return this.sortResults(filteredResults, sortBy, sortOrder)

    } catch (error) {
      console.error('Error querying service directory:', error)
      throw new Error('服务目录查询失败')
    }
  }

  /**
   * 获取最佳服务匹配
   */
  async getBestService(query: ServiceQuery): Promise<ServiceResult | null> {
    const results = await this.queryServices(query, {
      maxResults: 1,
      sortBy: 'confidence',
      sortOrder: 'desc'
    })

    return results.length > 0 ? results[0] : null
  }

  /**
   * 获取指定区域的所有可用产品类型
   */
  async getAvailableProducts(bbox: [number, number, number, number]): Promise<string[]> {
    const results = await this.queryServices({ bbox })
    
    const uniqueProducts = [...new Set(results.map(r => r.productId))]
    return uniqueProducts.sort()
  }

  /**
   * 获取服务目录健康状态
   */
  async getHealthStatus() {
    const [totalEntries, activeEntries, expiredEntries, highConfidenceEntries] = await Promise.all([
      db.serviceDirectoryEntry.count(),
      db.serviceDirectoryEntry.count({ where: { isEnabled: true } }),
      db.serviceDirectoryEntry.count({ where: { expiresAt: { lt: new Date() } } }),
      db.serviceDirectoryEntry.count({ where: { confidence: { gte: 0.8 } } })
    ])

    const oldestEntry = await db.serviceDirectoryEntry.findFirst({
      orderBy: { lastSyncedAt: 'asc' }
    })

    const newestEntry = await db.serviceDirectoryEntry.findFirst({
      orderBy: { lastSyncedAt: 'desc' }
    })

    return {
      totalEntries,
      activeEntries,
      expiredEntries,
      highConfidenceEntries,
      healthScore: totalEntries > 0 ? (activeEntries / totalEntries) * 100 : 0,
      lastSync: oldestEntry?.lastSyncedAt,
      latestSync: newestEntry?.lastSyncedAt
    }
  }

  /**
   * 检查bbox是否与覆盖范围相交
   */
  private isBboxIntersectsWithCoverage(bbox: [number, number, number, number], coverage: any): boolean {
    if (!coverage || !coverage.coordinates || !coverage.coordinates[0]) {
      return false
    }

    const [minX, minY, maxX, maxY] = bbox
    const coords = coverage.coordinates[0]

    // 简化的矩形相交检查
    const coverageMinX = Math.min(...coords.map((c: number[]) => c[0]))
    const coverageMaxX = Math.max(...coords.map((c: number[]) => c[0]))
    const coverageMinY = Math.min(...coords.map((c: number[]) => c[1]))
    const coverageMaxY = Math.max(...coords.map((c: number[]) => c[1]))

    // 检查矩形是否相交
    return !(maxX < coverageMinX || minX > coverageMaxX || maxY < coverageMinY || minY > coverageMaxY)
  }

  /**
   * 计算距离分数（0-1，越接近1越好）
   */
  private calculateDistanceScore(bbox: [number, number, number, number], coverage: any): number {
    try {
      const [minX, minY, maxX, maxY] = bbox
      const bboxCenterX = (minX + maxX) / 2
      const bboxCenterY = (minY + maxY) / 2

      const coords = coverage.coordinates[0]
      const coverageMinX = Math.min(...coords.map((c: number[]) => c[0]))
      const coverageMaxX = Math.max(...coords.map((c: number[]) => c[0]))
      const coverageMinY = Math.min(...coords.map((c: number[]) => c[1]))
      const coverageMaxY = Math.max(...coords.map((c: number[]) => c[1]))

      const coverageCenterX = (coverageMinX + coverageMaxX) / 2
      const coverageCenterY = (coverageMinY + coverageMaxY) / 2

      // 计算欧几里得距离的倒数（距离越近分数越高）
      const distance = Math.sqrt(
        Math.pow(bboxCenterX - coverageCenterX, 2) + 
        Math.pow(bboxCenterY - coverageCenterY, 2)
      )

      // 将距离映射到0-1分数范围，最大距离设为10度（约1100km）
      const maxDistance = 10
      return Math.max(0, 1 - (distance / maxDistance))
    } catch (error) {
      return 0.5 // 默认中等分数
    }
  }

  /**
   * 获取排序规则
   */
  private getOrderBy(sortBy: string, sortOrder: string) {
    const order = sortOrder === 'desc' ? 'desc' : 'asc'
    
    switch (sortBy) {
      case 'confidence':
        return { confidence: order }
      case 'lastSynced':
        return { lastSyncedAt: order }
      default:
        return { confidence: 'desc' } // 默认按置信度降序
    }
  }

  /**
   * 排序结果
   */
  private sortResults(results: ServiceResult[], sortBy: string, sortOrder: string): ServiceResult[] {
    const sorted = [...results]
    
    sorted.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'confidence':
          comparison = a.confidence - b.confidence
          break
        case 'distance':
          // 这里简化处理，实际应该在查询时计算
          comparison = 0
          break
        case 'lastSynced':
          comparison = new Date(a.lastSyncedAt).getTime() - new Date(b.lastSyncedAt).getTime()
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })
    
    return sorted
  }

  /**
   * 获取产品名称
   */
  private getProductName(productType: string): string {
    const productNames: Record<string, string> = {
      'S101': 'Electronic Navigational Chart',
      'S102': 'Bathymetric Surface',
      'S104': 'Water Level Information',
      'S111': 'Surface Currents',
      'S124': 'Navigational Warnings',
      'S131': 'Marine Protected Areas'
    }
    
    return productNames[productType] || productType
  }

  /**
   * 清理过期条目
   */
  async cleanup(): Promise<number> {
    const result = await db.serviceDirectoryEntry.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { confidence: { lt: 0.3 } } // 清理低置信度条目
        ]
      }
    })

    return result.count
  }
}