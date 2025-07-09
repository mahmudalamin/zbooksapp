// app/api/admin/coupons/route.ts - Fixed for your schema
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error('Failed to fetch coupons:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== COUPON CREATE API CALLED ===')
    
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: body.code.toUpperCase() }
    })

    if (existingCoupon) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 })
    }

    // Prepare data for database according to your schema
    const dbData = {
      code: body.code.toUpperCase(),
      type: body.type as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING',
      value: value,
      minimumAmount: body.minimumAmount ? parseFloat(body.minimumAmount) : null,
      maximumDiscount: (body.type === 'PERCENTAGE' && body.maximumDiscount) ? parseFloat(body.maximumDiscount) : null,
      usageLimit: body.usageLimit ? parseInt(body.usageLimit) : null,
      isActive: body.isActive !== false, // Default to true
      validFrom: new Date(body.validFrom),
      validUntil: body.validUntil ? new Date(body.validUntil) : null,
      // usedCount will default to 0 as per schema
    }
    
    console.log('Data being sent to database:', JSON.stringify(dbData, null, 2))

    const coupon = await prisma.coupon.create({
      data: dbData
    })
    
    console.log('Created coupon:', JSON.stringify(coupon, null, 2))

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error('Failed to create coupon - Full error:', error)
    
    // Proper error handling for TypeScript
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    } else {
      console.error('Unknown error type:', typeof error)
    }
    
    return NextResponse.json({ 
      error: 'Failed to create coupon',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}