// app/orders/page.tsx (Orders List Page)
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Clock, CheckCircle, XCircle, Truck, RotateCcw } from 'lucide-react'
import { Order } from '@/types'
import AuthModal from '@/components/auth/AuthModal'

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
  PENDING: 'text-yellow-600 bg-yellow-100',
  CONFIRMED: 'text-blue-600 bg-blue-100',
  PROCESSING: 'text-purple-600 bg-purple-100',
  SHIPPED: 'text-indigo-600 bg-indigo-100',
  DELIVERED: 'text-green-600 bg-green-100',
  CANCELLED: 'text-red-600 bg-red-100',
  REFUNDED: 'text-gray-600 bg-gray-100'
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (session) {
      fetchOrders()
    } else {
      setIsLoading(false)
    }
  }, [session])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/client/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to view orders</h2>
          <p className="text-gray-600 mb-8">
            You need to be signed in to view your order history.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-8">
              When you place orders, they will appear here.
            </p>
            <Link
              href="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const StatusIcon = statusIcons[order.status as keyof typeof statusIcons]
              const statusColor = statusColors[order.status as keyof typeof statusColors]
              
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gray-50 px-6 py-4 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-gray-600">Order Number</p>
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total</p>
                          <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                          <StatusIcon className="mr-2" size={16} />
                          {order.status}
                        </div>
                        <Link
                          href={`/client/orders/${order.orderNumber}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.orderItems.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="relative w-16 h-20 flex-shrink-0">
                            <Image
                              src={item.product.images[0] || '/placeholder-book.jpg'}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/products/${item.product.slug}`}
                              className="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
                            >
                              {item.product.name}
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">
                              Quantity: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ${item.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                      
                      {order.orderItems.length > 3 && (
                        <p className="text-sm text-gray-600 text-center py-2">
                          and {order.orderItems.length - 3} more item(s)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}