import { ServiceDirectorySync } from './service-directory-sync'
import { ServiceDirectory } from './service-directory'

interface CacheInvalidationRule {
  id: string
  name: string
  condition: 'node_change' | 'time_based' | 'confidence_drop' | 'manual'
  parameters: Record<string, any>
  enabled: boolean
  lastTriggered?: Date
  triggerCount: number
}

interface CacheUpdateStrategy {
  id: string
  name: string
  strategy: 'immediate' | 'batched' | 'scheduled'
  parameters: Record<string, any>
  enabled: boolean
}

export class CacheManager {
  private static instance: CacheManager
  private invalidationRules: CacheInvalidationRule[] = []
  private updateStrategies: CacheUpdateStrategy[] = []
  private isRunning = false

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager()
    }
    return CacheManager.instance
  }

  /**
   * 初始化缓存管理器
   */
  async initialize() {
    // 注册默认失效规则
    this.registerDefaultInvalidationRules()
    
    // 注册默认更新策略
    this.registerDefaultUpdateStrategies()
    
    // 启动后台检查
    this.startBackgroundChecks()
  }

  /**
   * 注册默认失效规则
   */
  private registerDefaultInvalidationRules() {
    this.invalidationRules = [
      {
        id: 'node_health_change',
        name: '节点健康状态变化',
        condition: 'node_change',
        parameters: {
          healthStatus: ['ERROR', 'OFFLINE'],
          checkInterval: 300000 // 5分钟检查一次
        },
        enabled: true,
        triggerCount: 0
      },
      {
        id: 'time_based_expiry',
        name: '基于时间的过期',
        condition: 'time_based',
        parameters: {
          maxAge: 24 * 60 * 60 * 1000, // 24小时
          checkInterval: 60 * 60 * 1000 // 1小时检查一次
        },
        enabled: true,
        triggerCount: 0
      },
      {
        id: 'confidence_drop',
        name: '置信度下降',
        condition: 'confidence_drop',
        parameters: {
          minConfidence: 0.3,
          checkInterval: 10 * 60 * 1000 // 10分钟检查一次
        },
        enabled: true,
        triggerCount: 0
      }
    ]
  }

  /**
   * 注册默认更新策略
   */
  private registerDefaultUpdateStrategies() {
    this.updateStrategies = [
      {
        id: 'immediate_update',
        name: '立即更新',
        strategy: 'immediate',
        parameters: {
          maxConcurrentUpdates: 3
        },
        enabled: true
      },
      {
        id: 'batched_update',
        name: '批量更新',
        strategy: 'batched',
        parameters: {
          batchSize: 10,
          batchInterval: 5 * 60 * 1000, // 5分钟
          maxBatchSize: 50
        },
        enabled: true
      },
      {
        id: 'scheduled_update',
        name: '定时更新',
        strategy: 'scheduled',
        parameters: {
          schedule: '0 */6 * * *', // 每6小时
          timezone: 'Asia/Shanghai'
        },
        enabled: true
      }
    ]
  }

  /**
   * 启动后台检查
   */
  private startBackgroundChecks() {
    if (this.isRunning) return
    
    this.isRunning = true
    
    // 每分钟检查一次失效规则
    setInterval(() => {
      this.checkInvalidationRules()
    }, 60 * 1000)

    console.log('Cache manager background checks started')
  }

  /**
   * 检查失效规则
   */
  private async checkInvalidationRules() {
    for (const rule of this.invalidationRules) {
      if (!rule.enabled) continue

      try {
        const shouldTrigger = await this.evaluateInvalidationRule(rule)
        if (shouldTrigger) {
          await this.triggerInvalidation(rule)
        }
      } catch (error) {
        console.error(`Error evaluating invalidation rule ${rule.id}:`, error)
      }
    }
  }

  /**
   * 评估失效规则
   */
  private async evaluateInvalidationRule(rule: CacheInvalidationRule): Promise<boolean> {
    const serviceDirectory = ServiceDirectory.getInstance()

    switch (rule.condition) {
      case 'node_change':
        // 检查节点健康状态变化
        const healthStatus = await serviceDirectory.getHealthStatus()
        // 这里简化处理，实际应该检查具体节点状态
        return healthStatus.healthScore < 70

      case 'time_based':
        // 检查过期条目
        const expiredCount = await serviceDirectory.cleanup()
        return expiredCount > 0

      case 'confidence_drop':
        // 检查置信度下降
        const stats = await serviceDirectory.getDirectoryStats()
        const lowConfidenceRatio = (stats.totalEntries - stats.highConfidenceEntries) / stats.totalEntries
        return lowConfidenceRatio > 0.3

      default:
        return false
    }
  }

  /**
   * 触发失效
   */
  private async triggerInvalidation(rule: CacheInvalidationRule) {
    console.log(`Triggering invalidation rule: ${rule.name}`)
    
    rule.lastTriggered = new Date()
    rule.triggerCount++

    // 根据规则类型执行相应的失效操作
    switch (rule.condition) {
      case 'node_change':
        await this.invalidateNodeEntries(rule.parameters)
        break
      case 'time_based':
        await this.invalidateExpiredEntries(rule.parameters)
        break
      case 'confidence_drop':
        await this.invalidateLowConfidenceEntries(rule.parameters)
        break
    }

    // 触发更新
    await this.triggerUpdate('immediate_update')
  }

  /**
   * 失效节点相关条目
   */
  private async invalidateNodeEntries(parameters: any) {
    const serviceDirectory = ServiceDirectory.getInstance()
    await serviceDirectory.cleanup()
  }

  /**
   * 失效过期条目
   */
  private async invalidateExpiredEntries(parameters: any) {
    const serviceDirectory = ServiceDirectory.getInstance()
    await serviceDirectory.cleanup()
  }

  /**
   * 失效低置信度条目
   */
  private async invalidateLowConfidenceEntries(parameters: any) {
    const serviceDirectory = ServiceDirectory.getInstance()
    await serviceDirectory.cleanup()
  }

  /**
   * 触发更新
   */
  private async triggerUpdate(strategyId: string) {
    const strategy = this.updateStrategies.find(s => s.id === strategyId && s.enabled)
    if (!strategy) return

    console.log(`Triggering update strategy: ${strategy.name}`)

    switch (strategy.strategy) {
      case 'immediate':
        await this.immediateUpdate(strategy.parameters)
        break
      case 'batched':
        await this.batchedUpdate(strategy.parameters)
        break
      case 'scheduled':
        await this.scheduledUpdate(strategy.parameters)
        break
    }
  }

  /**
   * 立即更新
   */
  private async immediateUpdate(parameters: any) {
    const syncService = ServiceDirectorySync.getInstance()
    try {
      await syncService.fullSync()
    } catch (error) {
      console.error('Immediate update failed:', error)
    }
  }

  /**
   * 批量更新
   */
  private async batchedUpdate(parameters: any) {
    // 简化的批量更新逻辑
    console.log('Batched update triggered (simplified implementation)')
  }

  /**
   * 定时更新
   */
  private async scheduledUpdate(parameters: any) {
    // 简化的定时更新逻辑
    console.log('Scheduled update triggered (simplified implementation)')
  }

  /**
   * 手动触发缓存失效
   */
  async manualInvalidation(nodeId?: string, productType?: string) {
    console.log(`Manual invalidation triggered for node: ${nodeId}, product: ${productType}`)
    
    // 清理相关条目
    const serviceDirectory = ServiceDirectory.getInstance()
    await serviceDirectory.cleanup()

    // 触发更新
    await this.triggerUpdate('immediate_update')
  }

  /**
   * 获取缓存状态
   */
  async getCacheStatus() {
    const serviceDirectory = ServiceDirectory.getInstance()
    const stats = await serviceDirectory.getDirectoryStats()
    const healthStatus = await serviceDirectory.getHealthStatus()

    return {
      stats,
      healthStatus,
      invalidationRules: this.invalidationRules.map(rule => ({
        id: rule.id,
        name: rule.name,
        enabled: rule.enabled,
        triggerCount: rule.triggerCount,
        lastTriggered: rule.lastTriggered
      })),
      updateStrategies: this.updateStrategies.map(strategy => ({
        id: strategy.id,
        name: strategy.name,
        enabled: strategy.enabled,
        strategy: strategy.strategy
      }))
    }
  }

  /**
   * 更新失效规则
   */
  async updateInvalidationRule(ruleId: string, updates: Partial<CacheInvalidationRule>) {
    const rule = this.invalidationRules.find(r => r.id === ruleId)
    if (!rule) {
      throw new Error(`Invalidation rule not found: ${ruleId}`)
    }

    Object.assign(rule, updates)
    console.log(`Invalidation rule updated: ${ruleId}`)
  }

  /**
   * 更新更新策略
   */
  async updateUpdateStrategy(strategyId: string, updates: Partial<CacheUpdateStrategy>) {
    const strategy = this.updateStrategies.find(s => s.id === strategyId)
    if (!strategy) {
      throw new Error(`Update strategy not found: ${strategyId}`)
    }

    Object.assign(strategy, updates)
    console.log(`Update strategy updated: ${strategyId}`)
  }

  /**
   * 停止缓存管理器
   */
  stop() {
    this.isRunning = false
    console.log('Cache manager stopped')
  }
}