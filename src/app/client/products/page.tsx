// app/client/products/page.tsx (Server Component)
import { Suspense } from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import ProductCard from '@/components/client/products/ProductCard'
import ProductFilters from '@/components/client/products/ProductFilters'
import SortDropdown from '@/components/client/products/SortDropdown'
import { Filter } from 'lucide-react'

interface SearchParams {
  category?: string
  search?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
  featured?: string
  page?: string
}

async function getProducts(searchParams: SearchParams) {
  // Now searchParams is already awaited when passed to this function
  const {
    category,
    search,
    sort = 'newest',
    minPrice,
    maxPrice,
    featured,
    page = '1'
  } = searchParams

  const limit = 12
  const offset = (parseInt(page) - 1) * limit

  // Build where clause
  const where: any = { isActive: true }

  if (category) {
    const categoryData = await prisma.category.findUnique({
      where: { slug: category }
    })
    if (categoryData) {
      where.categoryId = categoryData.id
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { has: search } }
    ]
  }

  if (featured === 'true') {
    where.isFeatured = true
  }

  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseFloat(minPrice)
    if (maxPrice) where.price.lte = parseFloat(maxPrice)
  }

  // Build orderBy
  let orderBy: any = { createdAt: 'desc' }
  switch (sort) {
    case 'price-low':
      orderBy = { price: 'asc' }
      break
    case 'price-high':
      orderBy = { price: 'desc' }
      break
    case 'name':
      orderBy = { name: 'asc' }
      break
    case 'newest':
    default:
      orderBy = { createdAt: 'desc' }
      break
  }

  const [products, totalCount, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: true },
      orderBy,
      take: limit,
      skip: offset
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return { products, totalCount, totalPages, currentPage: parseInt(page), categories }
}

// Server Component - can use async/await and database calls
export default async function ProductsPage({
  searchParams: searchParamsPromise
}: {
  searchParams: Promise<SearchParams> // ✅ Now it's a Promise
}) {
  // ✅ Await searchParams before using it
  const searchParams = await searchParamsPromise
  
  const { products, totalCount, totalPages, currentPage, categories } = await getProducts(searchParams)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {searchParams.search ? `Search Results for "${searchParams.search}"` : 'All Books'}
        </h1>
        <p className="text-gray-600">
          Showing {products.length} of {totalCount} results
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <Suspense fallback={<div>Loading filters...</div>}>
            <ProductFilters categories={categories} />
          </Suspense>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort Options */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="lg:hidden flex items-center space-x-2 text-gray-600">
                <Filter size={20} />
                <span>Filters</span>
              </div>
            </div>
            
            <SortDropdown currentSort={searchParams.sort || 'newest'} />
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center">
                  <div className="flex space-x-2">
                    {currentPage > 1 && (
                      <Link
                        href={`?${new URLSearchParams({ 
                          ...searchParams, 
                          page: (currentPage - 1).toString() 
                        }).toString()}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Previous
                      </Link>
                    )}
                    
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1
                      const isActive = page === currentPage
                      
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 2 && page <= currentPage + 2)
                      ) {
                        return (
                          <Link
                            key={page}
                            href={`?${new URLSearchParams({ 
                              ...searchParams, 
                              page: page.toString() 
                            }).toString()}`}
                            className={`px-4 py-2 border rounded-lg ${
                              isActive
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </Link>
                        )
                      } else if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return <span key={page} className="px-2">...</span>
                      }
                      return null
                    })}
                    
                    {currentPage < totalPages && (
                      <Link
                        href={`?${new URLSearchParams({ 
                          ...searchParams, 
                          page: (currentPage + 1).toString() 
                        }).toString()}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-4">No products found</p>
              <Link
                href="/client/products"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View all products
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}