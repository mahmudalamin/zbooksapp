// app/api/admin/dashboard/route.ts
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
    const timeframe = searchParams.get('timeframe') || '7d'

    // Calculate date ranges
    const now = new Date()
    let startDate = new Date()
    let previousStartDate = new Date()

    switch (timeframe) {
      case '1d':
        startDate.setDate(now.getDate() - 1)
        previousStartDate.setDate(now.getDate() - 2)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        previousStartDate.setDate(now.getDate() - 14)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        previousStartDate.setDate(now.getDate() - 60)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        previousStartDate.setDate(now.getDate() - 180)
        break
    }

    // Get current period data
    const [currentRevenue, currentOrders, currentCustomers] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          paymentStatus: 'PAID'
        },
        _sum: { total: true }
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
          role: 'USER'
        }
      })
    ])

    // Get previous period data for comparison
    const [previousRevenue, previousOrders, previousCustomers] = await Promise.all([
      prisma.order.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          paymentStatus: 'PAID'
        },
        _sum: { total: true }
      }),
      prisma.order.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: previousStartDate, lt: startDate },
          role: 'USER'
        }
      })
    ])

    // Calculate changes
    const revenueChange = previousRevenue._sum.total ? 
      ((currentRevenue._sum.total || 0) - previousRevenue._sum.total) / previousRevenue._sum.total * 100 : 0

    const ordersChange = previousOrders ? 
      (currentOrders - previousOrders) / previousOrders * 100 : 0

    const customersChange = previousCustomers ? 
      (currentCustomers - previousCustomers) / previousCustomers * 100 : 0

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: startDate },
          paymentStatus: 'PAID'
        }
      },
      _sum: {
        quantity: true,
        total: true
      },
      orderBy: {
        _sum: {
          total: 'desc'
        }
      },
      take: 5
    })

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        })
        return {
          name: product?.name || 'Unknown Product',
          sales: item._sum.quantity || 0,
          revenue: item._sum.total || 0
        }
      })
    )

    // Get recent activity
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    })

    const recentActivity = recentOrders.map(order => ({
      type: 'order',
      message: `New order #${order.orderNumber} from ${order.user?.name || 'Guest'}`,
      time: order.createdAt
    }))

    // Get alerts
    const lowStockProducts = await prisma.product.count({
      where: {
        stock: {
          lte: prisma.product.fields.lowStockThreshold
        },
        isActive: true
      }
    })

    const pendingOrders = await prisma.order.count({
      where: { status: 'PENDING' }
    })

    const alerts = []
    if (lowStockProducts > 0) {
      alerts.push({
        type: 'warning' as const,
        message: 'Products running low on stock',
        count: lowStockProducts
      })
    }
    if (pendingOrders > 0) {
      alerts.push({
        type: 'info' as const,
        message: 'Orders pending processing',
        count: pendingOrders
      })
    }

    // Mock conversion rate (you'd calculate this based on your analytics)
    const conversionRate = {
      current: 2.3,
      previous: 2.1,
      change: (2.3 - 2.1) / 2.1 * 100
    }

    const dashboardData = {
      revenue: {
        current: currentRevenue._sum.total || 0,
        previous: previousRevenue._sum.total || 0,
        change: revenueChange
      },
      orders: {
        current: currentOrders,
        previous: previousOrders,
        change: ordersChange
      },
      customers: {
        current: currentCustomers,
        previous: previousCustomers,
        change: customersChange
      },
      conversionRate,
      topProducts: topProductsWithDetails,
      recentActivity,
      alerts
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}

