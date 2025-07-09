// app/admin/categories/page.tsx
export const dynamic = 'force-dynamic';
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/db'
import CategoriesTable from '@/components/admin/CategoriesTable'

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Link>
      </div>
      
      <CategoriesTable categories={categories} />
    </div>
  )
}

