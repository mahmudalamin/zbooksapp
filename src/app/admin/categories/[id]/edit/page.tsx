// app/admin/categories/[id]/edit/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import CategoryForm from '@/components/admin/CategoryForm'

export default async function EditCategoryPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const category = await prisma.category.findUnique({
    where: { id }
  })

  if (!category) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Category</h1>
      <CategoryForm category={category} />
    </div>
  )
}