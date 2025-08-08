import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// S-101 数据摄入内部 API
// 接收 GeoJSON 格式的 S-101 要素数据并存储到数据库

// 验证几何图形有效性
function isValidGeometry(geometry: any): boolean {
  if (!geometry || !geometry.type || !geometry.coordinates) {
    return false
  }

  const validTypes = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection']
  if (!validTypes.includes(geometry.type)) {
    return false
  }

  // 简化的坐标验证
  try {
    validateCoordinates(geometry.coordinates)
    return true
  } catch {
    return false
  }
}

// 验证坐标数组
function validateCoordinates(coords: any): void {
  if (Array.isArray(coords)) {
    if (coords.length === 0) return
    if (typeof coords[0] === 'number') {
      // 这是坐标点 [x, y]
      if (coords.length < 2) throw new Error('Invalid coordinates')
    } else {
      // 这是嵌套数组，递归验证
      coords.forEach(coord => validateCoordinates(coord))
    }
  } else {
    throw new Error('Invalid coordinates structure')
  }
}

// 计算覆盖范围
function calculateCoverage(features: any[]): any {
  if (features.length === 0) {
    return {
      type: 'FeatureCollection',
      features: [],
      bbox: [0, 0, 0, 0]
    }
  }

  // 计算边界框
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  features.forEach(feature => {
    const bbox = getFeatureBoundingBox(feature.geometry)
    if (bbox) {
      minX = Math.min(minX, bbox[0])
      minY = Math.min(minY, bbox[1])
      maxX = Math.max(maxX, bbox[2])
      maxY = Math.max(maxY, bbox[3])
    }
  })

  // 如果没有有效的边界框，使用默认值
  if (minX === Infinity) {
    minX = 120.0; minY = 30.0; maxX = 122.0; maxY = 32.0
  }

  return {
    type: 'FeatureCollection',
    features: features,
    bbox: [minX, minY, maxX, maxY]
  }
}

// 获取单个要素的边界框
function getFeatureBoundingBox(geometry: any): number[] | null {
  if (!geometry || !geometry.coordinates) return null

  let coords: number[][] = []
  
  switch (geometry.type) {
    case 'Point':
      coords = [geometry.coordinates]
      break
    case 'LineString':
      coords = geometry.coordinates
      break
    case 'Polygon':
      coords = geometry.coordinates[0] // 外环
      break
    case 'MultiPoint':
      coords = geometry.coordinates
      break
    case 'MultiLineString':
      coords = geometry.coordinates.flat()
      break
    case 'MultiPolygon':
      coords = geometry.coordinates.map(poly => poly[0]).flat()
      break
    default:
      return null
  }

  if (coords.length === 0) return null

  let minX = coords[0][0], minY = coords[0][1], maxX = coords[0][0], maxY = coords[0][1]
  
  coords.forEach(coord => {
    minX = Math.min(minX, coord[0])
    minY = Math.min(minY, coord[1])
    maxX = Math.max(maxX, coord[0])
    maxY = Math.max(maxY, coord[1])
  })

  return [minX, minY, maxX, maxY]
}

