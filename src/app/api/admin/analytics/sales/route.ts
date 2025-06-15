// app/api/admin/analytics/sales/route.ts
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

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Use Prisma's typed queries instead of raw SQL to avoid column name issues
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      select: {
        id: true,
        createdAt: true,
        total: true,
        status: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group orders by date
    const salesData = orders.reduce((acc: any[], order) => {
      const date = order.createdAt.toISOString().split('T')[0] // Get YYYY-MM-DD format
      
      const existingDay = acc.find(item => item.date === date)
      
      if (existingDay) {
        existingDay.orders += 1
        existingDay.revenue += Number(order.total)
      } else {
        acc.push({
          date,
          orders: 1,
          revenue: Number(order.total)
        })
      }
      
      return acc
    }, [])

    // Fill in missing dates with zero values
    const filledData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const existingData = salesData.find(item => item.date === dateStr)
      filledData.push({
        date: dateStr,
        orders: existingData?.orders || 0,
        revenue: existingData?.revenue || 0
      })
    }

    // Calculate summary stats
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0)
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Previous period comparison
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    
    const previousPeriodOrders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      },
      select: {
        total: true
      }
    })

    const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + Number(order.total), 0)
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

    return NextResponse.json({
      salesData: filledData,
      summary: {
        totalOrders,
        totalRevenue,
        avgOrderValue,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100 // Round to 2 decimal places
      }
    })

  } catch (error) {
    console.error('Sales analytics error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch sales data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}