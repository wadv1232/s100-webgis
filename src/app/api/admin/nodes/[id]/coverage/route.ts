import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiErrorHandler, withApiHandler, validateGeoJSON } from '@/lib/api-error'

interface UpdateCoverageRequest {
  coverage: {
    type: string
    coordinates: number[][][]
  }
  reason?: string
}

const updateCoverageHandler = withApiHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
    const { id } = await params
    const nodeId = id
    const body: UpdateCoverageRequest = await request.json()

    // 验证节点是否存在
    const existingNode = await db.node.findUnique({
      where: { id: nodeId }
    })

    if (!existingNode) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: nodeId })
    }

    // 验证coverage数据
    if (!body.coverage) {
      return ApiErrorHandler.createErrorResponse('MISSING_PARAMETERS', {
        required: ['coverage'],
        provided: Object.keys(body)
      })
    }

    const coverageValidation = validateGeoJSON(body.coverage)
    if (!coverageValidation.valid) {
      return ApiErrorHandler.createErrorResponse('INVALID_NODE_CONFIG', {
        field: 'coverage',
        message: coverageValidation.error
      })
    }

    try {
      // 更新节点覆盖范围
      const updatedNode = await db.node.update({
        where: { id: nodeId },
        data: {
          coverage: JSON.stringify(body.coverage),
          updatedAt: new Date()
        },
        include: {
          parent: {
            select: {
              id: true,
              name: true
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              coverage: true
            }
          }
        }
      })

      // 检查与其他节点的覆盖范围冲突
      const siblings = await db.node.findMany({
        where: {
          parentId: updatedNode.parentId,
          id: { not: nodeId },
          isActive: true
        },
        select: {
          id: true,
          name: true,
          coverage: true
        }
      })

      const conflicts: Array<{
        nodeId: string
        nodeName: string
        conflictType: 'overlap' | 'containment'
      }> = []

      siblings.forEach(sibling => {
        if (sibling.coverage) {
          try {
            const siblingCoverage = JSON.parse(sibling.coverage as string)
            // 简化的冲突检测（实际应用中需要更复杂的几何计算）
            if (hasCoverageConflict(body.coverage, siblingCoverage)) {
              conflicts.push({
                nodeId: sibling.id,
                nodeName: sibling.name,
                conflictType: 'overlap'
              })
            }
          } catch (error) {
            console.warn(`Failed to parse coverage for sibling node: ${sibling.id}`)
          }
        }
      })

      // 记录覆盖范围变更日志
      console.log(`Node coverage updated: ${nodeId}`, {
        oldCoverage: existingNode.coverage,
        newCoverage: body.coverage,
        reason: body.reason,
        conflicts: conflicts.length
      })

      return NextResponse.json({
        node: {
          id: updatedNode.id,
          name: updatedNode.name,
          coverage: body.coverage,
          updatedAt: updatedNode.updatedAt
        },
        conflicts: conflicts.length > 0 ? conflicts : undefined,
        warning: conflicts.length > 0 ? 'Coverage conflicts detected with sibling nodes' : undefined
      })

    } catch (error) {
      console.error('Error updating node coverage:', error)
      return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR', {
        operation: 'update_coverage',
        node_id: nodeId
      })
    }
  }
)

// 简化的覆盖范围冲突检测
function hasCoverageConflict(coverage1: any, coverage2: any): boolean {
  try {
    // 这里实现简化的矩形相交检查
    // 实际应用中应该使用完整的几何库如Turf.js
    if (coverage1.type === 'Polygon' && coverage2.type === 'Polygon') {
      const coords1 = coverage1.coordinates[0]
      const coords2 = coverage2.coordinates[0]

      if (coords1 && coords2) {
        const minX1 = Math.min(...coords1.map((c: number[]) => c[0]))
        const maxX1 = Math.max(...coords1.map((c: number[]) => c[0]))
        const minY1 = Math.min(...coords1.map((c: number[]) => c[1]))
        const maxY1 = Math.max(...coords1.map((c: number[]) => c[1]))

        const minX2 = Math.min(...coords2.map((c: number[]) => c[0]))
        const maxX2 = Math.max(...coords2.map((c: number[]) => c[0]))
        const minY2 = Math.min(...coords2.map((c: number[]) => c[1]))
        const maxY2 = Math.max(...coords2.map((c: number[]) => c[1]))

        // 检查矩形是否相交
        return !(maxX1 < minX2 || minX1 > maxX2 || maxY1 < minY2 || minY1 > maxY2)
      }
    }
  } catch (error) {
    console.warn('Error in coverage conflict detection:', error)
  }

  return false
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const nodeId = id

    const node = await db.node.findUnique({
      where: { id: nodeId },
      select: {
        id: true,
        name: true,
        coverage: true,
        parentId: true,
        updatedAt: true
      }
    })

    if (!node) {
      return ApiErrorHandler.createErrorResponse('NODE_NOT_FOUND', { node_id: nodeId })
    }

    let coverage = null
    if (node.coverage) {
      try {
        coverage = JSON.parse(node.coverage as string)
      } catch (error) {
        console.warn(`Failed to parse coverage for node: ${nodeId}`)
      }
    }

    // 获取相邻节点的覆盖范围信息
    const siblings = await db.node.findMany({
      where: {
        parentId: node.parentId,
        id: { not: nodeId },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        coverage: true
      }
    })

    const siblingCoverages = siblings.map(sibling => {
      let siblingCoverage = null
      if (sibling.coverage) {
        try {
          siblingCoverage = JSON.parse(sibling.coverage as string)
        } catch (error) {
          console.warn(`Failed to parse coverage for sibling node: ${sibling.id}`)
        }
      }

      return {
        nodeId: sibling.id,
        nodeName: sibling.name,
        coverage: siblingCoverage
      }
    })

    return NextResponse.json({
      node: {
        id: node.id,
        name: node.name,
        coverage,
        updatedAt: node.updatedAt
      },
      siblings: siblingCoverages
    })

  } catch (error) {
    console.error('Error fetching node coverage:', error)
    return ApiErrorHandler.createErrorResponse('INTERNAL_ERROR')
  }
}

export { updateCoverageHandler as PUT }