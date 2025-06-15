// app/admin/products/page.tsx
import { prisma } from '@/lib/db'
import EnhancedProductsPage from '@/components/admin/EnhancedProductsPage'

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        _count: { select: { orderItems: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    })
  ])

  return <EnhancedProductsPage initialProducts={products} categories={categories} />
}