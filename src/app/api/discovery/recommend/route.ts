import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 服务推荐
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const context = searchParams.get('context')
    const productTypes = searchParams.get('productTypes')?.split(',').filter(Boolean)
    const serviceTypes = searchParams.get('serviceTypes')?.split(',').filter(Boolean)
    const bbox = searchParams.get('bbox')
    const limit = parseInt(searchParams.get('limit') || '10')

    // 解析边界框
    let bboxCoords: number[] | null = null
    if (bbox) {
      const coords = bbox.split(',').map(Number)
      if (coords.length === 4 && !coords.some(isNaN)) {
        bboxCoords = coords
      }
    }

    // 获取用户历史使用记录（如果提供了userId）
    let userHistory: any[] = []
    if (userId) {
      userHistory = await getUserServiceHistory(userId)
    }

    // 获取推荐候选服务
    const candidates = await getRecommendationCandidates({
      productTypes,
      serviceTypes,
      bbox: bboxCoords,
      context
    })

    // 计算推荐分数
    const recommendations = await calculateRecommendationScores(candidates, {
      userHistory,
      context,
      bbox: bboxCoords
    })

    // 排序并限制结果数量
    const sortedRecommendations = recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)

    // 生成推荐解释
    const recommendationsWithExplanations = await generateRecommendationExplanations(
      sortedRecommendations,
      { userHistory, context }
    )

    return NextResponse.json({
      success: true,
      data: {
        recommendations: recommendationsWithExplanations,
        metadata: {
          totalCandidates: candidates.length,
          returnedRecommendations: recommendationsWithExplanations.length,
          context: {
            userId,
            context,
            productTypes,
            serviceTypes,
            bbox: bboxCoords
          },
          generatedAt: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('服务推荐失败:', error)
    return NextResponse.json(
      { success: false, error: '服务推荐失败' },
      { status: 500 }
    )
  }
}

// 获取用户服务使用历史
async function getUserServiceHistory(userId: string) {
  try {
    // 这里应该查询用户的服务访问日志
    // 简化实现，返回模拟数据
    return [
      { serviceType: 'WMS', productType: 'S102', accessCount: 15, lastAccess: new Date() },
      { serviceType: 'WCS', productType: 'S102', accessCount: 8, lastAccess: new Date() },
      { serviceType: 'WFS', productType: 'S101', accessCount: 5, lastAccess: new Date() }
    ]
  } catch (error) {
    console.error('获取用户历史记录失败:', error)
    return []
  }
}

// 获取推荐候选服务
async function getRecommendationCandidates(params: {
  productTypes?: string[]
  serviceTypes?: string[]
  bbox?: number[]
  context?: string
}) {
  const whereClause: any = {
    isEnabled: true,
    node: {
      healthStatus: 'HEALTHY'
    }
  }

  if (params.productTypes && params.productTypes.length > 0) {
    whereClause.productType = { in: params.productTypes }
  }

  if (params.serviceTypes && params.serviceTypes.length > 0) {
    whereClause.serviceType = { in: params.serviceTypes }
  }

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
          metadata: true,
          publishedAt: true
        }
      }
    },
    orderBy: [
      { node: { level: 'asc' } },
      { productType: 'asc' },
      { serviceType: 'asc' }
    ],
    take: 100 // 限制候选数量
  })

  // 如果有边界框，进行空间过滤
  let filteredCapabilities = capabilities
  if (params.bbox) {
    filteredCapabilities = capabilities.filter(capability => {
      const nodeCoverage = capability.node.coverage
      const datasetCoverage = capability.dataset?.coverage
      return checkBboxIntersection(params.bbox!, nodeCoverage) || 
             checkBboxIntersection(params.bbox!, datasetCoverage)
    })
  }

  // 根据上下文进一步过滤
  if (params.context) {
    const contextTerms = params.context.toLowerCase()
    filteredCapabilities = filteredCapabilities.filter(capability => {
      const searchableText = [
        capability.node.name,
        capability.dataset?.name,
        capability.dataset?.description,
        capability.productType,
        capability.serviceType
      ].filter(Boolean).join(' ').toLowerCase()

      return searchableText.includes(contextTerms)
    })
  }

  return filteredCapabilities
}

// 计算推荐分数
async function calculateRecommendationScores(candidates: any[], params: {
  userHistory: any[]
  context?: string
  bbox?: number[]
}) {
  const recommendations = []

  for (const candidate of candidates) {
    let score = 0
    const factors: any = {}

    // 基础质量分数
    const qualityScore = calculateQualityScore(candidate)
    score += qualityScore * 0.3
    factors.quality = qualityScore

    // 用户偏好分数
    if (params.userHistory.length > 0) {
      const preferenceScore = calculatePreferenceScore(candidate, params.userHistory)
      score += preferenceScore * 0.4
      factors.preference = preferenceScore
    }

    // 上下文匹配分数
    if (params.context) {
      const contextScore = calculateContextScore(candidate, params.context)
      score += contextScore * 0.2
      factors.context = contextScore
    }

    // 空间相关性分数
    if (params.bbox) {
      const spatialScore = calculateSpatialScore(candidate, params.bbox)
      score += spatialScore * 0.1
      factors.spatial = spatialScore
    }

    recommendations.push({
      capability: candidate,
      score: Math.round(score * 100) / 100,
      factors,
      recommendationId: generateRecommendationId(candidate)
    })
  }

  return recommendations
}

