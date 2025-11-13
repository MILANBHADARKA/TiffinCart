'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import { useCart } from '@/context/Cart.context';
import TifinLogo from '../Logo/TifinLogo';
import { useRouter } from "next/navigation";

function Header() {
  const { user, isAuthenticated, isLoading, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const { getCartCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const router = useRouter();

  const cartCount = getCartCount();

  useEffect(() => {
    const fetchSellerSubscription = async () => {
      try {
        const response = await fetch('/api/seller/subscription/current', {
          credentials: 'include'
        });

        const result = await response.json();

        if (result.success) {
          setSubscription(result.data);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
      }
    };

    if (isAuthenticated && user?.role === 'seller') {
      fetchSellerSubscription();
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push("/sign-in");
    }
  };

  const CustomerNavItems = () => (
    <>
      <Link href="/" className="nav-link">Home</Link>
      <Link href="/kitchens" className="nav-link">Kitchens</Link>
      <Link href="/customer/orders" className="nav-link">My Orders</Link>
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
      <Link href="/seller/orders" className="nav-link">Orders</Link>
      <Link href="/seller/dashboard" className="nav-link">Dashboard</Link>
      <Link href="/seller/subscription" className="nav-link relative">
        Plans
        {subscription?.hasSubscription && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            ✓
          </span>
        )}
      </Link>
    </>
  );

  const AdminNavItems = () => (
    <>
      <Link href="/" className="nav-link">Home</Link>
      <Link href="/admin/kitchens" className="nav-link">Manage Kitchens</Link>
      <Link href="/admin/subscription/plans" className="nav-link">Subscription Plans</Link>
      <Link href="/admin/orders" className="nav-link">All Orders</Link>
      <Link href="/admin/contact" className="nav-link">Feedbacks</Link>
    </>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-100 transition-colors duration-300 ${theme === 'dark'
      ? 'bg-gray-900/95 border-gray-700'
      : 'bg-white/95 border-gray-200'
      } backdrop-blur-sm border-b`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <TifinLogo size="medium" />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold">
              <span className="text-orange-600">Tifin</span>
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Cart</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {isAuthenticated && user && (
              <>
                {user.role === 'customer' ? <CustomerNavItems /> : 
                 user.role === 'seller' ? <SellerNavItems /> : 
                 user.role === 'admin' ? <AdminNavItems /> : null}
                
                {/* Subscription Status for Sellers */}
                {user.role === 'seller' && subscription && (
                  <div className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                    subscription.hasSubscription
                      ? 'bg-green-100 text-green-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {subscription.hasSubscription 
                      ? `${subscription.currentPlan.name} Plan` 
                      : 'Free Plan'
                    }
                  </div>
                )}

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
                      : user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
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
                        : user.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
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
                          href="/customer/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">📦</span>
                          <span className="font-medium">My Orders</span>
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
                    ) : user.role === 'seller' ? (
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
                          href="/seller/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">📦</span>
                          <span className="font-medium">Orders</span>
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
                          href="/seller/subscription"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <span className="text-xl mr-3">💎</span>
                            <span className="font-medium">Subscription Plans</span>
                          </div>
                          {subscription?.hasSubscription && (
                            <span className="bg-green-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                              ✓
                            </span>
                          )}
                        </Link>
                      </>
                    ) : user.role === 'admin' ? (
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
                          href="/admin/kitchens"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">🏪</span>
                          <span className="font-medium">Manage Kitchens</span>
                        </Link>
                        <Link
                          href="/admin/subscription/plans"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">💎</span>
                          <span className="font-medium">Subscription Plans</span>
                        </Link>
                        <Link
                          href="/admin/users"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">👥</span>
                          <span className="font-medium">Manage Users</span>
                        </Link>
                        <Link
                          href="/admin/orders"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="mobile-nav-link flex items-center"
                        >
                          <span className="text-xl mr-3">📦</span>
                          <span className="font-medium">All Orders</span>
                        </Link>
                      </>
                    ) : null}
                  </div>
                </div>
              )}

              {isAuthenticated && user && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
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
        }
        .mobile-nav-link {
          @apply px-4 py-3 font-medium transition-colors rounded-lg text-sm;
        }
      `}</style>
      {/* Add explicit text color classes for nav-link and mobile-nav-link */}
      <style jsx global>{`
        .nav-link {
          color: ${theme === 'dark' ? '#d1d5db' : '#374151'};
        }
        .nav-link:hover {
          color: ${theme === 'dark' ? '#fff' : '#111827'};
        }
        .mobile-nav-link {
          color: ${theme === 'dark' ? '#d1d5db' : '#374151'};
        }
        .mobile-nav-link:hover {
          color: ${theme === 'dark' ? '#fff' : '#111827'};
          background-color: ${theme === 'dark' ? '#374151' : '#f3f4f6'};
        }
      `}</style>
    </header>
  );
}

export default Header;