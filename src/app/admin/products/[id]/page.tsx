// app/admin/products/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Edit, ArrowLeft, Eye, ShoppingCart, Package, DollarSign, BarChart3 } from 'lucide-react'
import { prisma } from '@/lib/db'

interface ProductDetailPageProps {
  params: { id: string }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      orderItems: {
        include: {
          order: {
            select: {
              id: true,
              createdAt: true,
              status: true,
              total: true,
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        },
        orderBy: {
          order: {
            createdAt: 'desc'
          }
        },
        take: 5
      },
      _count: {
        select: {
          orderItems: true
        }
      }
    }
  })

  if (!product) {
    notFound()
  }

  const totalRevenue = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalUnitsSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/products"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Products
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-500 mt-1">/{product.slug}</p>
          </div>
          
          <div className="flex space-x-3">
            <Link
              href={`/products/${product.slug}`}
              target="_blank"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Live
            </Link>
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Product
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Product Images */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No images uploaded</p>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">SKU</dt>
                <dd className="text-sm text-gray-900">{product.sku || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="text-sm text-gray-900">{product.category?.name || 'Uncategorized'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Price</dt>
                <dd className="text-sm text-gray-900">${product.price.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Compare Price</dt>
                <dd className="text-sm text-gray-900">
                  {product.comparePrice ? `$${product.comparePrice.toFixed(2)}` : 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Stock</dt>
                <dd className={`text-sm ${product.stock <= 5 ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                  {product.stock} units
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(product.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
            
            {product.description && (
              <div className="mt-6">
                <dt className="text-sm font-medium text-gray-500 mb-2">Description</dt>
                <dd className="text-sm text-gray-900 whitespace-pre-wrap">{product.description}</dd>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            {product.orderItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {product.orderItems.map((orderItem) => (
                      <tr key={orderItem.id}>
                        <td className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800">
                          <Link href={`/admin/orders/${orderItem.order.id}`}>
                            #{orderItem.order.id.slice(-8)}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {orderItem.order.user?.name || 'Guest'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">{orderItem.quantity}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">${orderItem.price.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(orderItem.order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            orderItem.order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            orderItem.order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            orderItem.order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {orderItem.order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Visibility</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Featured</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.isFeatured ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {product.isFeatured ? 'Yes' : 'No'}
                </span>
              </div>

              {product.stock <= 5 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock Alert</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Low Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sales Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-500 bg-green-100 rounded-lg p-2 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-lg font-semibold text-gray-900">${totalRevenue.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Package className="w-8 h-8 text-blue-500 bg-blue-100 rounded-lg p-2 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Units Sold</p>
                  <p className="text-lg font-semibold text-gray-900">{totalUnitsSold}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-purple-500 bg-purple-100 rounded-lg p-2 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-lg font-semibold text-gray-900">{product._count.orderItems}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button 
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  product.isActive 
                    ? 'text-red-700 hover:bg-red-50' 
                    : 'text-green-700 hover:bg-green-50'
                }`}
              >
                {product.isActive ? 'Deactivate Product' : 'Activate Product'}
              </button>
              
              <button 
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  product.isFeatured 
                    ? 'text-gray-700 hover:bg-gray-50' 
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                {product.isFeatured ? 'Remove from Featured' : 'Mark as Featured'}
              </button>
              
              <button className="w-full text-left px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                Duplicate Product
              </button>
              
              <button className="w-full text-left px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md transition-colors">
                Delete Product
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}