// 计算质量分数
function calculateQualityScore(capability: any) {
  let score = 0

  // 节点健康状态
  switch (capability.node.healthStatus) {
    case 'HEALTHY': score += 0.4; break
    case 'WARNING': score += 0.2; break
    case 'ERROR': score += 0.05; break
    default: score += 0.1; break
  }

  // 节点层级
  switch (capability.node.level) {
    case 0: score += 0.3; break // GLOBAL_ROOT
    case 1: score += 0.25; break // NATIONAL
    case 2: score += 0.2; break // REGIONAL
    case 3: score += 0.15; break // LEAF
    default: score += 0.1; break
  }

  // 数据集状态
  if (capability.dataset?.status === 'PUBLISHED') {
    score += 0.2
  } else if (capability.dataset?.status === 'PROCESSING') {
    score += 0.1
  }

  // 发布时间（越新越好）
  if (capability.dataset?.publishedAt) {
    const daysSincePublished = (Date.now() - new Date(capability.dataset.publishedAt).getTime()) / (1000 * 60 * 60 * 24)
    if (daysSincePublished < 30) score += 0.1
    else if (daysSincePublished < 90) score += 0.05
  }

  return Math.min(score, 1.0)
}

// 计算用户偏好分数
function calculatePreferenceScore(capability: any, userHistory: any[]) {
  let score = 0

  // 基于产品类型偏好
  const productPreferences = userHistory.filter(h => h.productType === capability.productType)
  if (productPreferences.length > 0) {
    const totalAccess = productPreferences.reduce((sum, h) => sum + h.accessCount, 0)
    score += Math.min(totalAccess / 20, 1.0) * 0.6
  }

  // 基于服务类型偏好
  const servicePreferences = userHistory.filter(h => h.serviceType === capability.serviceType)
  if (servicePreferences.length > 0) {
    const totalAccess = servicePreferences.reduce((sum, h) => sum + h.accessCount, 0)
    score += Math.min(totalAccess / 20, 1.0) * 0.4
  }

  return Math.min(score, 1.0)
}

// 计算上下文匹配分数
function calculateContextScore(capability: any, context: string) {
  const contextTerms = context.toLowerCase().split(' ').filter(Boolean)
  if (contextTerms.length === 0) return 0

  const searchableText = [
    capability.node.name,
    capability.dataset?.name,
    capability.dataset?.description,
    capability.productType,
    capability.serviceType
  ].filter(Boolean).join(' ').toLowerCase()

  const matchCount = contextTerms.reduce((count, term) => {
    return count + (searchableText.includes(term) ? 1 : 0)
  }, 0)

  return matchCount / contextTerms.length
}

// 计算空间相关性分数
function calculateSpatialScore(capability: any, bbox: number[]) {
  const coverage = capability.node.coverage || capability.dataset?.coverage
  if (!coverage) return 0.5

  // 简化的空间相关性计算
  // 实际项目中应该使用更精确的空间分析
  return checkBboxIntersection(bbox, coverage) ? 1.0 : 0.3
}

// 生成推荐解释
async function generateRecommendationExplanations(recommendations: any[], params: {
  userHistory: any[]
  context?: string
}) {
  return recommendations.map(rec => {
    const explanations: string[] = []

    // 基于质量的解释
    if (rec.factors.quality > 0.7) {
      explanations.push('高质量服务，节点状态良好')
    } else if (rec.factors.quality > 0.5) {
      explanations.push('服务质量较好')
    }

    // 基于用户偏好的解释
    if (rec.factors.preference > 0.5) {
      const productType = rec.capability.productType
      const serviceType = rec.capability.serviceType
      explanations.push(`基于您对${productType} ${serviceType}服务的历史使用偏好`)
    }

    // 基于上下文的解释
    if (rec.factors.context > 0.5) {
      explanations.push(`与您当前的"${params.context}"需求高度匹配`)
    }

    // 基于空间相关性的解释
    if (rec.factors.spatial > 0.7) {
      explanations.push('服务覆盖范围与您的目标区域高度吻合')
    }

    return {
      ...rec,
      explanations: explanations.length > 0 ? explanations : ['综合推荐'],
      confidence: calculateConfidence(rec)
    }
  })
}

// 计算推荐置信度
function calculateConfidence(recommendation: any) {
  const { factors } = recommendation
  
  // 基于各因素的稳定性计算置信度
  const factorsVariance = Object.values(factors).reduce((sum: number, val: any) => {
    return sum + Math.pow(val - 0.5, 2)
  }, 0) / Object.keys(factors).length

  // 方差越小，置信度越高
  const confidence = 1.0 - Math.min(factorsVariance * 2, 0.8)
  
  return Math.round(confidence * 100) / 100
}

// 生成推荐ID
function generateRecommendationId(capability: any) {
  return `${capability.node.id}_${capability.productType}_${capability.serviceType}_${Date.now()}`
}

// 检查边界框相交（复制自空间搜索）
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

    return !(maxX1 < minX2 || minX1 > maxX2 || maxY1 < minY2 || minY1 > maxY2)
  } catch {
    return false
  }
}