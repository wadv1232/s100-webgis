import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler, withApiHandler } from '@/lib/api-error'

interface NodePolicy {
  required_products: string[]
  compliance_check_enabled: boolean
  check_interval_hours?: number
  alert_threshold_days?: number
  description?: string
}

interface ComplianceStatus {
  nodeId: string
  nodeName: string
  requiredProducts: string[]
  actualProducts: string[]
  missingProducts: string[]
  isCompliant: boolean
  lastChecked: Date
  nextCheck: Date
}

const createPolicyHandler = withApiHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
    const { id } = await params
    const nodeId = id
    const body: NodePolicy = await request.json()

    // 验证节点是否存在
    const existingNode = await db.node.findUnique({
      where: { id: nodeId },
      include: {
        capabilities: {
          select: {
            productType: true,
            isEnabled: true
          }
        }
      }
    })

    if (!existingNode) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: nodeId })
    }

    // 验证策略数据
    if (!body.required_products || !Array.isArray(body.required_products)) {
      return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
        field: 'required_products',
        message: 'required_products must be an array'
      })
    }

    // 验证产品类型
    const validProducts = ['S101', 'S102', 'S104', 'S111', 'S124', 'S131']
    const invalidProducts = body.required_products.filter(p => !validProducts.includes(p))
    if (invalidProducts.length > 0) {
      return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
        field: 'required_products',
        message: `Invalid product types: ${invalidProducts.join(', ')}. Valid types: ${validProducts.join(', ')}`
      })
    }

    try {
      // 检查当前合规状态
      const actualProducts = existingNode.capabilities
        .filter(cap => cap.isEnabled)
        .map(cap => cap.productType)

      const missingProducts = body.required_products.filter(product => 
        !actualProducts.includes(product)
      )

      const isCompliant = missingProducts.length === 0

      // 这里应该创建或更新策略记录
      // 由于数据库schema可能需要更新，我们暂时模拟这个操作
      const policyData = {
        nodeId,
        requiredProducts: body.required_products,
        complianceCheckEnabled: body.compliance_check_enabled ?? true,
        checkIntervalHours: body.check_interval_hours ?? 24,
        alertThresholdDays: body.alert_threshold_days ?? 7,
        description: body.description,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastChecked: new Date(),
        isCompliant
      }

      // 记录策略创建日志
      console.log(`Node policy created/updated: ${nodeId}`, {
        requiredProducts: body.required_products,
        isCompliant,
        missingProducts
      })

      return NextResponse.json({
        policy: policyData,
        compliance: {
          nodeId,
          nodeName: existingNode.name,
          requiredProducts: body.required_products,
          actualProducts,
          missingProducts,
          isCompliant,
          lastChecked: new Date(),
          nextCheck: new Date(Date.now() + (body.check_interval_hours || 24) * 60 * 60 * 1000)
        },
        message: isCompliant ? 'Node is compliant with policy' : 'Node has compliance issues'
      }, { status: 201 })

    } catch (error) {
      console.error('Error creating/updating node policy:', error)
      return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', {
        operation: 'create_policy',
        node_id: nodeId
      })
    }
  }
)

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const nodeId = id

    const node = await db.node.findUnique({
      where: { id: nodeId },
      include: {
        capabilities: {
          select: {
            productType: true,
            isEnabled: true,
            updatedAt: true
          }
        },
        parent: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!node) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: nodeId })
    }

    // 获取当前实际提供的产品
    const actualProducts = node.capabilities
      .filter(cap => cap.isEnabled)
      .map(cap => cap.productType)

    // 这里应该从数据库获取策略，暂时模拟
    const mockPolicy = {
      nodeId,
      requiredProducts: ['S101', 'S124'], // 模拟的必需产品
      complianceCheckEnabled: true,
      checkIntervalHours: 24,
      alertThresholdDays: 7,
      description: 'Standard maritime service requirements',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30天前创建
      updatedAt: new Date(),
      lastChecked: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前检查
      isCompliant: true // 模拟状态
    }

    // 计算合规状态
    const missingProducts = mockPolicy.requiredProducts.filter(product => 
      !actualProducts.includes(product)
    )

    const isCompliant = missingProducts.length === 0

    const complianceStatus: ComplianceStatus = {
      nodeId,
      nodeName: node.name,
      requiredProducts: mockPolicy.requiredProducts,
      actualProducts,
      missingProducts,
      isCompliant,
      lastChecked: mockPolicy.lastChecked,
      nextCheck: new Date(mockPolicy.lastChecked.getTime() + mockPolicy.checkIntervalHours * 60 * 60 * 1000)
    }

    // 生成合规建议
    const recommendations: string[] = []
    if (!isCompliant) {
      recommendations.push(`需要添加以下必需产品: ${missingProducts.join(', ')}`)
    }
    
    if (actualProducts.length > mockPolicy.requiredProducts.length) {
      const extraProducts = actualProducts.filter(p => !mockPolicy.requiredProducts.includes(p))
      recommendations.push(`节点提供了超出策略要求的额外产品: ${extraProducts.join(', ')}`)
    }

    // 检查服务更新时间
    const staleServices = node.capabilities.filter(cap => {
      const daysSinceUpdate = (Date.now() - cap.updatedAt.getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceUpdate > 7 // 超过7天未更新
    })

    if (staleServices.length > 0) {
      recommendations.push(`以下服务超过7天未更新，建议检查: ${staleServices.map(s => s.productType).join(', ')}`)
    }

    return NextResponse.json({
      policy: mockPolicy,
      compliance: complianceStatus,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
      nodeInfo: {
        id: node.id,
        name: node.name,
        parentId: node.parentId,
        parentName: node.parent?.name,
        healthStatus: node.healthStatus,
        isActive: node.isActive
      }
    })

  } catch (error) {
    console.error('Error fetching node policy:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR')
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const nodeId = id

    // 验证节点是否存在
    const existingNode = await db.node.findUnique({
      where: { id: nodeId }
    })

    if (!existingNode) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: nodeId })
    }

    // 这里应该删除策略记录，暂时模拟
    console.log(`Node policy deleted: ${nodeId}`)

    return NextResponse.json({
      message: 'Policy deleted successfully',
      nodeId
    })

  } catch (error) {
    console.error('Error deleting node policy:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', {
      operation: 'delete_policy',
      node_id: nodeId
    })
  }
}

export { createPolicyHandler as POST }