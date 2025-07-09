
// app/admin/analytics/page.tsx (Fixed version without raw SQL)
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db'
import AnalyticsCharts from '@/components/admin/AnalyticsCharts'
import TopProducts from '@/components/admin/TopProducts'

export default async function AnalyticsPage() {
  // Get sales data for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  try {
    // Use simpler Prisma queries that work with all databases
    const [
      orders,
      topProducts,
      ordersByStatus
    ] = await Promise.all([
      // Get all paid orders from last 30 days
      prisma.order.findMany({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          paymentStatus: 'PAID'
        },
        select: {
          total: true,
          createdAt: true
        }
      }),
      
      // Top selling products
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        _count: { productId: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 10,
        where: {
          order: {
            paymentStatus: 'PAID'
          }
        }
      }),
      
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      })
    ])

    // Process sales data by day
    const salesByDate = new Map<string, { orders: number; revenue: number }>()
    
    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0]
      const existing = salesByDate.get(dateKey) || { orders: 0, revenue: 0 }
      salesByDate.set(dateKey, {
        orders: existing.orders + 1,
        revenue: existing.revenue + order.total
      })
    })

    // Convert to array format for charts
    const salesData = Array.from(salesByDate.entries()).map(([date, data]) => ({
      date,
      orders: data.orders,
      revenue: data.revenue
    })).sort((a, b) => a.date.localeCompare(b.date))

    // Get revenue by category (simplified approach)
    const categorizedOrders = await prisma.orderItem.findMany({
      where: {
        order: {
          paymentStatus: 'PAID'
        }
      },
      include: {
        product: {
          include: {
            category: {
              select: { name: true }
            }
          }
        }
      }
    })

    // Process revenue by category
    const revenueByCategory = new Map<string, { revenue: number; orders: Set<string> }>()
    
    categorizedOrders.forEach(item => {
      const categoryName = item.product.category?.name || 'Uncategorized'
      const existing = revenueByCategory.get(categoryName) || { revenue: 0, orders: new Set() }
      revenueByCategory.set(categoryName, {
        revenue: existing.revenue + item.total,
        orders: existing.orders.add(item.orderId)
      })
    })

    const revenueData = Array.from(revenueByCategory.entries()).map(([category, data]) => ({
      category,
      revenue: data.revenue,
      orders: data.orders.size
    })).sort((a, b) => b.revenue - a.revenue)

    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        
        <AnalyticsCharts 
          salesData={salesData}
          ordersByStatus={ordersByStatus}
          revenueByCategory={revenueData}
        />
        
        <TopProducts products={topProducts} />
      </div>
    )
  } catch (error) {
    console.error('Analytics error:', error)
    
    // Fallback UI in case of database issues
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Analytics Temporarily Unavailable
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>We are having trouble loading analytics data. Please try again later or check your database connection.</p>
                <p className="mt-1 text-xs">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Placeholder charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales Trend</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">Chart will appear here when data is available</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by Status</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">Chart will appear here when data is available</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Category</h3>
            <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
              <p className="text-gray-500">Chart will appear here when data is available</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
