// app/api/profile/addresses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const addressUpdateSchema = z.object({
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

// GET /api/profile/addresses/[id] - Get specific address
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const address = await prisma.address.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    return NextResponse.json(address)
  } catch (error) {
    console.error('Address fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch address' }, { status: 500 })
  }
}

// PUT /api/profile/addresses/[id] - Update address
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const body = await request.json()
    console.log('Updating address with data:', body)
    
    const validatedData = addressUpdateSchema.parse(body)
    console.log('Validated update data:', validatedData)

    // Verify the address belongs to the current user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Use transaction to handle default address logic
    const updatedAddress = await prisma.$transaction(async (tx) => {
      // If this is set as default, unset other defaults
      if (validatedData.isDefault) {
        await tx.address.updateMany({
          where: { 
            userId: session.user.id,
            isDefault: true,
            NOT: { id: id }
          },
          data: { isDefault: false }
        })
      }

      // Update the address
      const updated = await tx.address.update({
        where: { id: id },
        data: validatedData
      })
      
      console.log('Updated address:', updated)
      return updated
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error('Address update error:', error)
    
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: errorMessages
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to update address',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/profile/addresses/[id] - Delete address
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify the address belongs to the current user
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })

    if (!existingAddress) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    console.log('Deleting address:', id)

    // Delete the address
    await prisma.address.delete({
      where: { id: id }
    })

    console.log('Successfully deleted address:', id)

    return NextResponse.json({ 
      success: true, 
      message: 'Address deleted successfully',
      deletedId: id 
    })
  } catch (error) {
    console.error('Address deletion error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete address',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}