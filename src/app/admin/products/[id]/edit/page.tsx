// app/admin/products/[id]/edit/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import ProductForm from '@/components/admin/ProductForm'

export default async function EditProductPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      }
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  ])

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  )
}