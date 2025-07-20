'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function Header() {
  const { user, isAuthenticated, isLoading, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'customer') {
      fetchCartCount();
    }
  }, [isAuthenticated, user]);

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/customer/cart', {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setCartCount(result.data.cart.items.length || 0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      window.location.reload();
    }
  };

  const CustomerNavItems = () => (
    <>
      <Link href="/" className="nav-link">Home</Link>
      <Link href="/kitchens" className="nav-link">Kitchens</Link>
      <Link href="/orders" className="nav-link">My Orders</Link>
      <Link href="/favorites" className="nav-link">Favorites</Link>
      <Link href="/cart" className="nav-link relative">
        Cart
        {cartCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {cartCount}
          </span>
        )}
      </Link>
    </>
  );

  const SellerNavItems = () => (
    <>
      <Link href="/" className="nav-link">Home</Link>
      <Link href="/seller/kitchens" className="nav-link">My Kitchens</Link>
      <Link href="/seller/dashboard" className="nav-link">Dashboard</Link>
      <Link href="/seller/analytics" className="nav-link">Analytics</Link>
    </>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${theme === 'dark'
      ? 'bg-gray-900/95 border-gray-700'
      : 'bg-white/95 border-gray-200'
      } backdrop-blur-sm border-b`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <svg className="h-4 w-4 sm:h-6 sm:w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl lg:text-2xl font-bold">
              <span className="text-orange-600">Tifin</span>
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Cart</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {isAuthenticated && user && (
              <>
                {user.role === 'customer' ? <CustomerNavItems /> : <SellerNavItems />}
              </>
            )}
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {isLoading ? (
              <div className="animate-pulse">
                <div className={`h-8 w-20 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className={`font-medium text-sm lg:text-base ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user.name.split(' ')[0]}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ml-2 ${user.role === 'seller'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                      }`}>
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/sign-in"
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${theme === 'dark'
                    ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className={`lg:hidden border-t ${theme === 'dark' ? 'border-gray-700 bg-gray-900/95' : 'border-gray-200 bg-white/95'
            } backdrop-blur-sm`}>
            <div className="px-4 py-6 space-y-6">

              {isLoading ? (
                <div className="flex items-center space-x-3 animate-pulse">
                  <div className={`h-12 w-12 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                  <div className="flex-1">
                    <div className={`h-4 w-24 rounded mb-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                    <div className={`h-3 w-16 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
              ) : isAuthenticated && user ? (
                <div className={`flex items-center space-x-3 p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                  <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {user.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.email}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${user.role === 'seller'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors text-sm border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all text-sm"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Sign Up
                  </Link>
                </div>
              )}

              {isAuthenticated && user && (
                <div className="space-y-1">
                  <h4 className={`text-sm font-semibold mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Navigation
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {user.role === 'customer' ? (
                      <>
                        <Link
                          href="/"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">🏠</span>
                          <span className="font-medium">Home</span>
                        </Link>

                        <Link
                          href="/kitchens"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">🏪</span>
                          <span className="font-medium">Kitchens</span>
                        </Link>
                        <Link
                          href="/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">📦</span>
                          <span className="font-medium">My Orders</span>
                        </Link>
                        <Link
                          href="/favorites"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">❤️</span>
                          <span className="font-medium">Favorites</span>
                        </Link>
                        <Link
                          href="/cart"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <span className="text-xl mr-3">🛒</span>
                            <span className="font-medium">Cart</span>
                          </div>
                          {cartCount > 0 && (
                            <span className="bg-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                              {cartCount}
                            </span>
                          )}
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">🏠</span>
                          <span className="font-medium">Home</span>
                        </Link>
                        <Link
                          href="/seller/kitchens"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">🏪</span>
                          <span className="font-medium">My Kitchens</span>
                        </Link>
                        <Link
                          href="/seller/dashboard"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">📊</span>
                          <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link
                          href="/seller/analytics"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">📈</span>
                          <span className="font-medium">Analytics</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              )}

              {isAuthenticated && user && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors text-sm border ${theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .nav-link {
          @apply font-medium transition-colors text-sm lg:text-base;
          ${theme === 'dark'
          ? 'color: rgb(209 213 219); hover:color: white;'
          : 'color: rgb(55 65 81); hover:color: rgb(17 24 39);'
        }
        }
        .mobile-nav-link {
          @apply px-4 py-3 font-medium transition-colors rounded-lg text-sm;
          ${theme === 'dark'
          ? 'color: rgb(209 213 219); hover:color: white; hover:background-color: rgb(55 65 81);'
          : 'color: rgb(55 65 81); hover:color: rgb(17 24 39); hover:background-color: rgb(243 244 246);'
        }
        }
      `}</style>
    </header>
  );
}

export default Header;