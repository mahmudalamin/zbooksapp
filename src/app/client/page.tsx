// app/page.tsx (Home Page)
import { prisma } from '@/lib/db'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, TrendingUp, Users, BookOpen } from 'lucide-react'
import ProductCard from '@/components/client/products/ProductCard'

async function getHomeData() {
  const [featuredProducts, categories, stats] = await Promise.all([
    prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { category: true },
      take: 8,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.category.findMany({
      where: { isActive: true },
      take: 6,
      orderBy: { name: 'asc' }
    }),
    // Mock stats - in real app you'd calculate these
    Promise.resolve({
      totalBooks: 10000,
      happyCustomers: 5000,
      categories: 25
    })
  ])

  return { featuredProducts, categories, stats }
}

export default async function HomePage() {
  const { featuredProducts, categories, stats } = await getHomeData()

  return (
    <>
      {/* Hero Section */}
  {/* Improved Hero Section */}
<section className="relative bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-900 text-white overflow-hidden">
  <div className="container mx-auto px-4 py-24 relative z-10">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      
      {/* Text Content */}
      <div>
        <h1 className="text-5xl lg:text-7xl font-extrabold mb-6 leading-tight">
          Unlock the World of 
          <span className="block text-yellow-300 animate-pulse">Great Books</span>
        </h1>
        <p className="text-xl mb-8 text-blue-100">
          Thousands of titles waiting for you — from timeless classics to rare collectibles. 
          Discover your next read at <span className="font-semibold text-white">zBooks</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/client/products"
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-8 py-4 rounded-full font-bold shadow-lg hover:scale-105 transform transition duration-300"
          >
            Browse Now
          </Link>
          <Link
            href="/client/products?featured=true"
            className="border-2 border-yellow-300 text-yellow-300 px-8 py-4 rounded-full font-bold hover:bg-yellow-300 hover:text-blue-900 transition transform hover:scale-105"
          >
            Featured Picks
          </Link>
        </div>
      </div>

      {/* Floating Cards / Books Grid */}
      <div className="relative">
        <div className="bg-white bg-opacity-10 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-purple-400 border-opacity-30 animate-fadeIn">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] bg-gradient-to-tr from-purple-400 via-pink-400 to-yellow-300 rounded-xl animate-float shadow-md"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
        {/* Flashing Circle Decorations */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-pink-500 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-56 h-56 bg-yellow-400 rounded-full opacity-20 blur-3xl animate-ping"></div>
      </div>

    </div>
  </div>

  {/* Optional: background texture or shapes */}
  <div className="absolute inset-0 bg-[url('/images/books-pattern.svg')] opacity-10 z-0"></div>
</section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-blue-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.totalBooks.toLocaleString()}+
              </h3>
              <p className="text-gray-600">Books Available</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-green-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.happyCustomers.toLocaleString()}+
              </h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="text-purple-600" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {stats.categories}+
              </h3>
              <p className="text-gray-600">Categories</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-lg text-gray-600">Find books in your favorite genres</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/client/products?category=${category.slug}`}
                className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {category.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Books</h2>
              <p className="text-lg text-gray-600">Hand-picked favorites from our collection</p>
            </div>
            <Link
              href="/client/products?featured=true"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center"
            >
              View All
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl mb-8 text-blue-100">
            Get notified about new releases, special offers, and exclusive content
          </p>
          <form className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  )
}