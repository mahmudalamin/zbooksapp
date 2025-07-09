// app/api/profile/password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { hash, compare } from 'bcryptjs'
import { z } from 'zod'

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// PUT /api/profile/password - Change password
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = passwordChangeSchema.parse(body)

    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        password: true,
        email: true 
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user has a password set (OAuth users might not)
    if (!user.password) {
      return NextResponse.json({ 
        error: 'No password set. Please set up a password first.' 
      }, { status: 400 })
    }

    // Verify current password
    const isCurrentPasswordValid = await compare(validatedData.currentPassword, user.password)
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    // Check if new password is different from current
    const isSamePassword = await compare(validatedData.newPassword, user.password)
    if (isSamePassword) {
      return NextResponse.json({ 
        error: 'New password must be different from current password' 
      }, { status: 400 })
    }

    // Hash new password
    const hashedNewPassword = await hash(validatedData.newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Password changed successfully' 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors.map(e => e.message).join(', ')
      }, { status: 400 })
    }
    
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 })
  }
}

// POST /api/profile/password - Set password (for OAuth users)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const passwordSetSchema = z.object({
      newPassword: z.string().min(6, 'Password must be at least 6 characters'),
      confirmPassword: z.string().min(1, 'Confirm password is required'),
    }).refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    })

    const body = await request.json()
    const validatedData = passwordSetSchema.parse(body)

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        password: true 
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if password is already set
    if (user.password) {
      return NextResponse.json({ 
        error: 'Password already set. Use PUT method to change password.' 
      }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(validatedData.newPassword, 12)

    // Set password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Password set successfully' 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: error.errors.map(e => e.message).join(', ')
      }, { status: 400 })
    }
    
    console.error('Password set error:', error)
    return NextResponse.json({ error: 'Failed to set password' }, { status: 500 })
  }
}