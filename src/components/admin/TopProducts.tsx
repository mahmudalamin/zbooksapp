// components/admin/TopProducts.tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, Package } from 'lucide-react'

interface TopProduct {
  productId: string
  _sum: {
    quantity: number | null
  }
  _count: {
    productId: number
  }
  product?: {
    name: string
    price: number
    slug: string
  }
}

interface TopProductsProps {
  products: TopProduct[]
}

export default function TopProducts({ products: initialProducts }: TopProductsProps) {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch product details for the top products
    const fetchProductDetails = async () => {
      try {
        const productIds = initialProducts.map(p => p.productId)
        
        if (productIds.length === 0) {
          setProducts([])
          setLoading(false)
          return
        }

        const response = await fetch('/api/admin/products/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productIds })
        })

        if (response.ok) {
          const productDetails = await response.json()
          
          // Merge product details with sales data
          const enrichedProducts = initialProducts.map(product => ({
            ...product,
            product: productDetails.find((p: any) => p.id === product.productId)
          }))

          setProducts(enrichedProducts)
        } else {
          setProducts(initialProducts)
        }
      } catch (error) {
        console.error('Error fetching product details:', error)
        setProducts(initialProducts)
      } finally {
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [initialProducts])

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Top Selling Products</h3>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Top Selling Products</h3>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>

      <div className="space-y-4">
        {products.length > 0 ? (
          products.map((item, index) => (
            <div key={item.productId} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product?.name || `Product ${item.productId.slice(0, 8)}`}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.product?.price ? `$${item.product.price.toFixed(2)}` : 'Price N/A'}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {item._sum.quantity || 0} sold
                    </p>
                    <p className="text-xs text-gray-500">
                      {item._count.productId} orders
                    </p>
                  </div>
                </div>
                
                {/* Progress bar showing relative sales */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${((item._sum.quantity || 0) / (products[0]?._sum.quantity || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  {index + 1}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No sales data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Start selling products to see top performers here.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <Link
          href="/admin/analytics"
          className="text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          View detailed analytics →
        </Link>
      </div>
    </div>
  )
}
