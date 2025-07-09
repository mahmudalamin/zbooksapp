// app/api/profile/addresses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const addressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  company: z.string().optional().nullable(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  type: z.enum(['SHIPPING', 'BILLING', 'BOTH']),
  isDefault: z.boolean().default(false),
})

// GET /api/profile/addresses - Get user addresses
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(addresses)
  } catch (error) {
    console.error('Address fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 })
  }
}

// POST /api/profile/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Creating address with data:', body)
    
    const validatedData = addressSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Use transaction to handle default address logic
    const address = await prisma.$transaction(async (tx) => {
      // If this is set as default, unset other defaults
      if (validatedData.isDefault) {
        await tx.address.updateMany({
          where: { 
            userId: session.user.id,
            isDefault: true
          },
          data: { isDefault: false }
        })
      }

      // Create the new address
      const newAddress = await tx.address.create({
        data: {
          ...validatedData,
          userId: session.user.id,
        }
      })
      
      console.log('Created address:', newAddress)
      return newAddress
    })

    return NextResponse.json(address, { status: 201 })
  } catch (error) {
    console.error('Address creation error:', error)
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: errorMessages
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to create address',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
