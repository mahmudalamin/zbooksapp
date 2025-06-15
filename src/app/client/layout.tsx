import { ReactNode } from 'react'
import Header from '@/components/client/layout/Header'
import Footer from '@/components/client/layout/Footer'
import { prisma } from '@/lib/db'

async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
  return categories
}

export default async function ClientLayout({
  children,
}: {
  children: ReactNode
}) {
  const categories = await getCategories()

  return (
    <div className="min-h-screen flex flex-col">
      <Header categories={categories} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}