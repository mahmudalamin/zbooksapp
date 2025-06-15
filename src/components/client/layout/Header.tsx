// components/client/layout/Header.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Search, ShoppingCart, User, Menu, X, ChevronDown, BookOpen, Heart, Bell } from 'lucide-react'
import { Category } from '@/types'
import AuthModal from '../../auth/AuthModal'
import CartSidebar from '../cart/CartSidebar'

interface HeaderProps {
  categories: Category[]
}

export default function Header({ categories }: HeaderProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)
  const categoryRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Handle scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    
    // Get cart items from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const count = cart.reduce((total: number, item: any) => total + item.quantity, 0)
    setCartItemCount(count)

    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]')
      const updatedCount = updatedCart.reduce((total: number, item: any) => total + item.quantity, 0)
      setCartItemCount(updatedCount)
    }

    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-redirect admin users to admin panel
  useEffect(() => {
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
      if (!window.location.pathname.startsWith('/admin')) {
        router.push('/admin')
      }
    }
  }, [session, router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/client/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN'

  return (
    <>
      <header className={`bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'shadow-xl shadow-gray-100/50' : 'shadow-sm'
      }`}>
        
        {/* Top announcement bar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-medium">
         Announcement
        </div>

        <div className="container mx-auto px-4 lg:px-6">
          {/* Main header */}
          <div className="flex items-center justify-between py-4 lg:py-6">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-3 rounded-xl font-bold text-xl lg:text-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <BookOpen size={24} className="lg:hidden" />
                  <span className="hidden lg:inline">zBooks</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block">
                <div className="text-gray-900 font-bold text-xl lg:text-2xl">zBooks</div>
                <div className="text-gray-500 text-xs font-medium">Your Literary Journey</div>
              </div>
            </Link>

            {/* Search Bar - Desktop & Tablet */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8 lg:mx-12">
              <div className="relative w-full group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search thousands of books..."
                  className="w-full pl-6 pr-14 py-3 lg:py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-700 placeholder-gray-400 bg-gray-50/50 focus:bg-white group-hover:border-gray-300"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white hover:bg-blue-500 rounded-xl transition-all duration-300"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              
            
              

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center w-11 h-11 lg:w-12 lg:h-12 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 group"
              >
                <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-bounce">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => {
                    if (session) {
                      setIsUserMenuOpen(!isUserMenuOpen)
                    } else {
                      setIsAuthModalOpen(true)
                    }
                  }}
                  className="flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 group"
                >
                  <div className="relative">
                    <User size={22} className="group-hover:scale-110 transition-transform" />
                    {session && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  {session && (
                    <div className="hidden lg:block text-sm">
                      <div className="font-medium text-gray-900">{session.user?.name || 'Account'}</div>
                      <div className="text-xs text-gray-500">Welcome back!</div>
                    </div>
                  )}
                  <ChevronDown size={16} className={`hidden lg:block transform transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Enhanced User Dropdown */}
                {session && isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-100">
                      <div className="font-medium text-gray-900">{session.user?.name}</div>
                      <div className="text-sm text-gray-500">{session.user?.email}</div>
                    </div>
                    <div className="py-2">
                      <Link 
                        href="/client/profile" 
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User size={16} className="mr-3 text-gray-400" />
                        My Profile
                      </Link>
                      <Link 
                        href="/orders" 
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShoppingCart size={16} className="mr-3 text-gray-400" />
                        My Orders
                      </Link>
                      <Link 
                        href="/wishlist" 
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Heart size={16} className="mr-3 text-gray-400" />
                        Wishlist
                      </Link>
                      <hr className="my-2 border-gray-100" />
                      <button
                        onClick={() => signOut()}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <X size={16} className="mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden flex items-center justify-center w-11 h-11 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Enhanced Navigation - Desktop */}
          <nav className="hidden md:flex items-center justify-between py-4 border-t border-gray-100">
            <div className="flex items-center space-x-8 lg:space-x-12">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                Home
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              
              {/* Enhanced Categories Dropdown */}
              <div className="relative" ref={categoryRef}>
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
                >
                  <span>Categories</span>
                  <ChevronDown size={16} className={`transform transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
                </button>

                {isCategoryOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Browse Categories</h3>
                      <p className="text-sm text-gray-500">Discover books by genre</p>
                    </div>
                    <div className="py-2 max-h-80 overflow-y-auto">
                      <Link 
                        href="/client/products" 
                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                        onClick={() => setIsCategoryOpen(false)}
                      >
                        <BookOpen size={16} className="mr-3 text-blue-500" />
                        All Books
                      </Link>
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/client/products?category=${category.slug}`}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors pl-11"
                          onClick={() => setIsCategoryOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/client/products?featured=true" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                Featured
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link href="/client/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                About
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link href="/client/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group">
                Contact
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
            </div>

            {/* Quick actions - Desktop */}
            
          </nav>
        </div>

        {/* Enhanced Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="p-4 border-b border-gray-100">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for books..."
                  className="w-full pl-6 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-gray-50/50"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="p-4">
              <div className="space-y-1">
                <Link 
                  href="/" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen size={20} className="mr-3 text-blue-500" />
                  Home
                </Link>
                <Link 
                  href="/client/products" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Search size={20} className="mr-3 text-blue-500" />
                  All Books
                </Link>
                
                {/* Mobile Categories */}
                <div className="space-y-1 pl-4">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/client/products?category=${category.slug}`}
                      className="block px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>

                <Link 
                  href="/client/products?featured=true" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  ⭐ Featured
                </Link>
                <Link 
                  href="/client/about" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/client/contact" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>

              {/* Mobile Quick Actions */}
              
            </nav>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  )
}