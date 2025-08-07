import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth, requireAuth } from '@/lib/auth'

// 获取用户的底图偏好设置
export async function GET(request: NextRequest) {
  return requireAuth(async (request: NextRequest, user: any) => {
    try {
      const { searchParams } = new URL(request.url)
      const nodeId = searchParams.get('nodeId')

      if (!nodeId) {
        return NextResponse.json({ error: 'Node ID is required' }, { status: 400 })
      }

      const preference = await db.userBaseMapPreference.findUnique({
        where: {
          userId_nodeId: {
            userId: user.id,
            nodeId
          }
        }
      })

      return NextResponse.json({
        success: true,
        data: preference
      })
    } catch (error) {
      console.error('Error fetching user base map preference:', error)
      return NextResponse.json(
        { error: 'Failed to fetch user base map preference' },
        { status: 500 }
      )
    }
  })(request)
}

// 创建或更新用户的底图偏好设置
export async function POST(request: NextRequest) {
  return requireAuth(async (request: NextRequest, user: any) => {
    try {
      const body = await request.json()
      const { nodeId, type, customUrl, attribution, minZoom, maxZoom } = body

      if (!nodeId) {
        return NextResponse.json({ error: 'Node ID is required' }, { status: 400 })
      }

      if (!['osm', 'satellite', 'terrain', 'custom'].includes(type)) {
        return NextResponse.json({ error: 'Invalid base map type' }, { status: 400 })
      }

      if (type === 'custom' && !customUrl) {
        return NextResponse.json({ error: 'Custom URL is required for custom base map' }, { status: 400 })
      }

      const preference = await db.userBaseMapPreference.upsert({
        where: {
          userId_nodeId: {
            userId: user.id,
            nodeId
          }
        },
        update: {
          type,
          customUrl,
          attribution,
          minZoom: minZoom || 1,
          maxZoom: maxZoom || 18
        },
        create: {
          userId: user.id,
          nodeId,
          type,
          customUrl,
          attribution,
          minZoom: minZoom || 1,
          maxZoom: maxZoom || 18
        }
      })

      return NextResponse.json({
        success: true,
        data: preference
      })
    } catch (error) {
      console.error('Error updating user base map preference:', error)
      return NextResponse.json(
        { error: 'Failed to update user base map preference' },
        { status: 500 }
      )
    }
  })(request)
}

// 删除用户的底图偏好设置
export async function DELETE(request: NextRequest) {
  return requireAuth(async (request: NextRequest, user: any) => {
    try {
      const { searchParams } = new URL(request.url)
      const nodeId = searchParams.get('nodeId')

      if (!nodeId) {
        return NextResponse.json({ error: 'Node ID is required' }, { status: 400 })
      }

      await db.userBaseMapPreference.delete({
        where: {
          userId_nodeId: {
            userId: user.id,
            nodeId
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'User base map preference deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting user base map preference:', error)
      return NextResponse.json(
        { error: 'Failed to delete user base map preference' },
        { status: 500 }
      )
    }
  })(request)
}