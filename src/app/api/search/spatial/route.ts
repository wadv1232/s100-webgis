import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 地理空间搜索
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bbox = searchParams.get('bbox')
    const productTypes = searchParams.get('productTypes')?.split(',').filter(Boolean)
    const serviceTypes = searchParams.get('serviceTypes')?.split(',').filter(Boolean)
    const nodeId = searchParams.get('nodeId')
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // 验证边界框参数
    let bboxCoords: number[] | null = null
    if (bbox) {
      const coords = bbox.split(',').map(Number)
      if (coords.length !== 4 || coords.some(isNaN)) {
        return NextResponse.json(
          { success: false, error: '无效的边界框格式，应该是: minX,minY,maxX,maxY' },
          { status: 400 }
        )
      }
      bboxCoords = coords
    }

    // 构建查询条件
    let whereClause: any = {
      isEnabled: true
    }

    if (nodeId) {
      whereClause.nodeId = nodeId
    }

    if (productTypes && productTypes.length > 0) {
      whereClause.productType = { in: productTypes }
    }

    if (serviceTypes && serviceTypes.length > 0) {
      whereClause.serviceType = { in: serviceTypes }
    }

    // 获取基础能力数据
    const capabilities = await db.capability.findMany({
      where: whereClause,
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true,
            level: true,
            coverage: true,
            healthStatus: true
          }
        },
        dataset: {
          select: {
            id: true,
            name: true,
            description: true,
            productType: true,
            status: true,
            coverage: true,
            metadata: true
          }
        }
      },
      orderBy: [
        { node: { level: 'asc' } },
        { productType: 'asc' },
        { serviceType: 'asc' }
      ],
      take: limit + 100 // 先获取更多数据用于空间过滤
    })

    // 空间过滤
    let filteredCapabilities = capabilities
    if (bboxCoords) {
      filteredCapabilities = capabilities.filter(capability => {
        const nodeCoverage = capability.node.coverage
        const datasetCoverage = capability.dataset?.coverage

        // 检查节点或数据集覆盖范围是否与查询边界框相交
        return checkBboxIntersection(bboxCoords, nodeCoverage) || 
               checkBboxIntersection(bboxCoords, datasetCoverage)
      })
    }

    // 文本搜索过滤
    if (query) {
      const searchTerms = query.toLowerCase().split(' ').filter(Boolean)
      filteredCapabilities = filteredCapabilities.filter(capability => {
        const searchableText = [
          capability.node.name,
          capability.dataset?.name,
          capability.dataset?.description,
          capability.productType,
          capability.serviceType
        ].filter(Boolean).join(' ').toLowerCase()

        return searchTerms.every(term => searchableText.includes(term))
      })
    }

    // 分页处理
    const paginatedResults = filteredCapabilities.slice(offset, offset + limit)

    // 生成搜索结果摘要
    const summary = {
      totalResults: filteredCapabilities.length,
      returnedResults: paginatedResults.length,
      query: {
        bbox: bboxCoords,
        productTypes,
        serviceTypes,
        nodeId,
        query,
        limit,
        offset
      },
      filters: {
        appliedFilters: [
          ...(bboxCoords ? ['spatial'] : []),
          ...(productTypes ? ['productTypes'] : []),
          ...(serviceTypes ? ['serviceTypes'] : []),
          ...(nodeId ? ['nodeId'] : []),
          ...(query ? ['text'] : [])
        ]
      }
    }

    // 按相关性排序
    const sortedResults = sortSearchResults(paginatedResults, {
      bbox: bboxCoords,
      query,
      priorityWeights: {
        healthStatus: 0.3,
        nodeLevel: 0.2,
        matchScore: 0.5
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        results: sortedResults,
        summary,
        searchTime: Date.now()
      }
    })

  } catch (error) {
    console.error('地理空间搜索失败:', error)
    return NextResponse.json(
      { success: false, error: '地理空间搜索失败' },
      { status: 500 }
    )
  }
}

// 检查边界框相交
function checkBboxIntersection(bbox1: number[], bbox2: any): boolean {
  if (!bbox2) return false

  try {
    let coords2: number[]
    if (typeof bbox2 === 'string') {
      coords2 = bbox2.split(',').map(Number)
    } else if (Array.isArray(bbox2)) {
      coords2 = bbox2
    } else {
      return false
    }

    if (coords2.length !== 4 || coords2.some(isNaN)) return false

    const [minX1, minY1, maxX1, maxY1] = bbox1
    const [minX2, minY2, maxX2, maxY2] = coords2

    // 检查是否相交
    return !(maxX1 < minX2 || minX1 > maxX2 || maxY1 < minY2 || minY1 > maxY2)
  } catch {
    return false
  }
}

// 搜索结果排序
function sortSearchResults(results: any[], params: { bbox?: number[]; query?: string; priorityWeights: any }) {
  return results.sort((a, b) => {
    let scoreA = 0
    let scoreB = 0

    // 健康状态评分
    const healthScore = (status: string) => {
      switch (status) {
        case 'HEALTHY': return 1.0
        case 'WARNING': return 0.7
        case 'ERROR': return 0.3
        case 'OFFLINE': return 0.1
        default: return 0.5
      }
    }

    scoreA += healthScore(a.node.healthStatus) * params.priorityWeights.healthStatus
    scoreB += healthScore(b.node.healthStatus) * params.priorityWeights.healthStatus

    // 节点层级评分
    const levelScore = (level: number) => {
      switch (level) {
        case 0: return 1.0 // GLOBAL_ROOT
        case 1: return 0.8 // NATIONAL
        case 2: return 0.6 // REGIONAL
        case 3: return 0.4 // LEAF
        default: return 0.5
      }
    }

    scoreA += levelScore(a.node.level) * params.priorityWeights.nodeLevel
    scoreB += levelScore(b.node.level) * params.priorityWeights.nodeLevel

    // 文本匹配评分
    if (params.query) {
      const queryTerms = params.query.toLowerCase().split(' ')
      const matchScore = (text: string) => {
        if (!text) return 0
        const lowerText = text.toLowerCase()
        const matchCount = queryTerms.reduce((count, term) => {
          return count + (lowerText.includes(term) ? 1 : 0)
        }, 0)
        return matchCount / queryTerms.length
      }

      const textA = [a.node.name, a.dataset?.name, a.dataset?.description].filter(Boolean).join(' ')
      const textB = [b.node.name, b.dataset?.name, b.dataset?.description].filter(Boolean).join(' ')

      scoreA += matchScore(textA) * params.priorityWeights.matchScore
      scoreB += matchScore(textB) * params.priorityWeights.matchScore
    }

    // 空间相关性评分
    if (params.bbox) {
      // 简化的空间相关性计算
      const spatialScore = (capability: any) => {
        const coverage = capability.node.coverage || capability.dataset?.coverage
        if (!coverage) return 0.5
        
        // 这里应该计算更精确的空间相关性
        // 简化处理：如果有覆盖范围就给高分
        return 0.8
      }

      scoreA += spatialScore(a) * 0.2
      scoreB += spatialScore(b) * 0.2
    }

    return scoreB - scoreA // 降序排列
  })
}