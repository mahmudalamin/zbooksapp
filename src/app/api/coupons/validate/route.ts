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