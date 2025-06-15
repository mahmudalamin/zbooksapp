// app/admin/categories/new/page.tsx
import CategoryForm from '@/components/admin/CategoryForm'

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Add New Category</h1>
      <CategoryForm />
    </div>
  )
}

