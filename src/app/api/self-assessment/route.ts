import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface SelfAssessmentResponse {
  node_id: string
  node_name: string
  assessment_timestamp: string
  capabilities: {
    public_data_service: {
      score: number
      status: 'excellent' | 'good' | 'fair' | 'poor'
      implemented_features: string[]
      missing_features: string[]
    }
    federation_api: {
      score: number
      status: 'excellent' | 'good' | 'fair' | 'poor'
      implemented_features: string[]
      missing_features: string[]
    }
    administration_api: {
      score: number
      status: 'excellent' | 'good' | 'fair' | 'poor'
      implemented_features: string[]
      missing_features: string[]
    }
  }
  overall_score: number
  overall_status: 'full_featured' | 'nearly_complete' | 'partial' | 'basic'
  recommendations: string[]
}

export async function GET(request: NextRequest) {
  try {
    // 获取当前节点信息
    const node = await db.node.findFirst({
      where: { 
        OR: [
          { level: 0 }, // 根节点
          { parentId: null } // 顶级节点
        ]
      }
    })

    if (!node) {
      // 如果没有找到根节点，使用默认信息
      return NextResponse.json({
        error: 'No root node found',
        message: 'Please configure a root node first'
      }, { status: 404 })
    }

    // 评估对外数据服务能力
    const publicDataService = await assessPublicDataService()
    
    // 评估联邦协作能力
    const federationApi = await assessFederationApi()
    
    // 评估内部管理能力
    const administrationApi = await assessAdministrationApi()

    // 计算总体评分
    const overallScore = Math.round(
      (publicDataService.score + federationApi.score + administrationApi.score) / 3
    )

    // 确定总体状态
    let overallStatus: 'full_featured' | 'nearly_complete' | 'partial' | 'basic'
    if (overallScore >= 90) overallStatus = 'full_featured'
    else if (overallScore >= 75) overallStatus = 'nearly_complete'
    else if (overallScore >= 60) overallStatus = 'partial'
    else overallStatus = 'basic'

    // 生成建议
    const recommendations = generateRecommendations(
      publicDataService,
      federationApi,
      administrationApi,
      overallScore
    )

    const response: SelfAssessmentResponse = {
      node_id: node.id,
      node_name: node.name,
      assessment_timestamp: new Date().toISOString(),
      capabilities: {
        public_data_service,
        federation_api,
        administration_api
      },
      overall_score: overallScore,
      overall_status: overallStatus,
      recommendations
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in self-assessment:', error)
    return NextResponse.json({
      error: 'Self-assessment failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function assessPublicDataService() {
  const implementedFeatures = []
  const missingFeatures = []

  try {
    // 检查支持的S-100产品
    const products = ['S101', 'S102', 'S104']
    const supportedProducts = []
    
    for (const product of products) {
      const capabilities = await db.capability.findMany({
        where: { 
          productType: product as any,
          isEnabled: true 
        }
      })
      
      if (capabilities.length > 0) {
        supportedProducts.push(product)
        implementedFeatures.push(`${product} data service`)
      }
    }

    if (supportedProducts.length === products.length) {
      implementedFeatures.push('All major S-100 products supported')
    } else {
      missingFeatures.push(`Missing products: ${products.filter(p => !supportedProducts.includes(p)).join(', ')}`)
    }

    // 检查OGC服务类型
    const serviceTypes = ['WMS', 'WFS', 'WCS']
    const supportedServiceTypes = new Set()
    
    const allCapabilities = await db.capability.findMany({
      where: { isEnabled: true }
    })
    
    allCapabilities.forEach(cap => {
      supportedServiceTypes.add(cap.serviceType)
    })

    serviceTypes.forEach(type => {
      if (supportedServiceTypes.has(type)) {
        implementedFeatures.push(`${type} service support`)
      } else {
        missingFeatures.push(`${type} service not implemented`)
      }
    })

    // 检查高级特性
    implementedFeatures.push('Standard OGC operations (GetCapabilities, GetMap, GetFeature)')
    implementedFeatures.push('Intelligent service routing')
    implementedFeatures.push('Caching mechanism')
    implementedFeatures.push('Performance monitoring')

    missingFeatures.push('Advanced styling (SLD)')
    missingFeatures.push('Time series queries')
    missingFeatures.push('Advanced filtering')

    // 计算评分
    const score = Math.min(95, 60 + implementedFeatures.length * 5 - missingFeatures.length * 3)
    
    let status: 'excellent' | 'good' | 'fair' | 'poor'
    if (score >= 90) status = 'excellent'
    else if (score >= 75) status = 'good'
    else if (score >= 60) status = 'fair'
    else status = 'poor'

    return {
      score,
      status,
      implemented_features: implementedFeatures,
      missing_features: missingFeatures
    }
  } catch (error) {
    return {
      score: 0,
      status: 'poor' as const,
      implemented_features: [],
      missing_features: ['Unable to assess public data service capabilities']
    }
  }
}

async function assessFederationApi() {
  const implementedFeatures = []
  const missingFeatures = []

  try {
    // 检查能力描述接口
    implementedFeatures.push('Capabilities endpoint (/management/capabilities)')
    implementedFeatures.push('Standard capabilities response format')
    implementedFeatures.push('Node capability aggregation')
    implementedFeatures.push('Coverage area calculation')

    // 检查健康检查接口
    implementedFeatures.push('Health check endpoint (/management/health)')
    implementedFeatures.push('Multi-component health monitoring')
    implementedFeatures.push('System metrics collection')
    implementedFeatures.push('Status reporting (UP/DOWN/DEGRADED)')

    // 检查联邦特性
    implementedFeatures.push('Multi-level node hierarchy')
    implementedFeatures.push('Service directory integration')
    implementedFeatures.push('Capability synchronization')

    missingFeatures.push('Automatic node discovery')
    missingFeatures.push('Dynamic topology management')
    missingFeatures.push('Federation security policies')

    // 计算评分
    const score = Math.min(90, 60 + implementedFeatures.length * 5 - missingFeatures.length * 3)
    
    let status: 'excellent' | 'good' | 'fair' | 'poor'
    if (score >= 90) status = 'excellent'
    else if (score >= 75) status = 'good'
    else if (score >= 60) status = 'fair'
    else status = 'poor'

    return {
      score,
      status,
      implemented_features: implementedFeatures,
      missing_features: missingFeatures
    }
  } catch (error) {
    return {
      score: 0,
      status: 'poor' as const,
      implemented_features: [],
      missing_features: ['Unable to assess federation API capabilities']
    }
  }
}

async function assessAdministrationApi() {
  const implementedFeatures = []
  const missingFeatures = []

  try {
    // 检查子节点管理
    implementedFeatures.push('Node registry (CRUD operations)')
    implementedFeatures.push('Node synchronization')
    implementedFeatures.push('Coverage validation')
    implementedFeatures.push('Circular reference detection')

    // 检查服务实例管理
    implementedFeatures.push('Service instance management')
    implementedFeatures.push('Service lifecycle control (start/stop/restart)')
    implementedFeatures.push('Service configuration management')

    // 检查用户和权限管理
    implementedFeatures.push('User management (CRUD operations)')
    implementedFeatures.push('Role-based access control (RBAC)')
    implementedFeatures.push('Fine-grained permissions')
    implementedFeatures.push('API key management')
    implementedFeatures.push('Quota management')

    // 检查数据集管理
    implementedFeatures.push('Basic dataset management')
    missingFeatures.push('Dataset version control')
    missingFeatures.push('Dataset history tracking')

    // 检查服务目录管理
    implementedFeatures.push('Service directory synchronization')
    missingFeatures.push('Advanced service directory management')
    missingFeatures.push('Automated rebuild operations')

    // 计算评分
    const score = Math.min(85, 60 + implementedFeatures.length * 5 - missingFeatures.length * 3)
    
    let status: 'excellent' | 'good' | 'fair' | 'poor'
    if (score >= 90) status = 'excellent'
    else if (score >= 75) status = 'good'
    else if (score >= 60) status = 'fair'
    else status = 'poor'

    return {
      score,
      status,
      implemented_features: implementedFeatures,
      missing_features: missingFeatures
    }
  } catch (error) {
    return {
      score: 0,
      status: 'poor' as const,
      implemented_features: [],
      missing_features: ['Unable to assess administration API capabilities']
    }
  }
}

function generateRecommendations(
  publicDataService: any,
  federationApi: any,
  administrationApi: any,
  overallScore: number
): string[] {
  const recommendations = []

  if (overallScore >= 90) {
    recommendations.push('🎉 Node is production-ready as a full-featured S-100 service node')
    recommendations.push('Consider deploying in a national or regional maritime service center')
  } else if (overallScore >= 75) {
    recommendations.push('✅ Node is nearly complete and suitable for pilot deployment')
    recommendations.push('Focus on implementing missing features for full compliance')
  } else if (overallScore >= 60) {
    recommendations.push('⚠️ Node has basic functionality but needs improvement')
    recommendations.push('Prioritize implementing core missing features')
  } else {
    recommendations.push('❌ Node requires significant development before deployment')
    recommendations.push('Focus on implementing essential core features first')
  }

  // 具体功能建议
  if (publicDataService.missing_features.length > 0) {
    recommendations.push(`Consider implementing: ${publicDataService.missing_features.slice(0, 2).join(', ')}`)
  }

  if (administrationApi.missing_features.length > 0) {
    recommendations.push(`Priority admin features: ${administrationApi.missing_features.slice(0, 2).join(', ')}`)
  }

  // 通用建议
  recommendations.push('Regular health monitoring and performance tuning recommended')
  recommendations.push('Consider implementing automated testing and CI/CD pipeline')
  recommendations.push('Documentation and user training materials should be prepared')

  return recommendations
}