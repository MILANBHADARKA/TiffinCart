'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function KitchensPage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const [kitchens, setKitchens] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
    } else if (isAuthenticated) {
      fetchKitchens();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchKitchens = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/customer/kitchens', {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setKitchens(result.data.kitchens);
        setAvailableCities(result.data.availableCities || []);
      } else {
        setError(result.error || 'Failed to fetch kitchens');
      }
    } catch (error) {
      console.error('Error fetching kitchens:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredKitchens = kitchens.filter(kitchen => {
    // Search in multiple fields
    const searchFields = [
      kitchen.name, 
      kitchen.description, 
      kitchen.cuisine
    ].join(' ').toLowerCase();
    const matchesSearch = searchQuery === '' || searchFields.includes(searchQuery.toLowerCase());

    // Filter by cuisine
    const matchesCuisine = selectedCuisine === 'all' || kitchen.cuisine === selectedCuisine;

    // Filter by city - case insensitive comparison
    const matchesCity = selectedCity === 'all' || 
      kitchen.address.city.toLowerCase() === selectedCity.toLowerCase();

    return matchesSearch && matchesCuisine && matchesCity;
  });

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading kitchens...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Tiffin Kitchens Near You 🍱
          </h1>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Discover delicious homemade tiffin services from local home chefs
          </p>
        </div>

        {/* Filter and Search Section */}
        <div className="mb-8 space-y-4">
          {/* Search Field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search tiffin services by name, cuisine, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                theme === 'dark' 
                  ? 'border-gray-600 bg-gray-700 text-white' 
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* City Filter */}
            <div>
              <label htmlFor="city-filter" className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                City
              </label>
              <select
                id="city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All Cities</option>
                {availableCities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Cuisine Filter */}
            <div>
              <label htmlFor="cuisine-filter" className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Cuisine Type
              </label>
              <select
                id="cuisine-filter"
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              >
                <option value="all">All Cuisines</option>
                <option value="indian">Indian</option>
                <option value="chinese">Chinese</option>
                <option value="italian">Italian</option>
                <option value="continental">Continental</option>
                <option value="mexican">Mexican</option>
                <option value="thai">Thai</option>
                <option value="japanese">Japanese</option>
                <option value="korean">Korean</option>
                <option value="mediterranean">Mediterranean</option>
              </select>
            </div>
          </div>

          {/* Filter Results Summary */}
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Showing {filteredKitchens.length} tiffin {filteredKitchens.length === 1 ? 'service' : 'services'}
            {selectedCity !== 'all' && ` in ${selectedCity}`}
            {selectedCuisine !== 'all' && ` with ${selectedCuisine} cuisine`}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Kitchen Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKitchens.map((kitchen) => (
            <Link
              key={kitchen.id}
              href={`/kitchen/${kitchen.id}`}
              className={`rounded-lg border overflow-hidden transition-all hover:shadow-lg ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="h-48 bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center relative">
                {kitchen.image ? (
                  <img 
                    src={kitchen.image} 
                    alt={kitchen.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">🍱</span>
                )}
                <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  Tiffin Service
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {kitchen.name}
                  </h3>
                  <div className="flex items-center space-x-1">
                    {kitchen.rating > 0 ? (
                      <>
                        <span className="text-yellow-500">⭐</span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {kitchen.rating.toFixed(1)}
                        </span>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({kitchen.totalReviews})
                        </span>
                      </>
                    ) : (
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        New Service
                      </span>
                    )}
                  </div>
                </div>

                <p className={`text-sm mb-3 capitalize ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {kitchen.cuisine} Tiffin • {kitchen.address.city}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1">
                      <span>🕐</span>
                      <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Delivery Times
                      </span>
                    </div>
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    Breakfast: 7-10 AM • Lunch: 12-3 PM • Dinner: 7-10 PM
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">💰</span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          From ₹{kitchen.minOrder}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">🍱</span>
                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {kitchen.totalItems || 0} tiffins
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    kitchen.isOpen 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {kitchen.isOpen ? 'Accepting Orders' : 'Closed'}
                  </span>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    theme === 'dark' ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-800'
                  }`}>
                    Advance Orders
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredKitchens.length === 0 && !loading && (
          <div className={`text-center py-12 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="text-6xl mb-4">🍱</div>
            <h3 className="text-lg font-medium mb-2">No tiffin services found</h3>
            <p className="text-sm">
              {searchQuery || selectedCuisine !== 'all' || selectedCity !== 'all' 
                ? "Try adjusting your search or filters" 
                : "No tiffin services available in your area"
              }
            </p>
            <button 
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              onClick={() => {
                setSearchQuery('');
                setSelectedCuisine('all');
                setSelectedCity('all');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default KitchensPage;
