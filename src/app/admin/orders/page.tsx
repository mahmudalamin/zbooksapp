import { prisma } from '@/lib/db'
import OrdersTable from '@/components/admin/OrdersTable'
import OrderStatusFilter from '@/components/admin/OrderStatusFilter'

interface SearchParams {
  status?: string
  page?: string
}

export default async function OrdersPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const status = searchParams.status
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const offset = (page - 1) * limit

  const where = status && status !== 'all' ? { status: status as any } : {}

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          include: { product: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.order.count({ where })
  ])

  const totalPages = Math.ceil(totalOrders / limit)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <OrderStatusFilter currentStatus={status} />
      </div>
      
      <OrdersTable orders={orders} />
      
      {totalPages > 1 && (
        <div className="flex justify-center">
          {/* Add pagination component here */}
        </div>
      )}
    </div>
  )
}