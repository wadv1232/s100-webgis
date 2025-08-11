import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 告警配置管理
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('alertId')
    const severity = searchParams.get('severity')
    const enabled = searchParams.get('enabled')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 构建查询条件
    const whereClause: any = {}
    if (alertId) whereClause.id = alertId
    if (severity) whereClause.severity = severity
    if (enabled !== null) whereClause.enabled = enabled === 'true'

    const [alerts, total] = await Promise.all([
      db.alertRule.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.alertRule.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: {
        alerts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    })

  } catch (error) {
    console.error('获取告警配置失败:', error)
    return NextResponse.json(
      { success: false, error: '获取告警配置失败' },
      { status: 500 }
    )
  }
}

// 创建告警规则
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      severity,
      metric,
      condition,
      threshold,
      duration,
      enabled = true,
      notificationChannels = []
    } = body

    // 验证必填字段
    if (!name || !severity || !metric || !condition || !threshold) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段: name, severity, metric, condition, threshold' },
        { status: 400 }
      )
    }

    // 验证严重程度
    const validSeverities = ['CRITICAL', 'WARNING', 'INFO']
    if (!validSeverities.includes(severity)) {
      return NextResponse.json(
        { success: false, error: `无效的严重程度，支持的类型: ${validSeverities.join(', ')}` },
        { status: 400 }
      )
    }

    // 验证指标类型
    const validMetrics = [
      'CPU_USAGE', 'MEMORY_USAGE', 'DISK_USAGE', 'RESPONSE_TIME',
      'ERROR_RATE', 'NODE_HEALTH', 'SERVICE_UPTIME', 'REQUEST_RATE'
    ]
    if (!validMetrics.includes(metric)) {
      return NextResponse.json(
        { success: false, error: `无效的指标类型，支持的类型: ${validMetrics.join(', ')}` },
        { status: 400 }
      )
    }

    // 验证条件类型
    const validConditions = ['GREATER_THAN', 'LESS_THAN', 'EQUALS', 'NOT_EQUALS']
    if (!validConditions.includes(condition)) {
      return NextResponse.json(
        { success: false, error: `无效的条件类型，支持的类型: ${validConditions.join(', ')}` },
        { status: 400 }
      )
    }

    // 创建告警规则
    const alertRule = await db.alertRule.create({
      data: {
        name,
        description: description || '',
        severity,
        metric,
        condition,
        threshold: parseFloat(threshold.toString()),
        duration: duration ? parseInt(duration.toString()) : null,
        enabled,
        notificationChannels: notificationChannels || []
      }
    })

    // 如果启用，启动监控
    if (enabled) {
      startAlertMonitoring(alertRule.id).catch(error => {
        console.error('启动告警监控失败:', error)
      })
    }

    return NextResponse.json({
      success: true,
      message: '告警规则创建成功',
      data: {
        alertRule,
        monitoringStarted: enabled
      }
    })

  } catch (error) {
    console.error('创建告警规则失败:', error)
    return NextResponse.json(
      { success: false, error: '创建告警规则失败' },
      { status: 500 }
    )
  }
}

// 更新告警规则
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertId, updates } = body

    if (!alertId || !updates) {
      return NextResponse.json(
        { success: false, error: '缺少必填字段: alertId, updates' },
        { status: 400 }
      )
    }

    // 检查告警规则是否存在
    const existingRule = await db.alertRule.findUnique({
      where: { id: alertId }
    })

    if (!existingRule) {
      return NextResponse.json(
        { success: false, error: '告警规则不存在' },
        { status: 404 }
      )
    }

    // 更新告警规则
    const updatedRule = await db.alertRule.update({
      where: { id: alertId },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })

    // 如果启用了监控，重新启动
    if (updatedRule.enabled) {
      restartAlertMonitoring(alertId).catch(error => {
        console.error('重启告警监控失败:', error)
      })
    }

    return NextResponse.json({
      success: true,
      message: '告警规则更新成功',
      data: updatedRule
    })

  } catch (error) {
    console.error('更新告警规则失败:', error)
    return NextResponse.json(
      { success: false, error: '更新告警规则失败' },
      { status: 500 }
    )
  }
}

// 删除告警规则
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const alertId = searchParams.get('alertId')

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: '缺少必填参数: alertId' },
        { status: 400 }
      )
    }

    // 检查告警规则是否存在
    const existingRule = await db.alertRule.findUnique({
      where: { id: alertId }
    })

    if (!existingRule) {
      return NextResponse.json(
        { success: false, error: '告警规则不存在' },
        { status: 404 }
      )
    }

    // 停止监控
    await stopAlertMonitoring(alertId)

    // 删除告警规则
    await db.alertRule.delete({
      where: { id: alertId }
    })

    return NextResponse.json({
      success: true,
      message: '告警规则删除成功'
    })

  } catch (error) {
    console.error('删除告警规则失败:', error)
    return NextResponse.json(
      { success: false, error: '删除告警规则失败' },
      { status: 500 }
    )
  }
}

