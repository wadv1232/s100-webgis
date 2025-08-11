import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 同步远程服务配置
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { syncCapabilities = true, syncMetadata = true, forceSync = false } = body

    // 检查远程服务是否存在
    const service = await db.remoteService.findUnique({
      where: { id }
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: '远程服务不存在' },
        { status: 404 }
      )
    }

    // 检查服务状态
    if (service.status !== 'ACTIVE' && !forceSync) {
      return NextResponse.json(
        { success: false, error: '服务状态不正常，无法同步配置' },
        { status: 400 }
      )
    }

    // 更新同步状态
    await db.remoteService.update({
      where: { id },
      data: { 
        status: 'SYNCING',
        lastSyncAttempt: new Date()
      }
    })

    // 执行同步
    const syncResult = await performServiceSync(service, {
      syncCapabilities,
      syncMetadata
    })

    // 更新同步结果
    const updatedService = await db.remoteService.update({
      where: { id },
      data: {
        status: syncResult.success ? 'ACTIVE' : 'SYNC_ERROR',
        lastSync: new Date(),
        lastSyncResult: syncResult,
        syncCapabilities: syncCapabilities ? syncResult.capabilities : service.syncCapabilities,
        syncMetadata: syncMetadata ? syncResult.metadata : service.syncMetadata
      }
    })

    return NextResponse.json({
      success: syncResult.success,
      message: syncResult.success ? '服务配置同步成功' : '服务配置同步失败',
      data: {
        serviceId: id,
        status: updatedService.status,
        lastSync: updatedService.lastSync,
        syncResult
      }
    })

  } catch (error) {
    console.error('同步远程服务配置失败:', error)
    
    // 更新服务状态为同步错误
    try {
      await db.remoteService.update({
        where: { id: (await params).id },
        data: { 
          status: 'SYNC_ERROR',
          lastSyncAttempt: new Date()
        }
      })
    } catch (updateError) {
      console.error('更新服务状态失败:', updateError)
    }

    return NextResponse.json(
      { success: false, error: '同步远程服务配置失败' },
      { status: 500 }
    )
  }
}

// 获取远程服务同步状态
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const service = await db.remoteService.findUnique({
      where: { id }
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: '远程服务不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        serviceId: id,
        name: service.name,
        endpoint: service.endpoint,
        status: service.status,
        lastSync: service.lastSync,
        lastSyncAttempt: service.lastSyncAttempt,
        lastSyncResult: service.lastSyncResult,
        syncCapabilities: service.syncCapabilities,
        syncMetadata: service.syncMetadata
      }
    })

  } catch (error) {
    console.error('获取远程服务同步状态失败:', error)
    return NextResponse.json(
      { success: false, error: '获取远程服务同步状态失败' },
      { status: 500 }
    )
  }
}

