import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth, requireAuth } from '@/lib/auth'

// 获取节点的底图配置
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(async (request: NextRequest, user: any) => {
    try {
      const { id: nodeId } = await params

      // 获取节点的默认底图配置
      const defaultConfig = await db.nodeBaseMapConfig.findFirst({
        where: {
          nodeId,
          isDefault: true,
          isActive: true
        }
      })

      // 获取用户的个人偏好设置
      const userPreference = await db.userBaseMapPreference.findUnique({
        where: {
          userId_nodeId: {
            userId: user.id,
            nodeId
          }
        }
      })

      // 返回配置（用户偏好优先于节点默认配置）
      const config = userPreference || defaultConfig

      return NextResponse.json({
        success: true,
        data: config || {
          type: 'osm',
          minZoom: 1,
          maxZoom: 18,
          isActive: true
        }
      })
    } catch (error) {
      console.error('Error fetching base map config:', error)
      return NextResponse.json(
        { error: 'Failed to fetch base map configuration' },
        { status: 500 }
      )
    }
  })(request)
}

// 创建或更新节点的底图配置
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(async (request: NextRequest, user: any) => {
    try {
      const { id: nodeId } = await params
      const body = await request.json()
      const { 
        type, 
        customUrl, 
        attribution, 
        minZoom, 
        maxZoom, 
        isDefault,
        // 显示配置字段
        showCoordinates,
        showLayerPanel,
        showLegendPanel,
        layerPanelPosition,
        coordinatePanelPosition,
        panelOpacity,
        alwaysOnTop
      } = body

      // 检查用户权限（系统管理员可以管理任何节点，节点管理员只能管理自己负责的节点）
      if (user.role !== 'ADMIN') {
        if (user.role === 'NODE_ADMIN') {
          // 检查节点管理员是否负责该节点
          if (user.nodeId !== nodeId) {
            return NextResponse.json({ error: 'You can only manage nodes you are assigned to' }, { status: 403 })
          }
        } else {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      // 验证输入
      if (!['osm', 'satellite', 'terrain', 'custom'].includes(type)) {
        return NextResponse.json({ error: 'Invalid base map type' }, { status: 400 })
      }

      if (type === 'custom' && !customUrl) {
        return NextResponse.json({ error: 'Custom URL is required for custom base map' }, { status: 400 })
      }

      // 如果设置为默认配置，先将其他配置设为非默认
      if (isDefault) {
        await db.nodeBaseMapConfig.updateMany({
          where: { nodeId },
          data: { isDefault: false }
        })
      }

      // 查找现有配置
      const existingConfig = await db.nodeBaseMapConfig.findFirst({
        where: { nodeId }
      })

      let config
      if (existingConfig) {
        // 更新现有配置
        config = await db.nodeBaseMapConfig.update({
          where: { id: existingConfig.id },
          data: {
            type,
            customUrl,
            attribution,
            minZoom: minZoom || 1,
            maxZoom: maxZoom || 18,
            isDefault: isDefault || false,
            // 显示配置字段
            showCoordinates: showCoordinates ?? true,
            showLayerPanel: showLayerPanel ?? true,
            showLegendPanel: showLegendPanel ?? true,
            layerPanelPosition: layerPanelPosition || 'top-right',
            coordinatePanelPosition: coordinatePanelPosition || 'bottom-left',
            panelOpacity: panelOpacity || 95,
            alwaysOnTop: alwaysOnTop ?? true,
            updatedBy: user.id
          }
        })
      } else {
        // 创建新配置
        config = await db.nodeBaseMapConfig.create({
          data: {
            nodeId,
            type,
            customUrl,
            attribution,
            minZoom: minZoom || 1,
            maxZoom: maxZoom || 18,
            isDefault: isDefault || false,
            // 显示配置字段
            showCoordinates: showCoordinates ?? true,
            showLayerPanel: showLayerPanel ?? true,
            showLegendPanel: showLegendPanel ?? true,
            layerPanelPosition: layerPanelPosition || 'top-right',
            coordinatePanelPosition: coordinatePanelPosition || 'bottom-left',
            panelOpacity: panelOpacity || 95,
            alwaysOnTop: alwaysOnTop ?? true,
            updatedBy: user.id
          }
        })
      }

      return NextResponse.json({
        success: true,
        data: config
      })
    } catch (error) {
      console.error('Error updating base map config:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        meta: error.meta
      })
      return NextResponse.json(
        { 
          error: 'Failed to update base map configuration',
          details: error.message 
        },
        { status: 500 }
      )
    }
  })(request)
}

// 删除底图配置
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return requireAuth(async (request: NextRequest, user: any) => {
    try {
      const { id: nodeId } = await params
      const { searchParams } = new URL(request.url)
      const configId = searchParams.get('configId')

      // 检查用户权限（系统管理员可以管理任何节点，节点管理员只能管理自己负责的节点）
      if (user.role !== 'ADMIN') {
        if (user.role === 'NODE_ADMIN') {
          // 检查节点管理员是否负责该节点
          if (user.nodeId !== nodeId) {
            return NextResponse.json({ error: 'You can only manage nodes you are assigned to' }, { status: 403 })
          }
        } else {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }

      if (!configId) {
        return NextResponse.json({ error: 'Config ID is required' }, { status: 400 })
      }

      await db.nodeBaseMapConfig.delete({
        where: { id: configId }
      })

      return NextResponse.json({
        success: true,
        message: 'Base map configuration deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting base map config:', error)
      return NextResponse.json(
        { error: 'Failed to delete base map configuration' },
        { status: 500 }
      )
    }
  })(request)
}