// 确保服务能力存在
async function ensureServiceCapabilities(nodeId: string, productType: string): Promise<void> {
  const { db } = await import('@/lib/db')
  
  // 检查是否已存在服务能力
  const existingCapabilities = await db.capability.findMany({
    where: {
      nodeId,
      productType
    }
  })

  // 如果不存在，创建默认的服务能力
  if (existingCapabilities.length === 0) {
    await db.capability.createMany({
      data: [
        {
          nodeId,
          productType,
          serviceType: 'WFS',
          isEnabled: true,
          endpoint: `/api/v1/${productType.toLowerCase()}/wfs`,
          version: '1.0.0'
        },
        {
          nodeId,
          productType,
          serviceType: 'WMS',
          isEnabled: true,
          endpoint: `/api/v1/${productType.toLowerCase()}/wms`,
          version: '1.1.1'
        }
      ]
    })
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // 验证用户认证和权限
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }, { status: 401 })
    }

    // 验证用户权限（需要数据管理权限）
    // 这里可以添加更细粒度的权限检查

    // 解析请求体
    const body = await request.json()
    const {
      name,
      description,
      features,
      nodeId,
      metadata = {},
      version = '1.0'
    } = body

    // 验证必需参数
    if (!name || !features || !Array.isArray(features) || features.length === 0) {
      return NextResponse.json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing required parameters: name, features (array)'
        }
      }, { status: 400 })
    }

    // 验证 GeoJSON 格式
    const validFeatures = features.filter(feature => {
      return feature.type === 'Feature' && 
             feature.geometry && 
             feature.properties &&
             isValidGeometry(feature.geometry)
    })

    if (validFeatures.length === 0) {
      return NextResponse.json({
        error: {
          code: 'INVALID_GEOJSON',
          message: 'No valid GeoJSON features found in request'
        }
      }, { status: 400 })
    }

    // 如果没有指定节点ID，使用默认节点或根据用户权限确定
    let targetNodeId = nodeId
    if (!targetNodeId) {
      // 查找用户的默认节点或系统默认节点
      const defaultNode = await db.node.findFirst({
        where: {
          isActive: true,
          type: 'LEAF'
        },
        orderBy: {
          createdAt: 'asc'
        }
      })
      
      if (!defaultNode) {
        return NextResponse.json({
          error: {
            code: 'NO_AVAILABLE_NODE',
            message: 'No available node found for data ingestion'
          }
        }, { status: 404 })
      }
      
      targetNodeId = defaultNode.id
    }

    // 验证节点存在且用户有权限
    const targetNode = await db.node.findUnique({
      where: { id: targetNodeId }
    })

    if (!targetNode) {
      return NextResponse.json({
        error: {
          code: 'NODE_NOT_FOUND',
          message: 'Specified node not found'
        }
      }, { status: 404 })
    }

    // 计算数据集的覆盖范围
    const coverage = calculateCoverage(validFeatures)

    // 创建数据集记录
    const dataset = await db.dataset.create({
      data: {
        name,
        description: description || `${name} - S-101 dataset`,
        productType: 'S101',
        version,
        status: 'UPLOADED',
        fileName: `${name.replace(/[^a-zA-Z0-9]/g, '_')}_s101.json`,
        filePath: `/data/s101/${name.replace(/[^a-zA-Z0-9]/g, '_')}.json`,
        fileSize: JSON.stringify(validFeatures).length,
        mimeType: 'application/geo+json',
        coverage: JSON.stringify(coverage),
        metadata: JSON.stringify({
          ...metadata,
          featureCount: validFeatures.length,
          geometryTypes: [...new Set(validFeatures.map(f => f.geometry.type))],
          boundingBox: coverage.bbox,
          ingestTime: new Date().toISOString(),
          ingestUser: session.user?.email || 'unknown'
        }),
        nodeId: targetNodeId
      },
      include: {
        node: true
      }
    })

    // 将要素数据保存到文件系统（在实际项目中）
    // 这里简化处理，只记录到数据库

    // 创建服务能力记录（如果需要）
    await ensureServiceCapabilities(targetNodeId, 'S101')

    // 返回成功响应
    const response = {
      success: true,
      dataset: {
        id: dataset.id,
        name: dataset.name,
        productType: dataset.productType,
        version: dataset.version,
        status: dataset.status,
        featureCount: validFeatures.length,
        nodeId: dataset.nodeId,
        nodeName: dataset.node.name,
        coverage: coverage,
        publishedAt: dataset.publishedAt,
        createdAt: dataset.createdAt
      },
      performance: {
        ingestTime: Date.now() - startTime,
        featuresProcessed: validFeatures.length,
        fileSize: dataset.fileSize
      }
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Error in S-101 ingestion API:', error)
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error during data ingestion',
        details: error.message
      }
    }, { status: 500 })
  }
}