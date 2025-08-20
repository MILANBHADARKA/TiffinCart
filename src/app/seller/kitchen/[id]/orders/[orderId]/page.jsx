'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

const ORDER_STATUS = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: '✅' },
  preparing: { label: 'Preparing', color: 'bg-purple-100 text-purple-800', icon: '👨‍🍳' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800', icon: '🚚' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' }
};

const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'out_for_delivery',
  out_for_delivery: 'delivered'
};

function OrderDetailsPage() {
  const { id, orderId } = useParams();
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  
  const [order, setOrder] = useState(null);
  const [kitchen, setKitchen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      router.push('/sign-in');
    } else if (isAuthenticated && user?.role === 'seller') {
      fetchOrderDetails();
    }
  }, [isAuthenticated, isLoading, router, id, orderId]);
  
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch kitchen details first to confirm ownership
      const kitchenResponse = await fetch(`/api/seller/kitchen/${id}`, {
        credentials: 'include'
      });
      
      const kitchenResult = await kitchenResponse.json();
      
      if (!kitchenResult.success) {
        setError(kitchenResult.error || 'Failed to fetch kitchen details');
        setLoading(false);
        return;
      }
      
      setKitchen(kitchenResult.data.kitchen);
      
      // Fetch order details
      const orderResponse = await fetch(`/api/seller/order/${orderId}`, {
        credentials: 'include'
      });
      
      const orderResult = await orderResponse.json();
      
      if (!orderResult.success) {
        setError(orderResult.error || 'Failed to fetch order details');
        setLoading(false);
        return;
      }
      
      setOrder(orderResult.data.order);
      
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const updateOrderStatus = async (newStatus) => {
    try {
      setIsUpdating(true);
      
      const response = await fetch(`/api/seller/order/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          note: statusNote.trim() || undefined
        }),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setOrder(prevOrder => ({
          ...prevOrder,
          status: newStatus,
          statusHistory: [
            ...prevOrder.statusHistory,
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              note: statusNote.trim() || undefined
            }
          ]
        }));
        setStatusNote('');
      } else {
        setError(result.error || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (isLoading || loading) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (error || !order || !kitchen) {
    return (
      <div className={`min-h-screen pt-24 flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {error || 'Order not found'}
          </h2>
          <Link href={`/seller/kitchen/${id}/orders`} className="text-orange-500 hover:text-orange-600">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const orderDateTime = new Date(order.createdAt).toLocaleString();
  const isOrderFinalized = order.status === 'delivered' || order.status === 'cancelled';
  
  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Order #{order.id}
              </h1>
              <span className={`text-xs px-2.5 py-1 rounded-full ${ORDER_STATUS[order.status].color}`}>
                {ORDER_STATUS[order.status].label}
              </span>
            </div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {orderDateTime}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href={`/seller/kitchen/${id}/orders`}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back to Orders
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className={`rounded-lg shadow-sm ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order Information
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Customer
                    </p>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {order.customerId?.name || 'Customer'}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {order.customerId?.email || 'Email not available'}
                    </p>
                  </div>
                  
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Payment Method
                    </p>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {order.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {order.paymentStatus}
                    </p>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Delivery Address
                    </p>
                    <p className={`mt-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {order.deliveryAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className={`rounded-lg shadow-sm ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order Items
                </h2>
                
                <div className="border-b mb-4 pb-4 dark:border-gray-700">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {order.items.map((item, index) => (
                      <li key={index} className="py-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className={`text-lg mr-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {item.isVeg ? '🥗' : '🍖'}
                          </span>
                          <div>
                            <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {item.name}
                            </p>
                            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Qty: {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                        </div>
                        <p className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Subtotal</p>
                    <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>₹{order.subtotal.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Delivery Fee</p>
                    <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>₹{order.deliveryFee.toFixed(2)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>Tax</p>
                    <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>₹{order.tax.toFixed(2)}</p>
                  </div>
                  <div className="border-t pt-2 mt-2 dark:border-gray-700 flex justify-between items-center">
                    <p className="font-semibold">Total</p>
                    <p className="text-xl font-bold text-orange-500">₹{order.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Order Timeline */}
            <div className={`rounded-lg shadow-sm ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Order Timeline
                </h2>
                
                <div className="space-y-4">
                  {order.statusHistory.map((status, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`mt-1 rounded-full w-6 h-6 flex items-center justify-center ${
                        ORDER_STATUS[status.status].color
                      }`}>
                        <span className="text-xs">{index + 1}</span>
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center">
                          <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {ORDER_STATUS[status.status].label}
                          </p>
                          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            {new Date(status.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {new Date(status.timestamp).toLocaleDateString()}
                        </p>
                        {status.note && (
                          <p className={`mt-1 text-sm italic ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            "{status.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Update Status */}
            <div className={`rounded-lg shadow-sm mb-6 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Update Order Status
                </h2>
                
                {!isOrderFinalized ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="statusNote" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Add a note (optional)
                      </label>
                      <textarea
                        id="statusNote"
                        rows={3}
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="Add a note about this status update"
                        className={`w-full px-3 py-2 border rounded-lg ${
                          theme === 'dark' 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                      ></textarea>
                    </div>
                    
                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => updateOrderStatus(NEXT_STATUS[order.status])}
                        disabled={isUpdating}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
                      >
                        {isUpdating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          `Mark as ${ORDER_STATUS[NEXT_STATUS[order.status]].label}`
                        )}
                      </button>
                    )}
                    
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button
                        onClick={() => updateOrderStatus('cancelled')}
                        disabled={isUpdating}
                        className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        {isUpdating ? 'Updating...' : 'Cancel Order'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg ${
                    order.status === 'delivered'
                      ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {order.status === 'delivered' ? '✅' : '❌'}
                      </span>
                      <p>
                        This order has been {order.status === 'delivered' ? 'delivered' : 'cancelled'} and cannot be updated.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Customer Information */}
            <div className={`rounded-lg shadow-sm ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="p-6">
                <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Customer Information
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Name
                    </p>
                    <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {order.customerId?.name || 'Customer'}
                    </p>
                  </div>
                  
                  <div>
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email
                    </p>
                    <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                      {order.customerId?.email || 'Email not available'}
                    </p>
                  </div>
                  
                  {order.customerId?.phoneNumber && (
                    <div>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone
                      </p>
                      <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        {order.customerId.phoneNumber}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
