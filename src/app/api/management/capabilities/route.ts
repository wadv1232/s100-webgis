import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ServiceDirectory } from '@/lib/service-directory'

interface CapabilitiesResponse {
  provider_info: {
    node_id: string
    node_name: string
  }
  coverage: {
    type: string
    coordinates: number[][][]
  } | null
  supported_products: Array<{
    product_id: string
    product_name: string
    service_types: string[]
    service_level: string
    metadata_url?: string
    temporal_extent?: {
      start: string
      end: string
      resolution: string
    }
  }>
}

// S-100产品类型映射
const PRODUCT_NAMES: Record<string, string> = {
  'S101': 'Electronic Navigational Chart',
  'S102': 'Bathymetric Surface',
  'S104': 'Water Level Information',
  'S111': 'Surface Currents',
  'S124': 'Navigational Warnings',
  'S125': 'Navigational Information',
  'S131': 'Marine Protected Areas'
}

export async function GET(request: NextRequest) {
  try {
    // 获取当前节点信息（假设为根节点或指定节点）
    const { searchParams } = new URL(request.url)
    const nodeId = searchParams.get('node_id') || 'root' // 默认获取根节点能力

    // 获取节点信息
    const node = await db.node.findFirst({
      where: { 
        OR: [
          { id: nodeId },
          { code: nodeId }
        ]
      },
      include: {
        capabilities: {
          where: { isEnabled: true }
        },
        children: {
          include: {
            capabilities: {
              where: { isEnabled: true }
            }
          }
        }
      }
    })

    if (!node) {
      return NextResponse.json(
        { error: 'Node not found' },
        { status: 404 }
      )
    }

    // 聚合所有子节点的能力
    const allCapabilities = []
    const allNodes = [node, ...node.children]

    for (const currentNode of allNodes) {
      for (const capability of currentNode.capabilities) {
        allCapabilities.push({
          node: currentNode,
          ...capability
        })
      }
    }

    // 按产品类型分组
    const productGroups = allCapabilities.reduce((acc, cap) => {
      if (!acc[cap.productType]) {
        acc[cap.productType] = {
          product_id: cap.productType,
          product_name: PRODUCT_NAMES[cap.productType] || cap.productType,
          service_types: [],
          service_level: 'authoritative',
          nodes: []
        }
      }
      
      if (!acc[cap.productType].service_types.includes(cap.serviceType)) {
        acc[cap.productType].service_types.push(cap.serviceType)
      }
      
      acc[cap.productType].nodes.push(cap.node)
      
      return acc
    }, {} as Record<string, any>)

    // 计算聚合覆盖范围
    let aggregatedCoverage = null
    try {
      const allCoverages = allNodes
        .filter(n => n.coverage)
        .map(n => JSON.parse(n.coverage as string))
      
      if (allCoverages.length > 0) {
        // 简化的覆盖范围聚合 - 实际应用中可能需要更复杂的几何计算
        aggregatedCoverage = allCoverages[0] // 暂时使用第一个节点的覆盖范围
      }
    } catch (error) {
      console.warn('Failed to aggregate coverage:', error)
    }

    // 构建响应
    const response: CapabilitiesResponse = {
      provider_info: {
        node_id: node.id,
        node_name: node.name
      },
      coverage: aggregatedCoverage,
      supported_products: Object.values(productGroups).map((group: any) => ({
        product_id: group.product_id,
        product_name: group.product_name,
        service_types: group.service_types.sort(),
        service_level: group.service_level,
        metadata_url: `${node.apiUrl}/api/metadata/${group.product_id.toLowerCase()}.xml`
      }))
    }

    // 为S104等产品添加时间范围信息（示例）
    const s104Product = response.supported_products.find(p => p.product_id === 'S104')
    if (s104Product) {
      s104Product.temporal_extent = {
        start: new Date().toISOString(),
        end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天
        resolution: 'PT1H' // 1小时间隔
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in capabilities API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}