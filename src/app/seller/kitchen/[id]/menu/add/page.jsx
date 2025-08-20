'use client';
import React, { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

const categories = ['Breakfast', 'Lunch', 'Dinner'];

function AddTiffinItem() {
  const { id: kitchenId } = useParams();
  const { user, isAuthenticated, isLoading } = useUser();
  const { theme } = useTheme();
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [uploadedImagePublicId, setUploadedImagePublicId] = useState('');
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: 'Lunch',
      isVeg: true,
      spiciness: 'medium',
      ingredients: '',
      isAvailable: true,
      servingSize: '1 person',
      advanceOrderHours: 3,
      // Simplified delivery settings
      deliveryCharge: 30,
      freeDeliveryAbove: 500
    }
  });

  const isVeg = watch('isVeg');
  const selectedCategory = watch('category');
  
  const handleImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file');
      setMessageType('error');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5MB');
      setMessageType('error');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setUploadingImage(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setUploadedImageUrl(result.data.url);
        setUploadedImagePublicId(result.data.publicId);
        setMessage('Image uploaded successfully!');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || 'Failed to upload image');
        setMessageType('error');
        setImagePreview('');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
      setImagePreview('');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setImagePreview('');
    setUploadedImageUrl('');
    setUploadedImagePublicId('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const onSubmit = async (data) => {
    // Convert ingredients from comma-separated string to array
    if (data.ingredients) {
      data.ingredients = data.ingredients.split(',').map(item => item.trim());
    } else {
      data.ingredients = [];
    }
    
    // Ensure price and advanceOrderHours are numbers
    data.price = parseFloat(data.price);
    data.advanceOrderHours = parseInt(data.advanceOrderHours);
    
    // Add image data if uploaded
    if (uploadedImageUrl) {
      data.image = uploadedImageUrl;
      data.imagePublicId = uploadedImagePublicId;
    }
    
    setIsSubmitting(true);
    setMessage('');
    
    try {
      const response = await fetch(`/api/seller/kitchen/${kitchenId}/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        setMessage('Tiffin item added successfully!');
        setMessageType('success');
        setTimeout(() => {
          router.push(`/seller/kitchen/${kitchenId}/menu`);
        }, 1500);
      } else {
        setMessage(result.error || 'Failed to add tiffin item');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error adding tiffin item:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated || user?.role !== 'seller') {
    router.push('/sign-in');
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 pt-24 pb-12 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Add New Tiffin Item
            </h1>
            <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Create a delicious tiffin offering for your customers
            </p>
          </div>
          <Link
            href={`/seller/kitchen/${kitchenId}/menu`}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              theme === 'dark'
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </Link>
        </div>
        
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p>{message}</p>
          </div>
        )}
        
        <div className={`rounded-lg shadow-md ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Left Column */}
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Basic Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Tiffin Name*
                      </label>
                      <input
                        id="name"
                        type="text"
                        {...register('name', { required: 'Tiffin name is required' })}
                        className={`w-full px-4 py-2 border rounded-lg ${
                          errors.name 
                            ? 'border-red-500' 
                            : theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white' 
                              : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        placeholder="e.g. Special Veg Thali, Chicken Curry Combo"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="description" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Description*
                      </label>
                      <textarea
                        id="description"
                        {...register('description', { required: 'Description is required' })}
                        rows={3}
                        className={`w-full px-4 py-2 border rounded-lg ${
                          errors.description 
                            ? 'border-red-500' 
                            : theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white' 
                              : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        placeholder="Describe your tiffin item..."
                      ></textarea>
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="price" className={`block text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Price (₹)*
                        </label>
                        <input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          {...register('price', { 
                            required: 'Price is required',
                            min: { value: 0, message: 'Price must be positive' }
                          })}
                          className={`w-full px-4 py-2 border rounded-lg ${
                            errors.price 
                              ? 'border-red-500' 
                              : theme === 'dark' 
                                ? 'border-gray-600 bg-gray-700 text-white' 
                                : 'border-gray-300 bg-white text-gray-900'
                          }`}
                          placeholder="199.99"
                        />
                        {errors.price && (
                          <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
                        )}
                      </div>
                      
                      <div>
                        <label htmlFor="servingSize" className={`block text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Serving Size
                        </label>
                        <select
                          id="servingSize"
                          {...register('servingSize')}
                          className={`w-full px-4 py-2 border rounded-lg ${
                            theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white' 
                              : 'border-gray-300 bg-white text-gray-900'
                          }`}
                        >
                          <option value="1 person">1 Person</option>
                          <option value="2 persons">2 Persons</option>
                          <option value="Family pack">Family Pack</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Meal Configuration */}
                <div>
                  <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Meal Configuration
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="category" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Meal Category*
                      </label>
                      <select
                        id="category"
                        {...register('category', { required: 'Category is required' })}
                        className={`w-full px-4 py-2 border rounded-lg ${
                          theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        {selectedCategory === 'Breakfast' && 'Delivery: 7:00 AM - 10:00 AM (Order by 8 PM previous day)'}
                        {selectedCategory === 'Lunch' && 'Delivery: 12:00 PM - 3:00 PM (Order by 9 AM same day)'}
                        {selectedCategory === 'Dinner' && 'Delivery: 7:00 PM - 10:00 PM (Order by 4 PM same day)'}
                      </p>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Food Type*
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                          isVeg === true
                            ? 'border-green-500 bg-green-50 ring-2 ring-green-500'
                            : theme === 'dark'
                              ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                              : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}>
                          <input
                            type="radio"
                            value={true}
                            {...register('isVeg')}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <div className="h-5 w-5 mr-3 flex items-center justify-center rounded-full bg-green-500 text-white">
                              <span className="text-xs">🟢</span>
                            </div>
                            <span className={`font-medium ${
                              isVeg === true ? 'text-green-900' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>Vegetarian</span>
                          </div>
                        </label>
                        
                        <label className={`relative flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                          isVeg === false
                            ? 'border-red-500 bg-red-50 ring-2 ring-red-500'
                            : theme === 'dark'
                              ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                              : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}>
                          <input
                            type="radio"
                            value={false}
                            {...register('isVeg')}
                            className="sr-only"
                          />
                          <div className="flex items-center">
                            <div className="h-5 w-5 mr-3 flex items-center justify-center rounded-full bg-red-500 text-white">
                              <span className="text-xs">🔴</span>
                            </div>
                            <span className={`font-medium ${
                              isVeg === false ? 'text-red-900' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>Non-Veg</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="spiciness" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Spiciness Level
                      </label>
                      <select
                        id="spiciness"
                        {...register('spiciness')}
                        className={`w-full px-4 py-2 border rounded-lg ${
                          theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="mild">Mild 🌶️</option>
                        <option value="medium">Medium 🌶️🌶️</option>
                        <option value="hot">Hot 🌶️🌶️🌶️</option>
                      </select>
                    </div>
                    
                    {/* UPDATED: Simplified advance order section with explanation */}
                    <div>
                      <label htmlFor="advanceOrderHours" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Preparation Time Needed (for your reference)
                      </label>
                      <select
                        id="advanceOrderHours"
                        {...register('advanceOrderHours')}
                        className={`w-full px-4 py-2 border rounded-lg ${
                          theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value={1}>1 hour preparation</option>
                        <option value={2}>2 hours preparation</option>
                        <option value={3}>3 hours preparation</option>
                        <option value={6}>6 hours preparation</option>
                        <option value={12}>Half day preparation</option>
                        <option value={24}>Full day preparation</option>
                      </select>
                      <div className={`mt-2 p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-blue-900/20 border border-blue-600' : 'bg-blue-50 border border-blue-200'
                      }`}>
                        <p className={`text-xs ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                          <strong>Note:</strong> Customer orders are managed by fixed deadlines:
                        </p>
                        <ul className={`text-xs mt-1 space-y-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                          <li>• Breakfast: Orders close at 8 PM (previous day)</li>
                          <li>• Lunch: Orders close at 9 AM (same day)</li>
                          <li>• Dinner: Orders close at 4 PM (same day)</li>
                        </ul>
                        <p className={`text-xs mt-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                          This setting helps you plan your preparation schedule.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Tiffin Photo
                  </h2>
                  
                  <div className="space-y-4">
                    {!imagePreview ? (
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          theme === 'dark' 
                            ? 'border-gray-600 hover:border-gray-500 bg-gray-700' 
                            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="text-4xl mb-2">📸</div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Click to upload tiffin photo
                        </p>
                        <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          JPG, PNG up to 5MB
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Tiffin preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <div className="text-white text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                              <p className="text-sm">Uploading...</p>
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Additional Details */}
                <div>
                  <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Additional Details
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="ingredients" className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Ingredients (comma-separated)
                      </label>
                      <textarea
                        id="ingredients"
                        {...register('ingredients')}
                        rows={3}
                        className={`w-full px-4 py-2 border rounded-lg ${
                          theme === 'dark' 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        placeholder="Rice, Dal, Vegetables, Spices, etc."
                      ></textarea>
                      <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        List main ingredients separated by commas
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="isAvailable"
                        type="checkbox"
                        {...register('isAvailable')}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isAvailable" className={`ml-2 block text-sm ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                      }`}>
                        Available for orders
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Updated Tiffin Information */}
                <div className={`p-4 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'
                }`}>
                  <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    📦 Tiffin Service Schedule
                  </h3>
                  <div className={`text-sm space-y-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Breakfast:</span>
                        <span>Order by 8 PM → Deliver 7-10 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Lunch:</span>
                        <span>Order by 9 AM → Deliver 12-3 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Dinner:</span>
                        <span>Order by 4 PM → Deliver 7-10 PM</span>
                      </div>
                    </div>
                    <div className={`mt-3 pt-3 border-t ${
                      theme === 'dark' ? 'border-gray-600' : 'border-orange-200'
                    }`}>
                      <p className="text-xs">
                        • Eco-friendly packaging included<br/>
                        • Fresh homemade preparation<br/>
                        • Fixed delivery windows for better planning
                      </p>
                    </div>
                  </div>
                </div>

                {/* NEW: Simplified Delivery Settings */}
                <div>
                  <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Delivery Settings
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="deliveryCharge" className={`block text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Delivery Charge (₹)*
                        </label>
                        <input
                          id="deliveryCharge"
                          type="number"
                          min="0"
                          step="1"
                          {...register('deliveryCharge', { 
                            required: 'Delivery charge is required',
                            min: { value: 0, message: 'Charge must be positive' }
                          })}
                          className={`w-full px-4 py-2 border rounded-lg ${
                            errors.deliveryCharge 
                              ? 'border-red-500' 
                              : theme === 'dark' 
                                ? 'border-gray-600 bg-gray-700 text-white' 
                                : 'border-gray-300 bg-white text-gray-900'
                          }`}
                          placeholder="30"
                        />
                        {errors.deliveryCharge && (
                          <p className="mt-1 text-sm text-red-500">{errors.deliveryCharge.message}</p>
                        )}
                        <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Fixed delivery fee for all orders
                        </p>
                      </div>

                      <div>
                        <label htmlFor="freeDeliveryAbove" className={`block text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                        }`}>
                          Free Delivery Above (₹)
                        </label>
                        <input
                          id="freeDeliveryAbove"
                          type="number"
                          min="0"
                          step="1"
                          {...register('freeDeliveryAbove')}
                          className={`w-full px-4 py-2 border rounded-lg ${
                            theme === 'dark' 
                              ? 'border-gray-600 bg-gray-700 text-white' 
                              : 'border-gray-300 bg-white text-gray-900'
                          }`}
                          placeholder="500"
                        />
                        <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Orders above this amount get free delivery
                        </p>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg ${
                      theme === 'dark' ? 'bg-blue-900/20 border border-blue-600' : 'bg-blue-50 border border-blue-200'
                    }`}>
                      <h4 className={`text-sm font-medium mb-2 ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'}`}>
                        💡 Delivery Fee Preview
                      </h4>
                      <div className={`text-xs space-y-1 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-700'}`}>
                        <p>• Orders below ₹{watch('freeDeliveryAbove') || 500}: ₹{watch('deliveryCharge') || 30} delivery charge</p>
                        <p>• Orders above ₹{watch('freeDeliveryAbove') || 500}: Free delivery</p>
                        <p>• Example: Order ₹400 = ₹{watch('deliveryCharge') || 30} delivery | Order ₹600 = Free delivery</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || uploadingImage}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2.5 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Tiffin...
                  </>
                ) : (
                  'Add Tiffin Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTiffinItem;