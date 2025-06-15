// app/api/admin/inventory/low-stock/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: {
          lte: prisma.product.fields.lowStockThreshold
        },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockThreshold: true
      },
      orderBy: {
        stock: 'asc'
      }
    })

    return NextResponse.json(lowStockProducts)
  } catch (error) {
    console.error('Error fetching low stock products:', error)
    return NextResponse.json({ error: 'Failed to fetch low stock products' }, { status: 500 })
  }
}

