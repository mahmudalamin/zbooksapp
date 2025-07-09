'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Eye, MoreHorizontal, Image as ImageIcon } from 'lucide-react'
import BulkActions from './BulkActions'
import toast from 'react-hot-toast'

// Use a type that matches what we're actually passing from EnhancedProductsPage
type ProductCardItem = {
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

interface ProductCardsProps {
  products: ProductCardItem[]
}

export default function ProductCards({ products: initialProducts }: ProductCardsProps) {
  const [products, setProducts] = useState(initialProducts)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.slug.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && product.isActive) ||
                         (statusFilter === 'inactive' && !product.isActive) ||
                         (statusFilter === 'featured' && product.isFeatured) ||
                         (statusFilter === 'low-stock' && product.stock <= 5)
    
    return matchesSearch && matchesStatus
  })

  const handleSelectAll = (checked: boolean) => {
    setSelectedProducts(checked ? filteredProducts.map(p => p.id) : [])
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    setSelectedProducts(prev => 
      checked 
        ? [...prev, productId]
        : prev.filter(id => id !== productId)
    )
  }

  const handleBulkAction = async (action: string) => {
    try {
      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          productIds: selectedProducts
        })
      })

      if (!response.ok) throw new Error('Bulk action failed')

      toast.success(`Bulk ${action} completed successfully`)
      
      // Refresh the products list
      window.location.reload()
    } catch (error) {
      toast.error('Bulk action failed')
    }
  }

  const bulkActions = [
    { value: 'activate', label: 'Activate Products' },
    { value: 'deactivate', label: 'Deactivate Products' },
    { value: 'feature', label: 'Feature Products' },
    { value: 'unfeature', label: 'Unfeature Products' },
    { value: 'delete', label: 'Delete Products', dangerous: true },
  ]

  const getMainImage = (images: string[]) => {
    return images && images.length > 0 ? images[0] : null
  }

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Filters and Search */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex space-x-4">
            <div className="max-w-md">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
              <option value="low-stock">Low Stock</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Select All</span>
            </label>
            <BulkActions
              selectedItems={selectedProducts}
              onBulkAction={handleBulkAction}
              actions={bulkActions}
            />
          </div>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="p-6">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const mainImage = getMainImage(product.images)
              const isSelected = selectedProducts.includes(product.id)
              
              return (
                <div 
                  key={product.id} 
                  className={`relative bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                    isSelected ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-3 left-3 z-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  {/* Product Image */}
                  <Link href={`/admin/products/${product.id}`}>
                    <div className="aspect-square w-full bg-gray-100 rounded-t-lg overflow-hidden">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={product.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Link 
                        href={`/admin/products/${product.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">/{product.slug}</p>

                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        {product.category?.name || 'Uncategorized'}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.comparePrice && product.comparePrice > product.price && (
                          <span className="text-sm text-gray-500 line-through">
                            ${product.comparePrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock */}
                    <div className="mb-3">
                      <span className={`text-sm ${product.stock <= 5 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                        Stock: {product.stock}
                      </span>
                    </div>

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {product.isFeatured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Featured
                        </span>
                      )}
                      {product.stock <= 5 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Low Stock
                        </span>
                      )}
                    </div>

                    {/* Sales Count */}
                    <div className="mb-3">
                      <span className="text-xs text-gray-500">
                        {product._count.orderItems} sales
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
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