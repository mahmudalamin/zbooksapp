import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronDown, Search, ShoppingCart, User, BookOpen, Heart } from 'lucide-react';

interface Category {
  name: string;
  href: string;
}

const BookStoreNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [cartCount] = useState<number>(3);
  
  const categoriesRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setIsCategoriesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  const toggleCategories = (): void => {
    setIsCategoriesOpen(!isCategoriesOpen);
    setIsUserMenuOpen(false);
  };

  const toggleUserMenu = (): void => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsCategoriesOpen(false);
  };

  const categories: Category[] = [
    { name: 'Fiction & Literature', href: '/category/fiction' },
    { name: 'Non-Fiction', href: '/category/non-fiction' },
    { name: 'Mystery & Thriller', href: '/category/mystery' },
    { name: 'Romance', href: '/category/romance' },
    { name: 'Sci-Fi & Fantasy', href: '/category/sci-fi' },
    { name: 'Children Books', href: '/category/children' },
    { name: 'Textbooks', href: '/category/textbooks' },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-80 transition-opacity">
            <BookOpen className="h-8 w-8 text-amber-600 mr-2" />
            <div className="text-2xl font-bold text-gray-900 select-none">
              zBooks
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for books, authors, genres..."
                className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent hover:bg-gray-100 transition-colors"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={toggleCategories}
                className="text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors duration-200 flex items-center rounded-md hover:bg-gray-50"
              >
                Categories
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCategoriesOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-xl py-2 z-50 border border-gray-200">
                  {categories.map((category, index) => (
                    <a
                      key={index}
                      href={category.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-200"
                      onClick={() => setIsCategoriesOpen(false)}
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a href="/bestsellers" className="text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md hover:bg-gray-50">
              Bestsellers
            </a>
            <a href="/new-arrivals" className="text-gray-700 hover:text-amber-600 px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md hover:bg-gray-50">
              New Arrivals
            </a>
            <a href="/deals" className="text-red-600 hover:text-red-700 px-3 py-2 text-sm font-medium transition-colors duration-200 font-semibold rounded-md hover:bg-red-50">
              Deals
            </a>

            {/* Wishlist */}
            <button className="text-gray-700 hover:text-amber-600 p-2 transition-colors duration-200 rounded-full hover:bg-gray-100" title="Wishlist">
              <Heart className="h-5 w-5" />
            </button>

            {/* Shopping Cart */}
            <button className="text-gray-700 hover:text-amber-600 p-2 relative transition-colors duration-200 rounded-full hover:bg-gray-100" title="Shopping Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={toggleUserMenu}
                className="text-gray-700 hover:text-amber-600 p-2 transition-colors duration-200 rounded-full hover:bg-gray-100"
                title="User Menu"
              >
                <User className="h-5 w-5" />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl py-2 z-50 border border-gray-200">
                  <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-200">
                    My Profile
                  </a>
                  <a href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-200">
                    My Orders
                  </a>
                  <a href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-200">
                    Wishlist
                  </a>
                  <hr className="my-1 border-gray-200" />
                  <a href="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-200">
                    Sign In
                  </a>
                  <a href="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600 transition-colors duration-200">
                    Sign Up
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button className="text-gray-700 hover:text-amber-600 p-2 relative transition-colors duration-200 rounded-full hover:bg-gray-100">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-amber-600 focus:outline-none focus:text-amber-600 transition-colors duration-200 p-1 rounded-md hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3 bg-white border-t border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search books..."
            className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Mobile Categories */}
            <div className="px-3 py-2">
              <button
                onClick={toggleCategories}
                className="text-gray-700 hover:text-amber-600 text-base font-medium transition-colors duration-200 flex items-center w-full rounded-md hover:bg-gray-50 px-2 py-1"
              >
                Categories
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCategoriesOpen && (
                <div className="pl-4 mt-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {categories.map((category, index) => (
                    <a
                      key={index}
                      href={category.href}
                      className="text-gray-600 hover:text-amber-600 block py-2 text-sm transition-colors duration-200 rounded-md hover:bg-amber-50 px-2"
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a href="/bestsellers" className="text-gray-700 hover:text-amber-600 block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md hover:bg-gray-50">
              Bestsellers
            </a>
            <a href="/new-arrivals" className="text-gray-700 hover:text-amber-600 block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md hover:bg-gray-50">
              New Arrivals
            </a>
            <a href="/deals" className="text-red-600 hover:text-red-700 block px-3 py-2 text-base font-medium transition-colors duration-200 font-semibold rounded-md hover:bg-red-50">
              Special Deals
            </a>
            <a href="/wishlist" className="text-gray-700 hover:text-amber-600 block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md hover:bg-gray-50">
              My Wishlist
            </a>
            <a href="/orders" className="text-gray-700 hover:text-amber-600 block px-3 py-2 text-base font-medium transition-colors duration-200 rounded-md hover:bg-gray-50">
              My Orders
            </a>
            
            <div className="px-3 py-4 space-y-3 border-t border-gray-200 mt-4">
              <button className="w-full bg-amber-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-amber-700 transition-colors duration-200 shadow-sm">
                Sign In
              </button>
              <button className="w-full border border-amber-600 text-amber-600 px-4 py-2 rounded-md text-base font-medium hover:bg-amber-50 transition-colors duration-200">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Demo Content Below Navbar */}
      <div className="bg-gray-50 min-h-screen pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to zBooks</h1>
            <p className="text-xl text-gray-600 mb-8">Discover your next favorite book in our vast collection</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <BookOpen className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vast Collection</h3>
                <p className="text-gray-600">Over 1 million books across all genres and categories</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <ShoppingCart className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Easy Shopping</h3>
                <p className="text-gray-600">Simple and secure checkout process with fast delivery</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Heart className="h-12 w-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personalized</h3>
                <p className="text-gray-600">Get recommendations based on your reading preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default BookStoreNavbar;