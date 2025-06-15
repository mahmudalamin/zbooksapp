// app/products/[slug]/page.tsx (Product Detail Page)
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import ProductImages from '@/components/client/products/ProductImages'
import ProductInfo from '@/components/client/products/ProductInfo'
import ProductReviews from '@/components/client/products/ProductReviews'
import ProductCard from '@/components/client/products/ProductCard'

async function getProduct(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      category: true,
      variants: true
    }
  })

  if (!product) {
    notFound()
  }

  // Get related products
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: { not: product.id }
    },
    take: 4,
    orderBy: { createdAt: 'desc' }
  })

  return { product, relatedProducts }
}

async function getCategories() {
  return await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })
}

export default async function ProductDetailPage({
  params
}: {
  params: { slug: string }
}) {
  const [{ product, relatedProducts }, categories] = await Promise.all([
    getProduct(params.slug),
    getCategories()
  ])

  return (
 
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm">
            <li><a href="/" className="text-gray-500 hover:text-gray-700">Home</a></li>
            <li className="text-gray-500">/</li>
            <li><a href="/products" className="text-gray-500 hover:text-gray-700">Products</a></li>
            {product.category && (
              <>
                <li className="text-gray-500">/</li>
                <li>
                  <a 
                    href={`/products?category=${product.category.slug}`}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {product.category.name}
                  </a>
                </li>
              </>
            )}
            <li className="text-gray-500">/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <ProductImages images={product.images} productName={product.name} />
          <ProductInfo product={product} />
        </div>

        {/* Product Description */}
        <div className="mb-16">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Description</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

  )
}

