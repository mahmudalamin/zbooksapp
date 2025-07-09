// components/admin/CouponsTable.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Copy, MoreHorizontal } from 'lucide-react'
import toast from 'react-hot-toast'

interface Coupon {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  value: number
  minimumAmount: number | null
  maximumDiscount: number | null
  usageLimit: number | null
  usedCount: number
  isActive: boolean
  validFrom: Date
  validUntil: Date | null
  createdAt: Date
}

interface CouponsTableProps {
  coupons: Coupon[]
}

// Consistent date formatting function
const formatDate = (date: Date | string) => {
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  return `${month}/${day}/${year}`
}

export default function CouponsTable({ coupons: initialCoupons }: CouponsTableProps) {
  const [coupons, setCoupons] = useState(initialCoupons)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const isExpired = (coupon: Coupon) => {
    return coupon.validUntil && new Date(coupon.validUntil) < new Date()
  }

  const isUsageLimitReached = (coupon: Coupon) => {
    return coupon.usageLimit && coupon.usedCount >= coupon.usageLimit
  }

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.isActive) return { status: 'Inactive', color: 'bg-gray-100 text-gray-800' }
    if (isExpired(coupon)) return { status: 'Expired', color: 'bg-red-100 text-red-800' }
    if (isUsageLimitReached(coupon)) return { status: 'Used Up', color: 'bg-orange-100 text-orange-800' }
    return { status: 'Active', color: 'bg-green-100 text-green-800' }
  }

  const formatCouponValue = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'PERCENTAGE':
        return `${coupon.value}%`
      case 'FIXED_AMOUNT':
        return `$${coupon.value.toFixed(2)}`
      case 'FREE_SHIPPING':
        return 'Free Shipping'
      default:
        return coupon.value
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Coupon code copied to clipboard')
  }

  const handleDelete = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete coupon')

      setCoupons(prev => prev.filter(c => c.id !== couponId))
      toast.success('Coupon deleted successfully')
    } catch (error) {
      toast.error('Failed to delete coupon')
    }
  }

  const handleToggleStatus = async (couponId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) throw new Error('Failed to update coupon')

      setCoupons(prev =>
        prev.map(c => c.id === couponId ? { ...c, isActive: !isActive } : c)
      )
      toast.success('Coupon updated successfully')
    } catch (error) {
      toast.error('Failed to update coupon')
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type & Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valid Period
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCoupons.map((coupon) => {
              const statusInfo = getCouponStatus(coupon)
              return (
                <tr key={coupon.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 font-mono">
                          {coupon.code}
                        </div>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-1"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{formatCouponValue(coupon)}</div>
                      <div className="text-gray-500 capitalize">
                        {coupon.type.replace('_', ' ').toLowerCase()}
                      </div>
                      {coupon.minimumAmount && (
                        <div className="text-xs text-gray-400">
                          Min: ${coupon.minimumAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{coupon.usedCount} used</div>
                      {coupon.usageLimit && (
                        <div className="text-gray-500">
                          of {coupon.usageLimit} limit
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>From: {formatDate(coupon.validFrom)}</div>
                      {coupon.validUntil && (
                        <div>Until: {formatDate(coupon.validUntil)}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                    >
                      {statusInfo.status}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/coupons/${coupon.id}/edit`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {filteredCoupons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No coupons found.</p>
        </div>
      )}
    </div>
  )
}