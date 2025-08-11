import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        userPermissions: true
      }
    })

    // Check if user exists and is active
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid credentials or user is inactive' },
        { status: 401 }
      )
    }

    // In a real application, you would hash the password and compare
    // For this example, we'll use a simple password check
    // In production, use proper password hashing and verification
    const isValidPassword = password === 'password' // Replace with proper password verification

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login time
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    // Transform user data for response
    const userData = {
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
      permissions: user.userPermissions.map(up => up.permission.toString())
    }

    // In a real application, you would generate and return a JWT token here
    // For this example, we'll return the user data directly
    return NextResponse.json({
      user: userData,
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}