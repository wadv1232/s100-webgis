import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// 发布数据集
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // 检查数据集是否存在
    const dataset = await db.dataset.findUnique({
      where: { id },
      include: {
        node: true
      }
    })

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: '数据集不存在' },
        { status: 404 }
      )
    }

    // 检查数据集状态
    if (dataset.status === 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: '数据集已经发布' },
        { status: 400 }
      )
    }

    // 模拟数据处理过程 - 在实际项目中应该调用相应的处理服务
    console.log(`开始处理数据集: ${dataset.name}`)
    
    // 更新数据集状态为处理中
    await db.dataset.update({
      where: { id },
      data: {
        status: 'PROCESSING'
      }
    })

    // 模拟异步处理
    setTimeout(async () => {
      try {
        // 创建服务实例
        const services = []
        
        // 根据产品类型创建相应的服务
        switch (dataset.productType) {
          case 'S101':
            // 创建WFS和WMS服务
            services.push({
              datasetId: dataset.id,
              serviceType: 'WFS',
              endpoint: `/api/v1/s101/wfs?dataset=${dataset.id}`,
              configuration: JSON.stringify({
                supportedFormats: ['GeoJSON', 'GML'],
                maxFeatures: 1000
              })
            })
            services.push({
              datasetId: dataset.id,
              serviceType: 'WMS',
              endpoint: `/api/v1/s101/wms?dataset=${dataset.id}`,
              configuration: JSON.stringify({
                supportedFormats: ['image/png', 'image/jpeg'],
                maxWidth: 2048,
                maxHeight: 2048
              })
            })
            break
          case 'S102':
            // 创建WCS和WMS服务
            services.push({
              datasetId: dataset.id,
              serviceType: 'WCS',
              endpoint: `/api/v1/s102/wcs?dataset=${dataset.id}`,
              configuration: JSON.stringify({
                supportedFormats: ['GeoTIFF', 'NetCDF'],
                interpolation: 'nearest'
              })
            })
            services.push({
              datasetId: dataset.id,
              serviceType: 'WMS',
              endpoint: `/api/v1/s102/wms?dataset=${dataset.id}`,
              configuration: JSON.stringify({
                supportedFormats: ['image/png', 'image/jpeg'],
                colorScale: 'viridis'
              })
            })
            break
          default:
            // 默认创建WMS服务
            services.push({
              datasetId: dataset.id,
              serviceType: 'WMS',
              endpoint: `/api/v1/${dataset.productType.toLowerCase()}/wms?dataset=${dataset.id}`,
              configuration: JSON.stringify({
                supportedFormats: ['image/png', 'image/jpeg']
              })
            })
        }

        // 批量创建服务
        await db.service.createMany({
          data: services
        })

        // 更新数据集状态为已发布
        await db.dataset.update({
          where: { id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date()
          }
        })

        console.log(`数据集 ${dataset.name} 发布成功`)
      } catch (error) {
        console.error('发布数据集失败:', error)
        
        // 更新数据集状态为错误
        await db.dataset.update({
          where: { id },
          data: {
            status: 'ERROR'
          }
        })
      }
    }, 3000) // 模拟3秒处理时间

    return NextResponse.json({
      success: true,
      message: '数据集发布处理已开始',
      data: {
        datasetId: id,
        status: 'PROCESSING'
      }
    })
  } catch (error) {
    console.error('发布数据集失败:', error)
    return NextResponse.json(
      { success: false, error: '发布数据集失败' },
      { status: 500 }
    )
  }
}