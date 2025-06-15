// app/admin/orders/[id]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import OrderDetails from '@/components/admin/OrderDetails'

export default async function OrderDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              price: true,
            }
          }
        }
      },
      shippingAddress: true,
      billingAddress: true,
      orderHistory: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          Order #{order.orderNumber}
        </h1>
      </div>
      
      <OrderDetails order={order} />
    </div>
  )
}

