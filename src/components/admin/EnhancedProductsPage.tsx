'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Upload, Grid, List } from 'lucide-react'
import ProductsTable from '@/components/admin/ProductsTable'
import ProductCards from '@/components/admin/ProductCards'
import BulkProductImport from '@/components/admin/BulkProductImport'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  stock: number
  isActive: boolean
  isFeatured: boolean
  createdAt: Date
  images: string[]
  category?: {
    name: string
  } | null
  _count: {
    orderItems: number
  }
}

interface Category {
  id: string
  name: string
}

interface EnhancedProductsPageProps {
  initialProducts: Product[]
  categories: Category[]
}

export default function EnhancedProductsPage({ initialProducts, categories }: EnhancedProductsPageProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [showBulkImport, setShowBulkImport] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        
        <div className="flex items-center space-x-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Card View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {/* Bulk Import Button */}
          <button
            onClick={() => setShowBulkImport(true)}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </button>

          {/* Add Product Button */}
          <Link
            href="/admin/products/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Products View */}
      {viewMode === 'table' ? (
        <ProductsTable products={initialProducts} />
      ) : (
        <ProductCards products={initialProducts} />
      )}

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkProductImport
          categories={categories}
          onClose={() => setShowBulkImport(false)}
        />
      )}
    </div>
  )
}