// 执行服务同步
async function performServiceSync(service: any, options: { syncCapabilities: boolean; syncMetadata: boolean }) {
  const result: any = {
    success: false,
    capabilities: null,
    metadata: null,
    errors: [],
    warnings: [],
    syncedAt: new Date().toISOString()
  }

  try {
    const validationConfig = service.validationConfig as any
    const timeout = validationConfig?.timeout || 30000

    // 获取服务能力文档
    const capabilitiesResponse = await fetchWithTimeout(service.endpoint, {
      method: 'GET',
      headers: {
        'User-Agent': 'S100-WebGIS/1.0',
        'Accept': 'application/xml, text/xml'
      }
    }, timeout)

    if (!capabilitiesResponse.ok) {
      result.errors.push(`获取服务能力文档失败: HTTP ${capabilitiesResponse.status}`)
      return result
    }

    const capabilitiesText = await capabilitiesResponse.text()

    // 解析服务能力文档
    if (options.syncCapabilities) {
      try {
        const capabilities = parseServiceCapabilities(capabilitiesText, service.serviceType)
        result.capabilities = capabilities
        result.warnings.push(...capabilities.warnings)
      } catch (error) {
        result.errors.push(`解析服务能力文档失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    }

    // 获取服务元数据
    if (options.syncMetadata) {
      try {
        const metadata = await extractServiceMetadata(capabilitiesText, service)
        result.metadata = metadata
      } catch (error) {
        result.errors.push(`获取服务元数据失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
    }

    result.success = result.errors.length === 0

  } catch (error) {
    result.errors.push(`同步过程中发生错误: ${error instanceof Error ? error.message : '未知错误'}`)
  }

  return result
}

// 带超时的请求
async function fetchWithTimeout(url: string, options: RequestInit, timeout: number) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// 解析服务能力文档
function parseServiceCapabilities(xmlText: string, serviceType: string) {
  const capabilities: any = {
    supportedFormats: [],
    supportedCRS: [],
    layers: [],
    warnings: []
  }

  try {
    // 简化的XML解析 - 在实际项目中应该使用专门的XML解析库
    if (serviceType === 'WMS') {
      // 解析WMS能力文档
      const formatMatches = xmlText.match(/<Format>([^<]+)<\/Format>/g)
      if (formatMatches) {
        capabilities.supportedFormats = formatMatches.map(match => 
          match.replace(/<Format>|<\/Format>/g, '')
        )
      }

      const layerMatches = xmlText.match(/<Layer[^>]*>[\s\S]*?<\/Layer>/g)
      if (layerMatches) {
        capabilities.layers = layerMatches.map(layerMatch => {
          const nameMatch = layerMatch.match(/<Name>([^<]+)<\/Name>/)
          const titleMatch = layerMatch.match(/<<Title>([^<]+)<\/Title>/)
          return {
            name: nameMatch ? nameMatch[1] : '',
            title: titleMatch ? titleMatch[1] : ''
          }
        })
      }
    } else if (serviceType === 'WFS') {
      // 解析WFS能力文档
      const formatMatches = xmlText.match(/<OutputFormat>([^<]+)<\/OutputFormat>/g)
      if (formatMatches) {
        capabilities.supportedFormats = formatMatches.map(match => 
          match.replace(/<OutputFormat>|<\/OutputFormat>/g, '')
        )
      }
    } else if (serviceType === 'WCS') {
      // 解析WCS能力文档
      const formatMatches = xmlText.match(/<Format>([^<]+)<\/Format>/g)
      if (formatMatches) {
        capabilities.supportedFormats = formatMatches.map(match => 
          match.replace(/<Format>|<\/Format>/g, '')
        )
      }
    }

    // 解析坐标系
    const crsMatches = xmlText.match(/<SRS>([^<]+)<\/SRS>/g) || xmlText.match(/<CRS>([^<]+)<\/CRS>/g)
    if (crsMatches) {
      capabilities.supportedCRS = crsMatches.map(match => 
        match.replace(/<SRS>|<\/SRS>|<CRS>|<\/CRS>/g, '')
      )
    }

  } catch (error) {
    capabilities.warnings.push(`解析服务能力文档时出现警告: ${error instanceof Error ? error.message : '未知错误'}`)
  }

  return capabilities
}

// 提取服务元数据
async function extractServiceMetadata(xmlText: string, service: any) {
  const metadata: any = {
    title: '',
    abstract: '',
    keywords: [],
    fees: '',
    accessConstraints: '',
    contact: {}
  }

  try {
    // 提取标题
    const titleMatch = xmlText.match(/<Title>([^<]+)<\/Title>/)
    if (titleMatch) {
      metadata.title = titleMatch[1]
    }

    // 提取摘要
    const abstractMatch = xmlText.match(/<Abstract>([^<]+)<\/Abstract>/)
    if (abstractMatch) {
      metadata.abstract = abstractMatch[1]
    }

    // 提取关键词
    const keywordMatches = xmlText.match(/<Keyword[^>]*>([^<]+)<\/Keyword>/g)
    if (keywordMatches) {
      metadata.keywords = keywordMatches.map(match => 
        match.replace(/<Keyword[^>]*>|<\/Keyword>/g, '')
      )
    }

    // 提取费用和访问约束
    const feesMatch = xmlText.match(/<Fees>([^<]*)<\/Fees>/)
    if (feesMatch) {
      metadata.fees = feesMatch[1]
    }

    const accessMatch = xmlText.match(/<AccessConstraints>([^<]*)<\/AccessConstraints>/)
    if (accessMatch) {
      metadata.accessConstraints = accessMatch[1]
    }

    // 提取联系信息
    const contactMatches = xmlText.match(/<Contact[^>]*>[\s\S]*?<\/Contact>/)
    if (contactMatches) {
      const contactText = contactMatches[0]
      const personMatch = contactText.match(/<ContactPerson>([^<]+)<\/ContactPerson>/)
      const organizationMatch = contactText.match(/<ContactOrganization>([^<]+)<\/ContactOrganization>/)
      const emailMatch = contactText.match(/<ContactElectronicMailAddress>([^<]+)<\/ContactElectronicMailAddress>/)

      metadata.contact = {
        person: personMatch ? personMatch[1] : '',
        organization: organizationMatch ? organizationMatch[1] : '',
        email: emailMatch ? emailMatch[1] : ''
      }
    }

  } catch (error) {
    console.warn('提取服务元数据时出现警告:', error)
  }

  return metadata
}