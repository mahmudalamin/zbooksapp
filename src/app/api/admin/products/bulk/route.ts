// app/api/admin/products/bulk/route.ts
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

    const { action, productIds } = await request.json()

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Invalid product IDs' }, { status: 400 })
    }

    let result

    switch (action) {
      case 'activate':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isActive: true }
        })
        break

      case 'deactivate':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isActive: false }
        })
        break

      case 'feature':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isFeatured: true }
        })
        break

      case 'unfeature':
        result = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isFeatured: false }
        })
        break

      case 'delete':
        // Only allow deletion if products have no orders
        const productsWithOrders = await prisma.orderItem.findMany({
          where: { productId: { in: productIds } },
          select: { productId: true }
        })

        const productIdsWithOrders = new Set(productsWithOrders.map(item => item.productId))
        const deletableProductIds = productIds.filter(id => !productIdsWithOrders.has(id))

        if (deletableProductIds.length > 0) {
          result = await prisma.product.deleteMany({
            where: { id: { in: deletableProductIds } }
          })
        } else {
          return NextResponse.json(
            { error: 'Cannot delete products with existing orders' }, 
            { status: 400 }
          )
        }
        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      affectedCount: result.count || 0 
    })
  } catch (error) {
    console.error('Bulk action error:', error)
    return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 })
  }
}

