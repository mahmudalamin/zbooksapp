<<<<<<< HEAD
// app/api/admin/coupons/[id]/route.ts - Complete file
=======

// app/api/admin/coupons/[id]/route.ts
>>>>>>> 4770f04f4af9ae829292e004a72dd9d7d08a5095
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
<<<<<<< HEAD

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const coupon = await prisma.coupon.findUnique({
      where: { id }
=======
import { z } from 'zod'

const couponUpdateSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']).optional(),
  value: z.number().min(0).optional(),
  minimumAmount: z.number().min(0).optional(),
  maximumDiscount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  validFrom: z.date().optional(),
  validUntil: z.date().optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: params.id }
>>>>>>> 4770f04f4af9ae829292e004a72dd9d7d08a5095
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 })
    }

    return NextResponse.json(coupon)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupon' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
<<<<<<< HEAD
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== COUPON UPDATE API CALLED ===')
    
=======
  { params }: { params: { id: string } }
) {
  try {
>>>>>>> 4770f04f4af9ae829292e004a72dd9d7d08a5095
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

<<<<<<< HEAD
    const { id } = await params
    const body = await request.json()
    console.log('Raw request body:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    if (!body.code || body.code.trim() === '') {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }
    
    if (!body.type || !['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING'].includes(body.type)) {
      return NextResponse.json({ error: 'Invalid coupon type' }, { status: 400 })
    }
    
    if (!body.validFrom) {
      return NextResponse.json({ error: 'Valid from date is required' }, { status: 400 })
    }

    // Handle value based on coupon type
    let value: number;
    if (body.type === 'FREE_SHIPPING') {
      value = 0;
    } else {
      value = parseFloat(body.value);
      if (isNaN(value) || value <= 0) {
        return NextResponse.json({ 
          error: `Value must be greater than 0 for ${body.type.toLowerCase()} coupons` 
        }, { status: 400 })
      }
      
      if (body.type === 'PERCENTAGE' && value > 100) {
        return NextResponse.json({ error: 'Percentage cannot exceed 100' }, { status: 400 })
      }
    }

    // Check if coupon code already exists (excluding current coupon)
    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        code: body.code.toUpperCase(),
        NOT: { id }
      }
    })

    if (existingCoupon) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }

    // Additional validation for date logic
    if (body.validFrom && body.validUntil) {
      const fromDate = new Date(body.validFrom)
      const untilDate = new Date(body.validUntil)
      if (fromDate >= untilDate) {
        return NextResponse.json({ 
          error: 'Valid from date must be before valid until date' 
        }, { status: 400 })
      }
    }

    // Prepare data for database
    const dbData = {
      code: body.code.toUpperCase(),
      type: body.type as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING',
      value: value,
      minimumAmount: body.minimumAmount ? parseFloat(body.minimumAmount) : null,
      maximumDiscount: (body.type === 'PERCENTAGE' && body.maximumDiscount) ? parseFloat(body.maximumDiscount) : null,
      usageLimit: body.usageLimit ? parseInt(body.usageLimit) : null,
      isActive: body.isActive !== false,
      validFrom: new Date(body.validFrom),
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
    }
    
    console.log('Data being sent to database:', JSON.stringify(dbData, null, 2))

    const coupon = await prisma.coupon.update({
      where: { id },
      data: dbData
    })
    
    console.log('Updated coupon:', JSON.stringify(coupon, null, 2))

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Failed to update coupon - Full error:', error)
    
    // Proper error handling for TypeScript
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    } else {
      console.error('Unknown error type:', typeof error)
    }
    
    return NextResponse.json({ 
      error: 'Failed to update coupon',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
=======
    const body = await request.json()
    const validatedData = couponUpdateSchema.parse(body)

    // Check if coupon code already exists (excluding current coupon)
    if (validatedData.code) {
      const existingCoupon = await prisma.coupon.findFirst({
        where: {
          code: validatedData.code,
          NOT: { id: params.id }
        }
      })

      if (existingCoupon) {
        return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
      }
    }

    // For free shipping, set value to 0
    if (validatedData.type === 'FREE_SHIPPING') {
      validatedData.value = 0
    }

    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json(coupon)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
>>>>>>> 4770f04f4af9ae829292e004a72dd9d7d08a5095
  }
}

