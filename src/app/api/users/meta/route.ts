import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole, Permission } from '@prisma/client'

// GET /api/users/meta - Get user metadata (roles, permissions, nodes)
export async function GET() {
  try {
    // Get all available roles
    const roles = Object.values(UserRole)

    // Get all available permissions
    const permissions = await db.permission.findMany({
      orderBy: { name: 'asc' }
    })

    // Get all nodes for user assignment
    const nodes = await db.node.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        level: true
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    })

    // Get role permissions mapping
    const rolePermissions = await db.rolePermission.findMany({
      include: {
        permission: true
      },
      orderBy: [
        { role: 'asc' },
        { permission: { name: 'asc' } }
      ]
    })

    // Group permissions by role
    const rolePermissionMap = rolePermissions.reduce((acc, rp) => {
      if (!acc[rp.role]) {
        acc[rp.role] = []
      }
      acc[rp.role].push(rp.permission.name)
      return acc
    }, {} as Record<UserRole, string[]>)

    return NextResponse.json({
      roles,
      permissions: permissions.map(p => p.name),
      nodes,
      rolePermissions: rolePermissionMap
    })
  } catch (error) {
    console.error('Error fetching user metadata:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user metadata' },
      { status: 500 }
    )
  }
}