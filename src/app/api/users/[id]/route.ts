import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole, Permission } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/users/[id] - Get single user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const user = await db.user.findUnique({
      where: { id },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        userPermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Transform user data
    const transformedUser = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      nodeId: user.nodeId,
      nodeName: user.node?.name,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      permissions: user.userPermissions.map(up => up.permission.name)
    }

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    const { email, username, name, role, nodeId, isActive, permissions = [] } = body

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if email/username already exists for other users
    if (email || username) {
      const duplicateUser = await db.user.findFirst({
        where: {
          OR: [
            { email, id: { not: id } },
            { username, id: { not: id } }
          ]
        }
      })

      if (duplicateUser) {
        return NextResponse.json(
          { error: 'User with this email or username already exists' },
          { status: 409 }
        )
      }
    }

    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(username && { username }),
        ...(name !== undefined && { name }),
        ...(role && { role }),
        ...(nodeId !== undefined && { nodeId }),
        ...(isActive !== undefined && { isActive }),
        // Update permissions
        ...(permissions.length > 0 && {
          userPermissions: {
            deleteMany: {},
            create: permissions.map((permissionName: string) => ({
              permission: {
                connect: { name: permissionName }
              },
              isGranted: true
            }))
          }
        })
      },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        userPermissions: {
          include: {
            permission: true
          }
        }
      }
    })

    // Transform response
    const transformedUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      name: updatedUser.name,
      role: updatedUser.role,
      nodeId: updatedUser.nodeId,
      nodeName: updatedUser.node?.name,
      isActive: updatedUser.isActive,
      lastLoginAt: updatedUser.lastLoginAt,
      createdAt: updatedUser.createdAt,
      permissions: updatedUser.userPermissions.map(up => up.permission.name)
    }

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of admin users (optional security measure)
    if (existingUser.role === UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      )
    }

    // Delete user (cascade delete will handle user permissions)
    await db.user.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}