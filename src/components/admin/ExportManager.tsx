// components/admin/ExportManager.tsx
'use client'

import { useState } from 'react'
import { Download, FileText, Calendar, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ExportManager() {
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState('products')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    includeInactive: false
  })

  const handleExport = async () => {
    setExporting(true)
    try {
      // Build query parameters properly for URLSearchParams
      const queryParams: Record<string, string> = {
        type: exportType
      }

      // Add date range if values exist
      if (dateRange.start) queryParams.start = dateRange.start
      if (dateRange.end) queryParams.end = dateRange.end

      // Add filters, converting boolean to string
      if (filters.status) queryParams.status = filters.status
      if (filters.category) queryParams.category = filters.category
      queryParams.includeInactive = filters.includeInactive.toString()

      const params = new URLSearchParams(queryParams)
      const response = await fetch(`/api/admin/export?${params}`)
      
      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${exportType}-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Export completed successfully')
    } catch (error) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Type Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Select Export Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { value: 'products', label: 'Products', description: 'Export product catalog' },
            { value: 'orders', label: 'Orders', description: 'Export order history' },
            { value: 'customers', label: 'Customers', description: 'Export customer data' },
            { value: 'analytics', label: 'Analytics', description: 'Export sales analytics' },
          ].map((type) => (
            <label
              key={type.value}
              className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                exportType === type.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                value={type.value}
                checked={exportType === type.value}
                onChange={(e) => setExportType(e.target.value)}
                className="sr-only"
              />
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                <p className="font-medium text-gray-900">{type.label}</p>
                <p className="text-xs text-gray-500">{type.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      {(exportType === 'orders' || exportType === 'analytics') && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Date Range
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Additional Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exportType === 'orders' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}

          {exportType === 'products' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {/* Categories would be loaded dynamically */}
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.includeInactive}
                    onChange={(e) => setFilters(prev => ({ ...prev, includeInactive: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Include inactive products</span>
                </label>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Export Button */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Ready to Export</h3>
            <p className="text-sm text-gray-500">
              Export your {exportType} data as a CSV file
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Download className="w-5 h-5 mr-2" />
            {exporting ? 'Exporting...' : `Export ${exportType}`}
          </button>
        </div>
      </div>
    </div>
  )
}