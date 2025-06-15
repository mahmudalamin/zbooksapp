// components/admin/RecentOrders.tsx
import Link from 'next/link'
import { Eye } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  total: number
  status: string
  createdAt: Date
  user: {
    name: string | null
    email: string
  } | null
  orderItems: Array<{
    product: {
      name: string
    }
  }>
}

interface RecentOrdersProps {
  orders: Order[]
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800'
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800'
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
      </div>
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {orders.map((order) => (
            <li key={order.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.user?.name || order.user?.email || 'Guest'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.orderItems.length} item(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    ${order.total.toFixed(2)}
                  </p>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="px-6 py-3 bg-gray-50">
        <Link
          href="/admin/orders"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View all orders →
        </Link>
      </div>
    </div>
  )
}