export async function PATCH(
  request: NextRequest,
<<<<<<< HEAD
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('=== COUPON PATCH API CALLED ===')
    
=======
  { params }: { params: { id: string } }
) {
  try {
>>>>>>> 4770f04f4af9ae829292e004a72dd9d7d08a5095
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

<<<<<<< HEAD
    const { id } = await params
    const body = await request.json()
    console.log('PATCH request body:', JSON.stringify(body, null, 2))
    
    // For PATCH, we handle partial updates
    const updateData: any = {}
    
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive
    }
    
    if (body.validFrom && typeof body.validFrom === 'string') {
      updateData.validFrom = new Date(body.validFrom)
    }
    
    if (body.validUntil && typeof body.validUntil === 'string') {
      updateData.validUntil = new Date(body.validUntil)
    }
    
    // Handle other simple field updates
    if (body.minimumAmount !== undefined) {
      updateData.minimumAmount = body.minimumAmount ? parseFloat(body.minimumAmount) : null
    }
    
    if (body.maximumDiscount !== undefined) {
      updateData.maximumDiscount = body.maximumDiscount ? parseFloat(body.maximumDiscount) : null
    }
    
    if (body.usageLimit !== undefined) {
      updateData.usageLimit = body.usageLimit ? parseInt(body.usageLimit) : null
    }
    
    console.log('Update data:', JSON.stringify(updateData, null, 2))
    
    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData
    })
    
    console.log('Updated coupon:', JSON.stringify(coupon, null, 2))

    return NextResponse.json(coupon)
  } catch (error) {
    console.error('Failed to patch coupon - Full error:', error)
    
    // Proper error handling for TypeScript
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    } else {
      console.error('Unknown error type:', typeof error)
    }
    
    return NextResponse.json({ 
      error: 'Failed to update coupon',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
=======
    const body = await request.json()
    
    const coupon = await prisma.coupon.update({
      where: { id: params.id },
      data: body
    })

    return NextResponse.json(coupon)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
>>>>>>> 4770f04f4af9ae829292e004a72dd9d7d08a5095
  }
}

export async function DELETE(
  request: NextRequest,
<<<<<<< HEAD
  { params }: { params: Promise<{ id: string }> }
=======
  { params }: { params: { id: string } }
>>>>>>> 4770f04f4af9ae829292e004a72dd9d7d08a5095
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

<<<<<<< HEAD
    const { id } = await params

    await prisma.coupon.delete({
      where: { id }
=======
    await prisma.coupon.delete({
      where: { id: params.id }
>>>>>>> 4770f04f4af9ae829292e004a72dd9d7d08a5095
    })

    return NextResponse.json({ message: 'Coupon deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 })
  }
<<<<<<< HEAD
}
=======
}

// app/api/coupons/validate/route.ts (Public endpoint for validating coupons)
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { code, cartTotal } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    })

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Coupon is not active' }, { status: 400 })
    }

    // Check if coupon is expired
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
    }

    // Check if coupon is not yet valid
    if (new Date(coupon.validFrom) > new Date()) {
      return NextResponse.json({ error: 'Coupon is not yet valid' }, { status: 400 })
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Coupon usage limit exceeded' }, { status: 400 })
    }

    // Check minimum amount
    if (coupon.minimumAmount && cartTotal < coupon.minimumAmount) {
      return NextResponse.json({ 
        error: `Minimum order amount of $${coupon.minimumAmount.toFixed(2)} required` 
      }, { status: 400 })
    }

    // Calculate discount
    let discountAmount = 0
    let freeShipping = false

    switch (coupon.type) {
      case 'PERCENTAGE':
        discountAmount = (cartTotal * coupon.value) / 100
        if (coupon.maximumDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maximumDiscount)
        }
        break
      case 'FIXED_AMOUNT':
        discountAmount = Math.min(coupon.value, cartTotal)
        break
      case 'FREE_SHIPPING':
        freeShipping = true
        break
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        discountAmount,
        freeShipping
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 })
  }
}
>>>>>>> 4770f04f4af9ae829292e004a72dd9d7d08a5095
