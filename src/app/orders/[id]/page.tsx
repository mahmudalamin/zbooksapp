// app/orders/[id]/page.tsx
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import OrderDetailsView from '@/components/orders/OrderDetailsView'

export default async function OrderDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Please sign in to view your orders.</p>
        </div>
      </div>
    )
  }

  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              slug: true
            }
          }
        }
      },
      shippingAddress: true,
      billingAddress: true
    }
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <OrderDetailsView order={order} />
      </div>
    </div>
  )
}

