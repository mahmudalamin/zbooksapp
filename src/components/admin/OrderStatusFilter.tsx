// components/admin/OrderStatusFilter.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

interface OrderStatusFilterProps {
  currentStatus?: string
}

export default function OrderStatusFilter({ currentStatus = 'all' }: OrderStatusFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const statuses = [
    { value: 'all', label: 'All Orders', count: null },
    { value: 'PENDING', label: 'Pending', count: null },
    { value: 'CONFIRMED', label: 'Confirmed', count: null },
    { value: 'PROCESSING', label: 'Processing', count: null },
    { value: 'SHIPPED', label: 'Shipped', count: null },
    { value: 'DELIVERED', label: 'Delivered', count: null },
    { value: 'CANCELLED', label: 'Cancelled', count: null },
    { value: 'REFUNDED', label: 'Refunded', count: null },
  ]

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    
    // Reset to first page when changing filters
    params.delete('page')
    
    router.push(`/admin/orders?${params.toString()}`)
  }

  return (
    <div className="flex space-x-2">
      {statuses.map((status) => (
        <button
          key={status.value}
          onClick={() => handleStatusChange(status.value)}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentStatus === status.value
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          {status.label}
          {status.count !== null && (
            <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
              currentStatus === status.value
                ? 'bg-blue-200 text-blue-800'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {status.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}