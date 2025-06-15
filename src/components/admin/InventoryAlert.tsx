'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

interface LowStockProduct {
  id: string
  name: string
  stock: number
  lowStockThreshold: number
}

export default function InventoryAlert() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])

  useEffect(() => {
    fetch('/api/admin/inventory/low-stock')
      .then(res => res.json())
      .then(setLowStockProducts)
  }, [])

  if (lowStockProducts.length === 0) return null

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
      <div className="flex">
        <AlertTriangle className="h-5 w-5 text-yellow-400" />
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Low Stock Alert
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>The following products are running low on stock:</p>
            <ul className="mt-1 list-disc list-inside">
              {lowStockProducts.slice(0, 5).map(product => (
                <li key={product.id}>
                  {product.name} - {product.stock} remaining
                </li>
              ))}
            </ul>
            {lowStockProducts.length > 5 && (
              <p className="mt-1">And {lowStockProducts.length - 5} more products...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}