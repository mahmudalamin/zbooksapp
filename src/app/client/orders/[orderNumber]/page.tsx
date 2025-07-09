// app/orders/[orderNumber]/page.tsx (Order Detail Page)
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, RotateCcw, MapPin, CreditCard } from 'lucide-react'

const statusIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle,
  PROCESSING: Package,
  SHIPPED: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
  REFUNDED: RotateCcw
}

const statusColors = {
  PENDING: 'text-yellow-600 bg-yellow-100 border-yellow-200',
  CONFIRMED: 'text-blue-600 bg-blue-100 border-blue-200',
  PROCESSING: 'text-purple-600 bg-purple-100 border-purple-200',
  SHIPPED: 'text-indigo-600 bg-indigo-100 border-indigo-200',
  DELIVERED: 'text-green-600 bg-green-100 border-green-200',
  CANCELLED: 'text-red-600 bg-red-100 border-red-200',
  REFUNDED: 'text-gray-600 bg-gray-100 border-gray-200'
}

async function getOrder(orderNumber: string) {
  const session = await getServerSession(authOptions)
  
 if (!session?.user) {
  redirect('/')
}

  const order = await prisma.order.findFirst({
    where: {
      orderNumber,
      userId: session.user.id
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      },
      shippingAddress: true,
      billingAddress: true,
      orderHistory: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return order
}

export default async function OrderDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ success?: string }>
}) {
  const { orderNumber } = await params
  const { success } = await searchParams
  
  const order = await getOrder(orderNumber)

  if (!order) {
    notFound()
  }

  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons]
  const statusColor = statusColors[order.status as keyof typeof statusColors]
  const isSuccess = success === 'true'

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <CheckCircle className="text-green-600 mr-3" size={24} />
              <div>
                <h2 className="text-lg font-semibold text-green-900">Order Placed Successfully!</h2>
                <p className="text-green-700 mt-1">
                  Thank you for your purchase. A confirmation email has been sent to {order.email}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/client/orders"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="mr-2" size={20} />
              Back to Orders
            </Link>
          </div>
          <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${statusColor}`}>
            <StatusIcon className="mr-2" size={18} />
            <span className="font-medium">{order.status}</span>
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-600 mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>{order.shippingCost === 0 ? 'Free' : `${order.shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span>${order.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold pt-1 border-t">
                    <span>Total:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Payment Information</h3>
                <div className="text-sm text-gray-600">
                  <div className="flex items-center">
                    <CreditCard className="mr-2" size={16} />
                    <span>Status: {order.paymentStatus}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                <div className="text-sm text-gray-600">
                  <p>{order.email}</p>
                  {order.phone && <p>{order.phone}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div className="bg-white rounded-lg shadow-sm border mb-8">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <MapPin className="text-gray-600 mr-2" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">Shipping Address</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="text-gray-700">
                <p className="font-medium">
                  {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                </p>
                <p>{order.shippingAddress.address1}</p>
                {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex items-start space-x-4">
                  <div className="relative w-20 h-26 flex-shrink-0">
                    <Image
                      src={item.product.images[0] || '/placeholder-book.jpg'}
                      alt={item.product.name}
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/client/products/${item.product.slug}`}
                      className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-gray-600 text-sm mt-1">
                      SKU: {item.product.sku || 'N/A'}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-gray-600">
                        Quantity: {item.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        ${item.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {order.orderHistory.map((history, index) => (
                <div key={history.id} className="flex items-start space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === 0 ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-600' : 'bg-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{history.status}</span>
                      <span className="text-sm text-gray-600">
                        {new Date(history.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {history.notes && (
                      <p className="text-gray-600 text-sm mt-1">{history.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          {order.status === 'DELIVERED' && (
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Leave a Review
            </button>
          )}
          {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 mr-3 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                <p className="text-sm font-medium">If you want to cancel your order, please contact our customer service.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}