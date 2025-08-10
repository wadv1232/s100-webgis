import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 测试数据库连接
    const result = await db.$queryRaw`SELECT 1 as test`
    
    // 获取节点数量
    const nodeCount = await db.node.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        test: 'Connection OK',
        nodeCount: nodeCount
      }
    })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error.message
    }, { status: 500 })
  }
}