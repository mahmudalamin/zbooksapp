// app/api/admin/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'products'
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    let csvContent = ''

    switch (type) {
      case 'products':
        csvContent = await exportProducts()
        break
      case 'orders':
        csvContent = await exportOrders(startDate, endDate)
        break
      case 'customers':
        csvContent = await exportCustomers()
        break
      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-export.csv"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

async function exportProducts(): Promise<string> {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } }
    }
  })

  const headers = [
    'ID', 'Name', 'Slug', 'Description', 'Price', 'Compare Price', 'SKU', 
    'Stock', 'Category', 'Images', 'Tags', 'Is Active', 'Is Featured', 'Created At'
  ]

  const rows = products.map(product => [
    product.id,
    product.name,
    product.slug,
    product.description || '',
    product.price,
    product.comparePrice || '',
    product.sku || '',
    product.stock,
    product.category?.name || '',
    product.images.join(','),
    product.tags.join(','),
    product.isActive,
    product.isFeatured,
    product.createdAt.toISOString()
  ])

  return [headers, ...rows].map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n')
}

async function exportOrders(startDate?: string | null, endDate?: string | null): Promise<string> {
  const whereClause: any = {}
  
  if (startDate) {
    whereClause.createdAt = { ...whereClause.createdAt, gte: new Date(startDate) }
  }
  if (endDate) {
    whereClause.createdAt = { ...whereClause.createdAt, lte: new Date(endDate) }
  }

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      user: { select: { name: true, email: true } },
      orderItems: {
        include: {
          product: { select: { name: true } }
        }
      }
    }
  })

  const headers = [
    'Order Number', 'Customer Name', 'Customer Email', 'Status', 'Payment Status',
    'Subtotal', 'Shipping', 'Tax', 'Total', 'Items', 'Created At'
  ]

  const rows = orders.map(order => [
    order.orderNumber,
    order.user?.name || 'Guest',
    order.email,
    order.status,
    order.paymentStatus,
    order.subtotal,
    order.shippingCost,
    order.taxAmount,
    order.total,
    order.orderItems.map(item => `${item.product.name} (${item.quantity})`).join('; '),
    order.createdAt.toISOString()
  ])

  return [headers, ...rows].map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n')
}

async function exportCustomers(): Promise<string> {
  const customers = await prisma.user.findMany({
    where: { role: 'USER' },
    include: {
      orders: {
        select: {
          total: true,
          status: true
        }
      }
    }
  })

  const headers = [
    'ID', 'Name', 'Email', 'Total Orders', 'Total Spent', 'Created At'
  ]

  const rows = customers.map(customer => {
    const totalSpent = customer.orders
      .filter(order => order.status === 'DELIVERED')
      .reduce((sum, order) => sum + order.total, 0)

    return [
      customer.id,
      customer.name || '',
      customer.email,
      customer.orders.length,
      totalSpent.toFixed(2),
      customer.createdAt.toISOString()
    ]
  })

  return [headers, ...rows].map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n')
}