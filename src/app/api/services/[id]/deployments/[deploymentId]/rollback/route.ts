import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 部署回滚
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; deploymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceId = params.id
    const deploymentId = params.deploymentId

    // 获取目标部署记录
    const targetDeployment = await db.serviceDeployment.findUnique({
      where: { id: deploymentId },
      include: { service: true }
    })

    if (!targetDeployment) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 })
    }

    if (!targetDeployment.rollbackEnabled) {
      return NextResponse.json({ error: 'Rollback not enabled for this deployment' }, { status: 400 })
    }

    // 获取当前部署
    const currentDeployment = await db.serviceDeployment.findFirst({
      where: { 
        serviceId,
        status: 'DEPLOYED'
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!currentDeployment) {
      return NextResponse.json({ error: 'No current deployment found' }, { status: 404 })
    }

    // 创建回滚部署记录
    const rollbackDeployment = await db.serviceDeployment.create({
      data: {
        deploymentId: `rollback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        serviceId,
        datasetId: targetDeployment.datasetId,
        version: targetDeployment.version,
        status: 'ROLLING_BACK',
        previousVersion: currentDeployment.version,
        isAtomic: true,
        rollbackEnabled: false, // 回滚部署不允许再次回滚
        deploymentConfig: targetDeployment.deploymentConfig,
        startedAt: new Date()
      }
    })

    // 启动回滚任务
    await startRollback(rollbackDeployment.id, targetDeployment)

    return NextResponse.json({ deployment: rollbackDeployment })
  } catch (error) {
    console.error('Error starting rollback:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// 启动回滚任务
async function startRollback(rollbackDeploymentId: string, targetDeployment: any) {
  try {
    // 模拟回滚过程
    await simulateRollback()

    // 更新服务版本
    await db.service.update({
      where: { id: targetDeployment.serviceId },
      data: {
        version: targetDeployment.version,
        deploymentId: targetDeployment.deploymentId,
        updatedAt: new Date()
      }
    })

    // 更新回滚部署状态
    await db.serviceDeployment.update({
      where: { id: rollbackDeploymentId },
      data: { 
        status: 'ROLLED_BACK',
        completedAt: new Date(),
        duration: Date.now() - new Date().getTime() + 2000 // 模拟2秒回滚时间
      }
    })
  } catch (error) {
    console.error('Rollback failed:', error)
    
    // 更新回滚部署状态为失败
    await db.serviceDeployment.update({
      where: { id: rollbackDeploymentId },
      data: { 
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      }
    })
  }
}

// 模拟回滚过程
async function simulateRollback() {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000) // 模拟2秒回滚时间
  })
}