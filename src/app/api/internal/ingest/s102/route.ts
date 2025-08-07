import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// S-102 数据摄入内部 API
// 接收 S-102 格网数据的元数据 JSON 并存储到数据库

// 验证元数据格式
function validateMetadata(metadata: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // 验证必需字段
  if (!metadata.title || typeof metadata.title !== 'string') {
    errors.push('Title is required and must be a string')
  }

  if (!metadata.spatialReference || typeof metadata.spatialReference !== 'string') {
    errors.push('Spatial reference is required')
  }

  if (!metadata.resolution || !Array.isArray(metadata.resolution) || metadata.resolution.length !== 2) {
    errors.push('Resolution must be an array with 2 numbers [x, y]')
  }

  if (!metadata.dimensions || !Array.isArray(metadata.dimensions) || metadata.dimensions.length !== 2) {
    errors.push('Dimensions must be an array with 2 numbers [width, height]')
  }

  if (!metadata.boundingBox || !Array.isArray(metadata.boundingBox) || metadata.boundingBox.length !== 4) {
    errors.push('Bounding box must be an array with 4 numbers [minX, minY, maxX, maxY]')
  }

  // 验证数据类型
  if (metadata.dataType && !['float32', 'float64', 'int16', 'int32'].includes(metadata.dataType)) {
    errors.push('Data type must be one of: float32, float64, int16, int32')
  }

  // 验证单位
  if (metadata.unit && !['m', 'ft', 'km'].includes(metadata.unit)) {
    errors.push('Unit must be one of: m, ft, km')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// 生成覆盖范围 GeoJSON
function generateCoverage(metadata: any): any {
  const [minX, minY, maxX, maxY] = metadata.boundingBox || [120.0, 30.0, 122.0, 32.0]

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [minX, minY],
            [maxX, minY],
            [maxX, maxY],
            [minX, maxY],
            [minX, minY]
          ]]
        },
        properties: {
          name: metadata.title || 'S-102 Coverage',
          type: 'bathymetry',
          resolution: metadata.resolution,
          dimensions: metadata.dimensions
        }
      }
    ],
    bbox: [minX, minY, maxX, maxY]
  }
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
          serviceType: 'WCS',
          isEnabled: true,
          endpoint: `/api/v1/${productType.toLowerCase()}/wcs`,
          version: '2.0.1'
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

    // 解析请求体
    const body = await request.json()
    const {
      name,
      description,
      metadata,
      nodeId,
      filePath,
      fileSize,
      mimeType = 'application/x-hdf5',
      version = '1.0'
    } = body

    // 验证必需参数
    if (!name || !metadata) {
      return NextResponse.json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Missing required parameters: name, metadata'
        }
      }, { status: 400 })
    }

    // 验证元数据格式
    const validation = validateMetadata(metadata)
    if (!validation.isValid) {
      return NextResponse.json({
        error: {
          code: 'INVALID_METADATA',
          message: 'Invalid metadata format',
          errors: validation.errors
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

    // 生成覆盖范围
    const coverage = generateCoverage(metadata)

    // 创建数据集记录
    const dataset = await db.dataset.create({
      data: {
        name,
        description: description || `${name} - S-102 bathymetry dataset`,
        productType: 'S102',
        version,
        status: 'UPLOADED',
        fileName: filePath || `${name.replace(/[^a-zA-Z0-9]/g, '_')}_s102.h5`,
        filePath: filePath || `/data/s102/${name.replace(/[^a-zA-Z0-9]/g, '_')}.h5`,
        fileSize: fileSize || 0,
        mimeType,
        coverage: JSON.stringify(coverage),
        metadata: JSON.stringify({
          ...metadata,
          ingestTime: new Date().toISOString(),
          ingestUser: session.user?.email || 'unknown',
          datasetName: name,
          datasetDescription: description
        }),
        nodeId: targetNodeId
      },
      include: {
        node: true
      }
    })

    // 创建服务能力记录（如果需要）
    await ensureServiceCapabilities(targetNodeId, 'S102')

    // 返回成功响应
    const response = {
      success: true,
      dataset: {
        id: dataset.id,
        name: dataset.name,
        productType: dataset.productType,
        version: dataset.version,
        status: dataset.status,
        nodeId: dataset.nodeId,
        nodeName: dataset.node.name,
        coverage: coverage,
        metadata: JSON.parse(dataset.metadata),
        publishedAt: dataset.publishedAt,
        createdAt: dataset.createdAt
      },
      performance: {
        ingestTime: Date.now() - startTime,
        fileSize: dataset.fileSize
      }
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error) {
    console.error('Error in S-102 ingestion API:', error)
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error during data ingestion',
        details: error.message
      }
    }, { status: 500 })
  }
}