import ProductForm from '@/components/admin/ProductForm'
import { prisma } from '@/lib/db'

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  )
}