'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import TifinLogo from '../Logo/TifinLogo';

function Header() {
  const { user, isAuthenticated, isLoading, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  // Fetch cart count for customers
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await fetch('/api/customer/cart', { credentials: 'include' });
        const result = await response.json();
        if (result.success) {
          setCartCount(result.data.cart.items.length || 0);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
      }
    };

    if (isAuthenticated && user?.role === 'customer') {
      fetchCartCount();
    }
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      router.push('/sign-in'); // redirect instead of reload
    }
  };

  // Navigation links
  const navLinks = {
    customer: [
      { href: '/', label: 'Home' },
      { href: '/kitchens', label: 'Kitchens' },
      { href: '/orders', label: 'My Orders' },
      { href: '/cart', label: 'Cart', showBadge: true },
    ],
    seller: [
      { href: '/', label: 'Home' },
      { href: '/seller/kitchens', label: 'My Kitchens' },
      { href: '/seller/orders', label: 'Orders' },
      { href: '/seller/dashboard', label: 'Dashboard' },
      { href: '/seller/analytics', label: 'Analytics' },
    ],
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300
      ${theme === 'dark'
        ? 'bg-gray-900/95 border-gray-700'
        : 'bg-white/95 border-gray-200'}
      backdrop-blur-sm border-b`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <TifinLogo size="medium" />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold">
              <span className="text-orange-600">Tifin</span>
              <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Cart</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {isAuthenticated && user &&
              navLinks[user.role].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-medium transition-colors text-sm lg:text-base relative
                    ${theme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-700 hover:text-gray-900'}`}
                >
                  {link.label}
                  {link.showBadge && cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors
                ${theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Auth / Profile */}
            {isLoading ? (
              <div className="animate-pulse">
                <div className={`h-8 w-20 rounded ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
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
                    <span
                      className={`text-xs px-2 py-1 rounded-full ml-2
                        ${user.role === 'seller'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'}`}
                    >
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
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm
                    ${theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
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

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors
                ${theme === 'dark'
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-colors
                ${theme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-gray-800'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`lg:hidden border-t
            ${theme === 'dark'
              ? 'border-gray-700 bg-gray-900/95'
              : 'border-gray-200 bg-white/95'} backdrop-blur-sm`}
          >
            <div className="px-4 py-6 space-y-6">
              {/* Auth State in mobile */}
              {isAuthenticated && user ? (
                <>
                  <div className={`flex items-center space-x-3 p-4 rounded-lg border
                    ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
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
                        <span className={`text-xs px-2 py-1 rounded-full
                          ${user.role === 'seller'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Nav Links */}
                  <div className="grid grid-cols-1 gap-2">
                    {navLinks[user.role].map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors text-sm
                          text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <span>{link.label}</span>
                        {link.showBadge && cartCount > 0 && (
                          <span className="bg-orange-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                            {cartCount}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>

                  {/* Profile + Logout */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <Link
                      href="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors text-sm border
                        ${theme === 'dark'
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      View Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    href="/sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors text-sm border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all text-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
