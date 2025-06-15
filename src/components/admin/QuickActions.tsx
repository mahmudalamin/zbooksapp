// components/admin/QuickActions.tsx
'use client'

import { useState } from 'react'
import { Plus, Download, Upload, Settings, Bell, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function QuickActions() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = async () => {
    setIsRefreshing(true)
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Data refreshed successfully')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  const quickActions = [
    {
      name: 'Add Product',
      href: '/admin/products/new',
      icon: Plus,
      color: 'bg-blue-600 hover:bg-blue-700',
      description: 'Create a new product'
    },
    {
      name: 'Export Data',
      href: '/admin/export',
      icon: Download,
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Export products or orders'
    },
    {
      name: 'Import Data',
      href: '/admin/import',
      icon: Upload,
      color: 'bg-purple-600 hover:bg-purple-700',
      description: 'Bulk import data'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-gray-600 hover:bg-gray-700',
      description: 'Configure store settings'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`${action.color} text-white p-4 rounded-lg transition-colors group`}
          >
            <div className="flex items-center mb-2">
              <action.icon className="w-5 h-5 mr-2" />
              <span className="font-medium">{action.name}</span>
            </div>
            <p className="text-sm opacity-90">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}