'use client';
import React, { useState } from 'react';
import { useTheme } from '@/context/Theme.context';

function ReviewForm({ order, onSubmit, onCancel }) {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState('items'); // 'items' or 'kitchen'
  const [itemReviews, setItemReviews] = useState(
    order.items.map(item => ({
      menuItemId: item.menuItemId,
      itemName: item.name,
      rating: 0,
      comment: '',
      categories: {
        taste: 0,
        freshness: 0,
        portion: 0,
        spiceLevel: 0
      }
    }))
  );
  const [kitchenReview, setKitchenReview] = useState({
    rating: 0,
    comment: '',
    categories: {
      foodQuality: 0,
      packaging: 0,
      deliveryTime: 0,
      value: 0
    }
  });

  const StarRating = ({ rating, onRatingChange, size = 'medium' }) => {
    const sizeClasses = {
      small: 'h-4 w-4',
      medium: 'h-6 w-6',
      large: 'h-8 w-8'
    };

    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`${sizeClasses[size]} transition-colors ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400`}
          >
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const updateItemReview = (index, field, value) => {
    const updatedReviews = [...itemReviews];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedReviews[index][parent][child] = value;
    } else {
      updatedReviews[index][field] = value;
    }
    setItemReviews(updatedReviews);
  };

  const updateKitchenReview = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setKitchenReview(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setKitchenReview(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = () => {
    onSubmit({
      itemReviews: itemReviews.filter(review => review.rating > 0),
      kitchenReview: kitchenReview.rating > 0 ? kitchenReview : null
    });
  };

  const isValid = () => {
    const hasItemReviews = itemReviews.some(review => review.rating > 0);
    const hasKitchenReview = kitchenReview.rating > 0;
    return hasItemReviews || hasKitchenReview;
  };

  return (
    <div className={`rounded-lg border ${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } p-6`}>
      <div className="mb-6">
        <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Review Your Order
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Help others by sharing your experience
        </p>
      </div>

      {/* Step Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setCurrentStep('items')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            currentStep === 'items'
              ? 'bg-orange-500 text-white'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-200 text-gray-700'
          }`}
        >
          Review Items ({order.items.length})
        </button>
        <button
          onClick={() => setCurrentStep('kitchen')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            currentStep === 'kitchen'
              ? 'bg-orange-500 text-white'
              : theme === 'dark'
                ? 'bg-gray-700 text-gray-300'
                : 'bg-gray-200 text-gray-700'
          }`}
        >
          Review Kitchen
        </button>
      </div>

      {/* Item Reviews */}
      {currentStep === 'items' && (
        <div className="space-y-6">
          {order.items.map((item, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {item.name}
                  </h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Quantity: {item.quantity} | ₹{item.price}
                  </p>
                </div>
                <StarRating
                  rating={itemReviews[index].rating}
                  onRatingChange={(rating) => updateItemReview(index, 'rating', rating)}
                />
              </div>

              {itemReviews[index].rating > 0 && (
                <>
                  {/* Detailed Categories */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Taste
                      </label>
                      <StarRating
                        rating={itemReviews[index].categories.taste}
                        onRatingChange={(rating) => updateItemReview(index, 'categories.taste', rating)}
                        size="small"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Freshness
                      </label>
                      <StarRating
                        rating={itemReviews[index].categories.freshness}
                        onRatingChange={(rating) => updateItemReview(index, 'categories.freshness', rating)}
                        size="small"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Portion Size
                      </label>
                      <StarRating
                        rating={itemReviews[index].categories.portion}
                        onRatingChange={(rating) => updateItemReview(index, 'categories.portion', rating)}
                        size="small"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Spice Level
                      </label>
                      <StarRating
                        rating={itemReviews[index].categories.spiceLevel}
                        onRatingChange={(rating) => updateItemReview(index, 'categories.spiceLevel', rating)}
                        size="small"
                      />
                    </div>
                  </div>

                  <textarea
                    value={itemReviews[index].comment}
                    onChange={(e) => updateItemReview(index, 'comment', e.target.value)}
                    placeholder="Share your thoughts about this item..."
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      theme === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                    }`}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Kitchen Review */}
      {currentStep === 'kitchen' && (
        <div className="space-y-6">
          <div>
            <label className={`block text-lg font-medium mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Overall Kitchen Rating
            </label>
            <StarRating
              rating={kitchenReview.rating}
              onRatingChange={(rating) => updateKitchenReview('rating', rating)}
              size="large"
            />
          </div>

          {kitchenReview.rating > 0 && (
            <>
              {/* Kitchen Categories */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Food Quality
                  </label>
                  <StarRating
                    rating={kitchenReview.categories.foodQuality}
                    onRatingChange={(rating) => updateKitchenReview('categories.foodQuality', rating)}
                    size="small"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Packaging
                  </label>
                  <StarRating
                    rating={kitchenReview.categories.packaging}
                    onRatingChange={(rating) => updateKitchenReview('categories.packaging', rating)}
                    size="small"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Delivery Time
                  </label>
                  <StarRating
                    rating={kitchenReview.categories.deliveryTime}
                    onRatingChange={(rating) => updateKitchenReview('categories.deliveryTime', rating)}
                    size="small"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Value for Money
                  </label>
                  <StarRating
                    rating={kitchenReview.categories.value}
                    onRatingChange={(rating) => updateKitchenReview('categories.value', rating)}
                    size="small"
                  />
                </div>
              </div>

              <textarea
                value={kitchenReview.comment}
                onChange={(e) => updateKitchenReview('comment', e.target.value)}
                placeholder="Share your overall experience with this kitchen..."
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'border-gray-600 bg-gray-700 text-white' 
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid()}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
}

export default ReviewForm;
