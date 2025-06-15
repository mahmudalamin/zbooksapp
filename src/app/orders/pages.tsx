// app/orders/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import CustomerHeader from '@/components/navigation/CustomerHeader'
import OrdersList from '@/components/orders/OrdersList'

interface SearchParams {
  status?: string
  page?: string
}

export default async function OrdersPage({ 
  searchParams 
}: { 
  searchParams: SearchParams 
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const status = searchParams.status
  const page = parseInt(searchParams.page || '1')
  const limit = 10
  const offset = (page - 1) * limit

  const where: any = { userId: session.user.id }
  if (status && status !== 'all') {
    where.status = status
  }

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        orderItems: {
          include: {
            product: {
              select: { name: true, images: true }
            }
          }
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
    <div className="min-h-screen bg-gray-50">
      <CustomerHeader />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">View and track your order history</p>
        </div>
        
        <OrdersList 
          orders={orders} 
          currentPage={page}
          totalPages={totalPages}
          currentStatus={status}
        />
      </div>
    </div>
  )
}

