'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './User.context';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useUser();
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
    kitchenDeliveries: []
  });
  const [loading, setLoading] = useState(false);

  // Fetch cart data
  const fetchCart = async () => {
    if (!isAuthenticated || user?.role !== 'customer') {
      setCart({
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        kitchenDeliveries: []
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/customer/cart', {
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setCart(result.data.cart);
      } else {
        console.error('Failed to fetch cart:', result.error);
        setCart({
          items: [],
          subtotal: 0,
          deliveryFee: 0,
          total: 0,
          kitchenDeliveries: []
        });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({
        items: [],
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
        kitchenDeliveries: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (menuItemId, quantity = 1, clearCart = false) => {
    try {
      const response = await fetch('/api/customer/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuItemId, quantity, clearCart }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        await fetchCart(); // Refresh cart data
        return { success: true };
      } else {
        return { success: false, error: result.error, data: result.data };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Update item quantity
  const updateQuantity = async (menuItemId, newQuantity) => {
    try {
      const response = await fetch('/api/customer/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ menuItemId, quantity: newQuantity }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        await fetchCart(); // Refresh cart data
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch('/api/customer/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        await fetchCart(); // Refresh cart data
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const response = await fetch('/api/customer/cart', {
        method: 'DELETE',
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setCart({
          items: [],
          subtotal: 0,
          deliveryFee: 0,
          total: 0,
          kitchenDeliveries: []
        });
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  // Get cart item count
  const getCartCount = () => {
    return cart.items ? cart.items.length : 0;
  };

  // Check if item is in cart
  const isItemInCart = (menuItemId) => {
    return cart.items ? cart.items.some(item => 
      (item.menuItemId?._id || item.menuItemId) === menuItemId
    ) : false;
  };

  // Get item quantity in cart
  const getItemQuantity = (menuItemId) => {
    const item = cart.items ? cart.items.find(item => 
      (item.menuItemId?._id || item.menuItemId) === menuItemId
    ) : null;
    return item ? item.quantity : 0;
  };

  // Load cart when user changes
  useEffect(() => {
    fetchCart();
  }, [isAuthenticated, user]);

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartCount,
    isItemInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
