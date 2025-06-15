import { prisma } from '@/lib/db'
import DashboardStats from '@/components/admin/DashboardStats'
import RecentOrders from '@/components/admin/RecentOrders'
import SalesChart from '@/components/admin/SalesChart'

export default async function AdminDashboard() {
  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenue,
    recentOrders
  ] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'PAID' }
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          include: { product: { select: { name: true } } }
        }
      }
    })
  ])

  const stats = [
    { name: 'Total Products', value: totalProducts, change: '+12%' },
    { name: 'Total Orders', value: totalOrders, change: '+8%' },
    { name: 'Total Customers', value: totalCustomers, change: '+23%' },
    { name: 'Total Revenue', value: `$${totalRevenue._sum.total?.toFixed(2) || '0'}`, change: '+15%' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      
      <DashboardStats stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart />
        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  )
}