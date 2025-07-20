'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function KitchenMenu() {
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const [kitchen, setKitchen] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addingToCart, setAddingToCart] = useState({});
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/sign-in');
    } else if (isAuthenticated && params.id) {
      fetchKitchenAndMenu();
      fetchCart();
      fetchReviews();
    }
  }, [isAuthenticated, isLoading, router, params.id]);

  const fetchKitchenAndMenu = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`/api/customer/kitchen/${params.id}`, {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setKitchen(result.data.kitchen);
        setMenuItems(result.data.menuItems);
      } else {
        setError(result.error || 'Failed to fetch kitchen data');
      }
    } catch (error) {
      console.error('Error fetching kitchen data:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/customer/cart', {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setCart(result.data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/customer/reviews?sellerId=${params.id}&type=kitchen`, {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setReviews(result.data.reviews.slice(0, 3)); // Show only first 3 reviews
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const addToCart = async (menuItem) => {
    try {
      setAddingToCart(prev => ({ ...prev, [menuItem._id]: true }));

      const response = await fetch('/api/customer/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          menuItemId: menuItem._id,
          quantity: 1
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setCart(result.data.cart);
      } else {
        alert(result.error || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Network error. Please try again.');
    } finally {
      setAddingToCart(prev => ({ ...prev, [menuItem._id]: false }));
    }
  };

  const updateCartQuantity = async (menuItemId, newQuantity) => {
    try {
      const response = await fetch('/api/customer/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          menuItemId,
          quantity: newQuantity
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setCart(result.data.cart);
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const getItemQuantityInCart = (menuItemId) => {
    if (!cart || !cart.items) return 0;
    const item = cart.items.find(item => item.menuItemId._id === menuItemId);
    return item ? item.quantity : 0;
  };

  const categories = ['all', ...new Set(menuItems.map(item => item.category))];
  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const placeOrder = async () => {
    if (cart.length === 0) return;

    try {
      const orderData = {
        sellerId: params.id,
        items: cart.map(item => ({
          menuItemId: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: getTotalAmount(),
        deliveryAddress: user.address || 'Please provide delivery address'
      };

      const response = await fetch('/api/customer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setCart([]);
        alert('Order placed successfully!');
        router.push('/orders');
      } else {
        alert(result.error || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Network error. Please try again.');
    }
  };

  if (isLoading || loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading kitchen menu...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log('Error loading kitchen:', error);
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className={`text-lg font-medium mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Error Loading Kitchen
          </h3>
          <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>
          <button
            onClick={() => router.push('/kitchens')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Back to Kitchens
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-lg border p-6 mb-8 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {kitchen?.name}
              </h1>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {kitchen?.cuisine} Cuisine • {kitchen?.isOpen ? 'Open' : 'Closed'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 mb-2">
                <span className="text-yellow-400 text-lg">★</span>
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {kitchen?.rating > 0 ? kitchen.rating.toFixed(1) : 'No ratings'}
                </span>
                <Link 
                  href={`/kitchen/${params.id}/reviews`}
                  className="text-orange-600 hover:text-orange-700 text-sm ml-2"
                >
                  ({kitchen?.totalReviews || 0} reviews)
                </Link>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                kitchen?.isOpen 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {kitchen?.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-1">
              <span>🚚</span>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                {kitchen?.deliveryTime || '30'} min delivery
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <span>💰</span>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                ₹{kitchen?.minOrder || '200'} min order
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
                      selectedCategory === category
                        ? 'bg-orange-500 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => {
                const quantityInCart = getItemQuantityInCart(item._id);
                
                return (
                  <div
                    key={item._id}
                    className={`rounded-lg border overflow-hidden transition-all hover:shadow-lg ${
                      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="h-32 bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                      <span className="text-4xl">
                        {item.category === 'main_course' ? '🍽️' : 
                         item.category === 'dessert' ? '🧁' : 
                         item.category === 'beverage' ? '🥤' : '🍜'}
                      </span>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {item.name}
                        </h3>
                        <div className="flex space-x-1">
                          {item.rating > 0 && (
                            <div className="flex items-center space-x-1">
                              <span className="text-yellow-400 text-xs">★</span>
                              <span className="text-xs text-gray-600">{item.rating.toFixed(1)}</span>
                            </div>
                          )}
                          {item.isVegetarian && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              Veg
                            </span>
                          )}
                          {item.isVegan && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              Vegan
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xl font-bold text-green-600">₹{item.price}</span>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                            {item.preparationTime} mins
                          </span>
                          {item.reviewCount > 0 && (
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                              ({item.reviewCount} reviews)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {item.isAvailable ? (
                        quantityInCart > 0 ? (
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => updateCartQuantity(item._id, quantityInCart - 1)}
                              className="w-10 h-10 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors"
                            >
                              -
                            </button>
                            <span className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {quantityInCart}
                            </span>
                            <button
                              onClick={() => updateCartQuantity(item._id, quantityInCart + 1)}
                              className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            disabled={addingToCart[item._id]}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {addingToCart[item._id] ? 'Adding...' : 'Add to Cart'}
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-medium cursor-not-allowed"
                        >
                          Not Available
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {reviews.length > 0 && (
              <div className={`mt-12 p-6 rounded-lg border ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Customer Reviews
                  </h2>
                  <Link
                    href={`/kitchen/${params.id}/reviews`}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    View all reviews →
                  </Link>
                </div>

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {review.customerId?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {review.customerId?.name || 'Anonymous'}
                            </span>
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                  key={star}
                                  className={`text-sm ${
                                    star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h5 className={`font-medium text-sm mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {review.title}
                      </h5>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className={`rounded-lg border p-6 sticky top-8 ${
              theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Your Order ({cart?.items?.length || 0} items)
              </h3>
              
              {!cart?.items?.length ? (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No items in cart
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item.menuItemId._id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {item.name}
                          </h4>
                          <p className="text-xs text-green-600">₹{item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.menuItemId._id, item.quantity - 1)}
                            className="w-6 h-6 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.menuItemId._id, item.quantity + 1)}
                            className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`border-t pt-4 mb-4 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Total: ₹{cart.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => router.push('/cart')}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all"
                  >
                    View Cart & Checkout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KitchenMenu;
