'use client';
import React from 'react';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import TifinLogo from '../Logo/TifinLogo';

function Hero() {
  const { user, isAuthenticated, isLoading, logout } = useUser();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      window.location.reload();
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' 
        : 'bg-gradient-to-br from-orange-50 via-white to-yellow-50 text-gray-900'
    }`}>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                <TifinLogo size="large" />
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  <span className="text-orange-600">Tifin</span>
                  <span className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Cart</span>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  Fresh{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
                    Homemade
                  </span>{' '}
                  Food Delivered
                </h1>
                <p className={`text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto lg:mx-0 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Experience the warmth of home-cooked meals from local sellers. 
                  Quality ingredients, authentic flavors, delivered fresh to your doorstep.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-lg mx-auto lg:mx-0">
                {isAuthenticated ? (
                  <>
                  {user?.role === 'customer' && (
                    <Link
                      href="/kitchens"
                      className="z-99 cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base lg:text-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg text-center"
                    >
                      Browse Meals 🍽️
                    </Link>
                  )}
                    {user?.role === 'seller' && (
                      <Link
                        href="/seller/subscription"
                        className="z-99 bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base lg:text-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105 shadow-lg text-center"
                      >
                        Manage Plans 💎
                      </Link>
                    )}
                    {user?.role === 'admin' && (
                      <Link
                        href="/admin/kitchens"
                        className="z-99 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base lg:text-lg hover:from-purple-600 hover:to-indigo-600 transition-all transform hover:scale-105 shadow-lg text-center"
                      >
                        Manage Kitchens
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-up"
                      className="z-99 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base lg:text-lg hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg text-center"
                    >
                      Order Now 🚀
                    </Link>
                    <Link
                      href="/sign-up"
                      className={`z-99 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base lg:text-lg transition-all transform hover:scale-105 text-center border-2 ${
                        theme === 'dark'
                          ? 'border-white text-white hover:bg-white hover:text-gray-900'
                          : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                      }`}
                    >
                      Become a Seller 👨‍🍳
                    </Link>
                  </>
                )}
              </div>

              
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-md mx-auto lg:max-w-none">
              <div className="space-y-3 sm:space-y-4">
                <div className={`p-4 sm:p-6 rounded-2xl shadow-lg transition-transform hover:scale-105 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">🍱</div>
                  <h3 className="font-semibold text-sm sm:text-base">Traditional Thali</h3>
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Complete tiffin meals
                  </p>
                </div>
                <div className={`p-4 sm:p-6 rounded-2xl shadow-lg transition-transform hover:scale-105 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">🥘</div>
                  <h3 className="font-semibold text-sm sm:text-base">Curry Tiffin</h3>
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Spicy homemade curries
                  </p>
                </div>
              </div>
              <div className="space-y-3 sm:space-y-4 mt-6 sm:mt-8">
                <div className={`p-4 sm:p-6 rounded-2xl shadow-lg transition-transform hover:scale-105 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">🍚</div>
                  <h3 className="font-semibold text-sm sm:text-base">Rice Bowls</h3>
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Comfort rice meals
                  </p>
                </div>
                <div className={`p-4 sm:p-6 rounded-2xl shadow-lg transition-transform hover:scale-105 ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                  <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">🧁</div>
                  <h3 className="font-semibold text-sm sm:text-base">Sweet Treats</h3>
                  <p className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Homemade desserts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`py-12 sm:py-16 lg:py-20 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Why Choose TifinCart?</h2>
            <p className={`text-base sm:text-lg lg:text-xl max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              We connect you with authentic homemade tiffin meals from your neighborhood
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center p-6 sm:p-8">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">🏠</div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">Homemade Tiffins</h3>
              <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Traditional tiffin service with fresh ingredients and authentic home recipes
              </p>
            </div>
            <div className="text-center p-6 sm:p-8">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">🚚</div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">Scheduled Delivery</h3>
              <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Breakfast, lunch & dinner tiffins delivered fresh on schedule
              </p>
            </div>
            <div className="text-center p-6 sm:p-8">
              <div className="text-4xl sm:text-5xl lg:text-6xl mb-4">👨‍🍳</div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">Local Tiffin Makers</h3>
              <p className={`text-sm sm:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Support local home chefs serving authentic neighborhood tiffin flavors
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;