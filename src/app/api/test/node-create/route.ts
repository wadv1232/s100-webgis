import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { NodeType, NodeHealth } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Received node creation request:', body)

    const { node_id, node_name, level = 3 } = body

    if (!node_id || !node_name) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: node_id, node_name'
      }, { status: 400 })
    }

    console.log('Creating node with data:', {
      id: node_id,
      code: node_id,
      name: node_name,
      type: NodeType.LEAF,
      level: level,
      description: `${node_name} service node`,
      apiUrl: `https://api.example.com/${node_id}`,
      coverage: JSON.stringify({
        type: 'Polygon',
        coordinates: [[[120.0, 31.0], [122.0, 31.0], [122.0, 32.0], [120.0, 32.0], [120.0, 31.0]]]
      }),
      isActive: true,
      healthStatus: NodeHealth.OFFLINE
    })

    const newNode = await db.node.create({
      data: {
        id: node_id,
        code: node_id,
        name: node_name,
        type: NodeType.LEAF,
        level: level,
        description: `${node_name} service node`,
        apiUrl: `https://api.example.com/${node_id}`,
        coverage: JSON.stringify({
          type: 'Polygon',
          coordinates: [[[120.0, 31.0], [122.0, 31.0], [122.0, 32.0], [120.0, 32.0], [120.0, 31.0]]]
        }),
        isActive: true,
        healthStatus: NodeHealth.OFFLINE
      }
    })

    console.log('Node created successfully:', newNode)

    return NextResponse.json({
      success: true,
      data: {
        nodeId: newNode.id,
        nodeName: newNode.name,
        message: 'Node created successfully'
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Detailed error creating node:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
      meta: error.meta
    })

    return NextResponse.json({
      success: false,
      error: 'Failed to create node',
      details: error.message
    }, { status: 500 })
  }
}