import { db } from '@/lib/db'
import { SyncStatus, SyncTarget } from '@prisma/client'

interface ServiceCapability {
  productType: string
  serviceType: string
  endpoint: string
  version?: string
  coverage?: any
}

interface NodeCapabilities {
  nodeId: string
  nodeName: string
  nodeLevel: number
  isActive: boolean
  healthStatus: string
  capabilities: ServiceCapability[]
  children?: NodeCapabilities[]
}

interface SyncResult {
  success: boolean
  message: string
  entriesProcessed: number
  errors: string[]
  duration: number
}

export class ServiceDirectorySync {
  private static instance: ServiceDirectorySync
  private isSyncing = false

  static getInstance(): ServiceDirectorySync {
    if (!ServiceDirectorySync.instance) {
      ServiceDirectorySync.instance = new ServiceDirectorySync()
    }
    return ServiceDirectorySync.instance
  }

  /**
   * 执行全量同步
   */
  async fullSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return {
        success: false,
        message: '同步任务正在进行中',
        entriesProcessed: 0,
        errors: ['同步冲突：已有任务在运行'],
        duration: 0
      }
    }

    this.isSyncing = true
    const startTime = Date.now()
    const errors: string[] = []
    let entriesProcessed = 0

    try {
      // 创建同步任务记录
      const task = await db.syncTask.create({
        data: {
          taskId: `full_sync_${Date.now()}`,
          status: SyncStatus.RUNNING,
          targetType: SyncTarget.FULL_SYNC,
          targetId: 'global',
          startedAt: new Date()
        }
      })

      try {
        // 获取所有根节点
        const rootNodes = await db.node.findMany({
          where: { type: 'GLOBAL_ROOT', isActive: true }
        })

        if (rootNodes.length === 0) {
          throw new Error('未找到根节点')
        }

        // 清空现有服务目录
        await db.serviceDirectoryEntry.deleteMany({})

        // 递归收集所有节点能力
        for (const rootNode of rootNodes) {
          const capabilities = await this.collectNodeCapabilitiesRecursive(rootNode.id)
          
          // 将能力信息写入服务目录
          for (const nodeCap of capabilities) {
            for (const capability of nodeCap.capabilities) {
              try {
                await db.serviceDirectoryEntry.create({
                  data: {
                    nodeId: nodeCap.nodeId,
                    productType: capability.productType as any,
                    serviceType: capability.serviceType as any,
                    coverage: JSON.stringify(capability.coverage),
                    endpoint: capability.endpoint,
                    version: capability.version,
                    isEnabled: nodeCap.isActive,
                    lastSyncedAt: new Date(),
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时过期
                    confidence: this.calculateConfidence(nodeCap.healthStatus, nodeCap.isActive)
                  }
                })
                entriesProcessed++
              } catch (error) {
                errors.push(`处理节点 ${nodeCap.nodeId} 的能力 ${capability.productType}-${capability.serviceType} 失败: ${error}`)
              }
            }
          }
        }

        // 更新同步任务状态
        await db.syncTask.update({
          where: { id: task.id },
          data: {
            status: SyncStatus.COMPLETED,
            completedAt: new Date(),
            duration: Date.now() - startTime,
            successCount: entriesProcessed,
            failureCount: errors.length,
            result: JSON.stringify({
              totalEntries: entriesProcessed,
              errorCount: errors.length
            })
          }
        })

        return {
          success: true,
          message: `全量同步完成，处理了 ${entriesProcessed} 个服务条目`,
          entriesProcessed,
          errors,
          duration: Date.now() - startTime
        }

      } catch (error) {
        // 更新同步任务状态为失败
        await db.syncTask.update({
          where: { id: task.id },
          data: {
            status: SyncStatus.FAILED,
            completedAt: new Date(),
            duration: Date.now() - startTime,
            failureCount: errors.length + 1,
            errorMessage: error instanceof Error ? error.message : '未知错误'
          }
        })

        throw error
      }

    } catch (error) {
      return {
        success: false,
        message: `全量同步失败: ${error instanceof Error ? error.message : '未知错误'}`,
        entriesProcessed,
        errors: [...errors, error instanceof Error ? error.message : '未知错误'],
        duration: Date.now() - startTime
      }
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * 同步指定节点
   */
  async syncNode(nodeId: string): Promise<SyncResult> {
    const startTime = Date.now()
    const errors: string[] = []
    let entriesProcessed = 0

    try {
      // 创建同步任务记录
      const task = await db.syncTask.create({
        data: {
          taskId: `node_sync_${nodeId}_${Date.now()}`,
          status: SyncStatus.RUNNING,
          targetType: SyncTarget.NODE_SYNC,
          targetId: nodeId,
          startedAt: new Date()
        }
      })

      try {
        // 收集节点能力
        const capabilities = await this.collectNodeCapabilitiesRecursive(nodeId)
        
        // 删除该节点的旧条目
        await db.serviceDirectoryEntry.deleteMany({
          where: { nodeId }
        })

        // 写入新的服务目录条目
        for (const nodeCap of capabilities) {
          for (const capability of nodeCap.capabilities) {
            try {
              await db.serviceDirectoryEntry.create({
                data: {
                  nodeId: nodeCap.nodeId,
                  productType: capability.productType as any,
                  serviceType: capability.serviceType as any,
                  coverage: JSON.stringify(capability.coverage),
                  endpoint: capability.endpoint,
                  version: capability.version,
                  isEnabled: nodeCap.isActive,
                  lastSyncedAt: new Date(),
                  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                  confidence: this.calculateConfidence(nodeCap.healthStatus, nodeCap.isActive)
                }
              })
              entriesProcessed++
            } catch (error) {
              errors.push(`处理节点 ${nodeCap.nodeId} 的能力 ${capability.productType}-${capability.serviceType} 失败: ${error}`)
            }
          }
        }

        // 更新同步任务状态
        await db.syncTask.update({
          where: { id: task.id },
          data: {
            status: SyncStatus.COMPLETED,
            completedAt: new Date(),
            duration: Date.now() - startTime,
            successCount: entriesProcessed,
            failureCount: errors.length,
            result: JSON.stringify({
              nodeId,
              totalEntries: entriesProcessed,
              errorCount: errors.length
            })
          }
        })

        return {
          success: true,
          message: `节点 ${nodeId} 同步完成，处理了 ${entriesProcessed} 个服务条目`,
          entriesProcessed,
          errors,
          duration: Date.now() - startTime
        }

      } catch (error) {
        await db.syncTask.update({
          where: { id: task.id },
          data: {
            status: SyncStatus.FAILED,
            completedAt: new Date(),
            duration: Date.now() - startTime,
            failureCount: errors.length + 1,
            errorMessage: error instanceof Error ? error.message : '未知错误'
          }
        })
        throw error
      }

    } catch (error) {
      return {
        success: false,
        message: `节点 ${nodeId} 同步失败: ${error instanceof Error ? error.message : '未知错误'}`,
        entriesProcessed,
        errors: [...errors, error instanceof Error ? error.message : '未知错误'],
        duration: Date.now() - startTime
      }
    }
  }

  /**
   * 递归收集节点能力
   */
  private async collectNodeCapabilitiesRecursive(nodeId: string): Promise<NodeCapabilities[]> {
    const results: NodeCapabilities[] = []

    try {
      // 获取当前节点信息
      const node = await db.node.findUnique({
        where: { id: nodeId },
        include: {
          capabilities: true,
          children: {
            where: { isActive: true },
            include: {
              capabilities: true
            }
          }
        }
      })

      if (!node) {
        console.warn(`节点 ${nodeId} 不存在`)
        return results
      }

      // 处理当前节点的能力
      const nodeCapabilities: ServiceCapability[] = node.capabilities
        .filter(cap => cap.isEnabled)
        .map(cap => ({
          productType: cap.productType,
          serviceType: cap.serviceType,
          endpoint: cap.endpoint || `${node.apiUrl}/api/${cap.productType.toLowerCase()}/${cap.serviceType.toLowerCase()}`,
          version: cap.version,
          coverage: node.coverage ? JSON.parse(node.coverage as string) : undefined
        }))

      if (nodeCapabilities.length > 0) {
        results.push({
          nodeId: node.id,
          nodeName: node.name,
          nodeLevel: node.level,
          isActive: node.isActive,
          healthStatus: node.healthStatus,
          capabilities: nodeCapabilities
        })
      }

      // 递归处理子节点
      for (const child of node.children) {
        const childResults = await this.collectNodeCapabilitiesRecursive(child.id)
        results.push(...childResults)
      }

      return results

    } catch (error) {
      console.error(`收集节点 ${nodeId} 能力时出错:`, error)
      return results
    }
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(healthStatus: string, isActive: boolean): number {
    if (!isActive) return 0.0
    
    switch (healthStatus) {
      case 'HEALTHY':
        return 1.0
      case 'WARNING':
        return 0.7
      case 'ERROR':
        return 0.3
      default:
        return 0.5
    }
  }

  /**
   * 获取同步状态
   */
  async getSyncStatus(taskId?: string) {
    if (taskId) {
      return await db.syncTask.findUnique({
        where: { taskId }
      })
    }

    // 获取最近的同步任务
    return await db.syncTask.findFirst({
      orderBy: { createdAt: 'desc' },
      take: 1
    })
  }

  /**
   * 清理过期条目
   */
  async cleanupExpiredEntries(): Promise<number> {
    const result = await db.serviceDirectoryEntry.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })

    return result.count
  }

  /**
   * 获取服务目录统计信息
   */
  async getDirectoryStats() {
    const [totalEntries, activeEntries, expiredEntries, byProductType, byServiceType] = await Promise.all([
      db.serviceDirectoryEntry.count(),
      db.serviceDirectoryEntry.count({ where: { isEnabled: true } }),
      db.serviceDirectoryEntry.count({ where: { expiresAt: { lt: new Date() } } }),
      
      db.serviceDirectoryEntry.groupBy({
        by: ['productType'],
        _count: { productType: true }
      }),
      
      db.serviceDirectoryEntry.groupBy({
        by: ['serviceType'],
        _count: { serviceType: true }
      })
    ])

    return {
      totalEntries,
      activeEntries,
      expiredEntries,
      byProductType: byProductType.reduce((acc, item) => {
        acc[item.productType] = item._count.productType
        return acc
      }, {} as Record<string, number>),
      byServiceType: byServiceType.reduce((acc, item) => {
        acc[item.serviceType] = item._count.serviceType
        return acc
      }, {} as Record<string, number>)
    }
  }
}