import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 验证服务可用性
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

    // 获取服务信息
    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: { 
        dataset: {
          include: { node: true }
        }
      }
    })

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 })
    }

    // 执行服务验证
    const validationResult = await validateService(service)

    // 更新验证结果
    await db.service.update({
      where: { id: serviceId },
      data: {
        isActive: validationResult.isValid,
        configuration: JSON.stringify({
          ...JSON.parse(service.configuration || '{}'),
          lastValidation: validationResult,
          validatedAt: new Date()
        })
      }
    })

    return NextResponse.json({ validationResult })
  } catch (error) {
    console.error('Error validating service:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// 服务验证函数
async function validateService(service: any): Promise<any> {
  const startTime = Date.now()
  const results = {
    isValid: false,
    checks: [] as any[],
    responseTime: 0,
    errors: [] as string[],
    warnings: [] as string[]
  }

  try {
    // 1. 检查服务端点可达性
    const endpointCheck = await checkEndpointReachability(service.endpoint)
    results.checks.push(endpointCheck)
    
    if (!endpointCheck.success) {
      results.errors.push(`Endpoint unreachable: ${endpointCheck.error}`)
    }

    // 2. 根据服务类型进行特定验证
    switch (service.serviceType) {
      case 'WMS':
        const wmsCheck = await validateWMSService(service.endpoint)
        results.checks.push(wmsCheck)
        break
      case 'WFS':
        const wfsCheck = await validateWFSService(service.endpoint)
        results.checks.push(wfsCheck)
        break
      case 'WCS':
        const wcsCheck = await validateWCSService(service.endpoint)
        results.checks.push(wcsCheck)
        break
    }

    // 3. 检查数据集关联
    if (service.dataset) {
      const datasetCheck = await checkDatasetConsistency(service.dataset)
      results.checks.push(datasetCheck)
    }

    // 4. 计算总体结果
    results.isValid = results.checks.every(check => check.success)
    results.responseTime = Date.now() - startTime

    // 收集所有警告
    results.checks.forEach(check => {
      if (check.warnings) {
        results.warnings.push(...check.warnings)
      }
    })

  } catch (error) {
    results.errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    results.isValid = false
  }

  return results
}

// 检查端点可达性
async function checkEndpointReachability(endpoint: string): Promise<any> {
  try {
    const response = await fetch(endpoint, {
      method: 'HEAD',
      timeout: 10000
    })
    
    return {
      type: 'endpoint_reachability',
      success: response.ok,
      status: response.status,
      responseTime: Date.now() - new Date().getTime(),
      error: response.ok ? null : `HTTP ${response.status}`
    }
  } catch (error) {
    return {
      type: 'endpoint_reachability',
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed'
    }
  }
}

// 验证WMS服务
async function validateWMSService(endpoint: string): Promise<any> {
  try {
    const wmsUrl = `${endpoint}?service=WMS&request=GetCapabilities&version=1.3.0`
    const response = await fetch(wmsUrl, { timeout: 15000 })
    
    if (!response.ok) {
      return {
        type: 'wms_validation',
        success: false,
        error: `GetCapabilities failed: ${response.status}`
      }
    }

    const xml = await response.text()
    
    // 基本XML验证
    if (!xml.includes('WMS_Capabilities') && !xml.includes('WMT_MS_Capabilities')) {
      return {
        type: 'wms_validation',
        success: false,
        error: 'Invalid WMS GetCapabilities response'
      }
    }

    return {
      type: 'wms_validation',
      success: true,
      details: {
        hasValidCapabilities: true,
        responseSize: xml.length
      }
    }
  } catch (error) {
    return {
      type: 'wms_validation',
      success: false,
      error: error instanceof Error ? error.message : 'WMS validation failed'
    }
  }
}

// 验证WFS服务
async function validateWFSService(endpoint: string): Promise<any> {
  try {
    const wfsUrl = `${endpoint}?service=WFS&request=GetCapabilities&version=2.0.0`
    const response = await fetch(wfsUrl, { timeout: 15000 })
    
    if (!response.ok) {
      return {
        type: 'wfs_validation',
        success: false,
        error: `GetCapabilities failed: ${response.status}`
      }
    }

    const xml = await response.text()
    
    if (!xml.includes('WFS_Capabilities')) {
      return {
        type: 'wfs_validation',
        success: false,
        error: 'Invalid WFS GetCapabilities response'
      }
    }

    return {
      type: 'wfs_validation',
      success: true,
      details: {
        hasValidCapabilities: true,
        responseSize: xml.length
      }
    }
  } catch (error) {
    return {
      type: 'wfs_validation',
      success: false,
      error: error instanceof Error ? error.message : 'WFS validation failed'
    }
  }
}

// 验证WCS服务
async function validateWCSService(endpoint: string): Promise<any> {
  try {
    const wcsUrl = `${endpoint}?service=WCS&request=GetCapabilities&version=2.0.1`
    const response = await fetch(wcsUrl, { timeout: 15000 })
    
    if (!response.ok) {
      return {
        type: 'wcs_validation',
        success: false,
        error: `GetCapabilities failed: ${response.status}`
      }
    }

    const xml = await response.text()
    
    if (!xml.includes('WCS_Capabilities')) {
      return {
        type: 'wcs_validation',
        success: false,
        error: 'Invalid WCS GetCapabilities response'
      }
    }

    return {
      type: 'wcs_validation',
      success: true,
      details: {
        hasValidCapabilities: true,
        responseSize: xml.length
      }
    }
  } catch (error) {
    return {
      type: 'wcs_validation',
      success: false,
      error: error instanceof Error ? error.message : 'WCS validation failed'
    }
  }
}

// 检查数据集一致性
async function checkDatasetConsistency(dataset: any): Promise<any> {
  const warnings = []
  
  if (!dataset.coverage) {
    warnings.push('Dataset has no coverage information')
  }
  
  if (!dataset.metadata) {
    warnings.push('Dataset has no metadata')
  }
  
  if (dataset.status === 'EXPERIMENTAL' && !dataset.experimentalExpires) {
    warnings.push('Experimental dataset has no expiration date')
  }

  return {
    type: 'dataset_consistency',
    success: warnings.length === 0,
    warnings
  }
}