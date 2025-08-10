import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 获取已发布的数据集，按产品类型分组
    const datasets = await db.dataset.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        node: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    })

    // 按产品类型分组统计
    const productStats = datasets.reduce((acc, dataset) => {
      if (!acc[dataset.productType]) {
        acc[dataset.productType] = {
          id: dataset.productType,
          name: getProductName(dataset.productType),
          description: getProductDescription(dataset.productType),
          status: 'ACTIVE',
          version: '1.0.0',
          services: [],
          count: 0
        }
      }
      acc[dataset.productType].count++
      
      // 添加服务类型
      const services = acc[dataset.productType].services
      if (!services.includes('WMS')) services.push('WMS')
      if (!services.includes('WFS')) services.push('WFS')
      if (!services.includes('WCS')) services.push('WCS')
      
      return acc
    }, {} as Record<string, any>)

    // 转换为数组格式
    const products = Object.values(productStats).map((product: any) => ({
      ...product,
      services: product.services.slice(0, 3) // 限制服务数量
    }))

    return NextResponse.json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('Error fetching home products:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch home products'
      },
      { status: 500 }
    )
  }
}

// 辅助函数：获取产品名称
function getProductName(productType: string): string {
  const names: Record<string, string> = {
    'S101': 'S-101 电子海图',
    'S102': 'S-102 高精度水深',
    'S104': 'S-104 动态水位',
    'S111': 'S-111 实时海流',
    'S124': 'S-124 航行警告',
    'S125': 'S-125 航行信息',
    'S131': 'S-131 海洋保护区'
  }
  return names[productType] || productType
}

// 辅助函数：获取产品描述
function getProductDescription(productType: string): string {
  const descriptions: Record<string, string> = {
    'S101': '标准电子海图数据服务',
    'S102': '水深测量和海底地形数据服务',
    'S104': '实时水位和潮汐数据服务',
    'S111': '实时海流和海洋环境数据服务',
    'S124': '航行警告和安全信息服务',
    'S125': '航行信息和交通管理服务',
    'S131': '海洋保护区和环境数据服务'
  }
  return descriptions[productType] || `${productType} 数据服务`
}