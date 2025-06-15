// app/api/admin/products/details/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productIds } = await request.json()

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ error: 'Invalid product IDs' }, { status: 400 })
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        price: true,
        slug: true,
        images: true
      }
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching product details:', error)
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 })
  }
}