// 启动告警监控
async function startAlertMonitoring(alertRuleId: string) {
  try {
    const alertRule = await db.alertRule.findUnique({
      where: { id: alertRuleId }
    })

    if (!alertRule || !alertRule.enabled) return

    // 在实际项目中，这里应该启动一个定时任务或事件监听器
    console.log(`启动告警监控: ${alertRule.name}`)

    // 模拟监控过程
    setInterval(async () => {
      await checkAlertCondition(alertRuleId)
    }, 60000) // 每分钟检查一次

  } catch (error) {
    console.error('启动告警监控失败:', error)
  }
}

// 重启告警监控
async function restartAlertMonitoring(alertRuleId: string) {
  await stopAlertMonitoring(alertRuleId)
  await startAlertMonitoring(alertRuleId)
}

// 停止告警监控
async function stopAlertMonitoring(alertRuleId: string) {
  // 在实际项目中，这里应该停止相关的定时任务或事件监听器
  console.log(`停止告警监控: ${alertRuleId}`)
}

// 检查告警条件
async function checkAlertCondition(alertRuleId: string) {
  try {
    const alertRule = await db.alertRule.findUnique({
      where: { id: alertRuleId }
    })

    if (!alertRule || !alertRule.enabled) return

    // 获取当前指标值
    const currentValue = await getMetricValue(alertRule.metric)

    // 检查条件
    let triggered = false
    switch (alertRule.condition) {
      case 'GREATER_THAN':
        triggered = currentValue > alertRule.threshold
        break
      case 'LESS_THAN':
        triggered = currentValue < alertRule.threshold
        break
      case 'EQUALS':
        triggered = Math.abs(currentValue - alertRule.threshold) < 0.01
        break
      case 'NOT_EQUALS':
        triggered = Math.abs(currentValue - alertRule.threshold) >= 0.01
        break
    }

    if (triggered) {
      // 触发告警
      await triggerAlert(alertRule, currentValue)
    }

  } catch (error) {
    console.error('检查告警条件失败:', error)
  }
}

// 获取指标值
async function getMetricValue(metric: string): Promise<number> {
  // 模拟获取指标值 - 实际项目中应该从监控系统获取
  switch (metric) {
    case 'CPU_USAGE':
      return Math.random() * 100
    case 'MEMORY_USAGE':
      return Math.random() * 100
    case 'DISK_USAGE':
      return Math.random() * 100
    case 'RESPONSE_TIME':
      return Math.random() * 1000
    case 'ERROR_RATE':
      return Math.random() * 10
    case 'NODE_HEALTH':
      return Math.random() * 100
    case 'SERVICE_UPTIME':
      return Math.random() * 100
    case 'REQUEST_RATE':
      return Math.random() * 2000
    default:
      return 0
  }
}

// 触发告警
async function triggerAlert(alertRule: any, currentValue: number) {
  try {
    // 检查是否已经存在未解决的相同告警
    const existingAlert = await db.alert.findFirst({
      where: {
        ruleId: alertRule.id,
        status: 'ACTIVE'
      }
    })

    if (existingAlert) return // 避免重复告警

    // 创建告警记录
    const alert = await db.alert.create({
      data: {
        ruleId: alertRule.id,
        severity: alertRule.severity,
        title: alertRule.name,
        message: `${alertRule.name}: ${alertRule.metric} ${alertRule.condition} ${alertRule.threshold}, 当前值: ${currentValue.toFixed(2)}`,
        currentValue,
        threshold: alertRule.threshold,
        status: 'ACTIVE'
      }
    })

    // 发送通知
    await sendAlertNotifications(alert, alertRule.notificationChannels)

    console.log(`告警触发: ${alertRule.name}, 当前值: ${currentValue}`)

  } catch (error) {
    console.error('触发告警失败:', error)
  }
}

// 发送告警通知
async function sendAlertNotifications(alert: any, channels: string[]) {
  try {
    for (const channel of channels) {
      switch (channel) {
        case 'EMAIL':
          await sendEmailNotification(alert)
          break
        case 'SMS':
          await sendSMSNotification(alert)
          break
        case 'WEBHOOK':
          await sendWebhookNotification(alert)
          break
        case 'SLACK':
          await sendSlackNotification(alert)
          break
        default:
          console.warn(`不支持的通知渠道: ${channel}`)
      }
    }
  } catch (error) {
    console.error('发送告警通知失败:', error)
  }
}

// 发送邮件通知
async function sendEmailNotification(alert: any) {
  // 模拟发送邮件
  console.log(`发送邮件通知: ${alert.title}`)
}

// 发送短信通知
async function sendSMSNotification(alert: any) {
  // 模拟发送短信
  console.log(`发送短信通知: ${alert.title}`)
}

// 发送Webhook通知
async function sendWebhookNotification(alert: any) {
  // 模拟发送Webhook
  console.log(`发送Webhook通知: ${alert.title}`)
}

// 发送Slack通知
async function sendSlackNotification(alert: any) {
  // 模拟发送Slack消息
  console.log(`发送Slack通知: ${alert.title}`)
}