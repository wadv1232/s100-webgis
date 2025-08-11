import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 获取服务的部署历史
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceId = params.id

    // 获取服务的部署历史
    const deployments = await db.serviceDeployment.findMany({
      where: { serviceId },
      include: {
        dataset: true,
        service: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ deployments })
  } catch (error) {
    console.error('Error fetching service deployments:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// 创建新的部署
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceId = params.id
    const { datasetId, version, isAtomic = true, rollbackEnabled = true, deploymentConfig } = await request.json()

    // 验证服务存在
    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: { dataset: true }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // 验证数据集存在
    const dataset = await db.dataset.findUnique({
      where: { id: datasetId }
    })

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    // 生成部署ID
    const deploymentId = `deploy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // 创建部署记录
    const deployment = await db.serviceDeployment.create({
      data: {
        deploymentId,
        serviceId,
        datasetId,
        version,
        isAtomic,
        rollbackEnabled,
        deploymentConfig: JSON.stringify(deploymentConfig),
        previousVersion: service.version,
        status: 'PENDING'
      },
      include: {
        dataset: true,
        service: true
      }
    })

    // 启动部署任务
    await startDeployment(deployment.id)

    return NextResponse.json({ deployment })
  } catch (error) {
    console.error('Error creating deployment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// 启动部署任务
async function startDeployment(deploymentId: string) {
  try {
    // 更新部署状态为部署中
    await db.serviceDeployment.update({
      where: { id: deploymentId },
      data: { 
        status: 'DEPLOYING',
        startedAt: new Date()
      }
    })

    // 模拟部署过程
    await simulateDeployment(deploymentId)

    // 更新服务版本
    const deployment = await db.serviceDeployment.findUnique({
      where: { id: deploymentId },
      include: { service: true }
    })

    if (deployment) {
      await db.service.update({
        where: { id: deployment.serviceId },
        data: {
          version: deployment.version,
          deploymentId: deployment.deploymentId,
          updatedAt: new Date()
        }
      })
    }

    // 更新部署状态为已部署
    await db.serviceDeployment.update({
      where: { id: deploymentId },
      data: { 
        status: 'DEPLOYED',
        completedAt: new Date(),
        duration: Date.now() - (deployment?.startedAt?.getTime() || Date.now())
      }
    })
  } catch (error) {
    console.error('Deployment failed:', error)
    
    // 更新部署状态为失败
    await db.serviceDeployment.update({
      where: { id: deploymentId },
      data: { 
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      }
    })
  }
}

// 模拟部署过程
async function simulateDeployment(deploymentId: string) {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000) // 模拟2秒部署时间
  })
}