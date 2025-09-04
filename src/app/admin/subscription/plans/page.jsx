'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function AdminSubscriptionPlans() {
    const { user, isAuthenticated, isLoading } = useUser();
    const { theme } = useTheme();
    const router = useRouter();
    
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        isActive: true,
        features: {
            maxKitchens: 1,
            maxMenuItemsPerKitchen: 3,
            prioritySupport: false,
            analyticsAccess: false,
            customization: false
        }
    });

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
            router.push('/sign-in');
        } else if (isAuthenticated && user?.role === 'admin') {
            fetchPlans();
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/subscription/plans', {
                credentials: 'include'
            });
            const result = await response.json();
            
            if (result.success) {
                setPlans(result.data.plans);
            } else {
                setError(result.error);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
            setError('Failed to load subscription plans');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const url = editingPlan 
                ? `/api/admin/subscription/plans/${editingPlan._id}`
                : '/api/admin/subscription/plans';
            
            const method = editingPlan ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    features: {
                        ...formData.features,
                        maxKitchens: formData.features.maxKitchens === -1 ? -1 : parseInt(formData.features.maxKitchens),
                        maxMenuItemsPerKitchen: formData.features.maxMenuItemsPerKitchen === -1 ? -1 : parseInt(formData.features.maxMenuItemsPerKitchen)
                    }
                }),
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                await fetchPlans();
                closeModal();
                setError('');
            } else {
                setError(result.error);
            }
        } catch (error) {
            console.error('Error saving plan:', error);
            setError('Failed to save subscription plan');
        }
    };

    const handleEdit = (plan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            price: plan.price.toString(),
            description: plan.description || '',
            isActive: plan.isActive,
            features: { ...plan.features }
        });
        setShowModal(true);
    };

    const handleActive = async (planId, isActive) => {
        if (!confirm(`Are you sure you want to ${isActive ? 'deactivate' : 'activate'} this plan?`)) return;
        
        try {
            const response = await fetch(`/api/admin/subscription/plans/${planId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                await fetchPlans();
                setError('');
            } else {
                setError(result.error);
            }
        } catch (error) {
            console.error('Error deleting plan:', error);
            setError('Failed to delete subscription plan');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingPlan(null);
        setFormData({
            name: '',
            price: '',
            description: '',
            isActive: true,
            features: {
                maxKitchens: 1,
                maxMenuItemsPerKitchen: 3,
                prioritySupport: false,
                analyticsAccess: false,
                customization: false
            }
        });
    };

    if (loading || isLoading) {
        return (
            <div className={`min-h-screen pt-24 flex items-center justify-center ${
                theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-24 pb-12 ${
            theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Subscription Plans Management
                        </h1>
                        <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Manage subscription plans for sellers
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        Add New Plan
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div key={plan._id} className={`rounded-lg border p-6 ${
                            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                        } ${!plan.isActive ? 'opacity-50' : ''}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {plan.name}
                                    </h3>
                                    <div className="mt-2">
                                        <span className="text-3xl font-bold text-orange-500">₹{plan.price}</span>
                                        <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                            /lifetime
                                        </span>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    plan.isActive 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {plan.description && (
                                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {plan.description}
                                </p>
                            )}

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-sm">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                        {plan.features.maxKitchens === -1 ? 'Unlimited' : plan.features.maxKitchens} Kitchens
                                    </span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <span className="text-green-500 mr-2">✓</span>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                        {plan.features.maxMenuItemsPerKitchen === -1 ? 'Unlimited' : plan.features.maxMenuItemsPerKitchen} Menu Items
                                    </span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <span className={`mr-2 ${plan.features.prioritySupport ? 'text-green-500' : 'text-red-500'}`}>
                                        {plan.features.prioritySupport ? '✓' : '✗'}
                                    </span>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                        Priority Support
                                    </span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <span className={`mr-2 ${plan.features.analyticsAccess ? 'text-green-500' : 'text-red-500'}`}>
                                        {plan.features.analyticsAccess ? '✓' : '✗'}
                                    </span>
                                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                        Analytics Access
                                    </span>
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEdit(plan)}
                                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                                >
                                    Edit
                                </button>
                                {/* <button
                                    onClick={() => handleActive(plan._id)}
                                    className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                                >
                                    Deactivate
                                </button> */}
                                {/* if plan is deactivite the show actieve button other wise deactive button */}
                                <button
                                    onClick={() => handleActive(plan._id, plan.isActive)}
                                    className={`flex-1 px-3 py-2 rounded-lg text-white text-sm ${
                                        plan.isActive
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-green-500 hover:bg-green-600'
                                    }`}
                                >
                                    {plan.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>

                            <div className={`mt-4 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                                Created: {new Date(plan.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal for Add/Edit Plan */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg p-6 ${
                            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }`}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {editingPlan ? 'Edit Plan' : 'Add New Plan'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${
                                            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                        }`}>
                                            Plan Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                            className={`w-full px-3 py-2 border rounded-lg ${
                                                theme === 'dark' 
                                                    ? 'border-gray-600 bg-gray-700 text-white' 
                                                    : 'border-gray-300 bg-white text-gray-900'
                                            }`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium mb-2 ${
                                            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                        }`}>
                                            Price (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                                            required
                                            min="0"
                                            step="0.01"
                                            className={`w-full px-3 py-2 border rounded-lg ${
                                                theme === 'dark' 
                                                    ? 'border-gray-600 bg-gray-700 text-white' 
                                                    : 'border-gray-300 bg-white text-gray-900'
                                            }`}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                            className="mr-2"
                                        />
                                        <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                                            Active Plan
                                        </span>
                                    </label>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${
                                        theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                    }`}>
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        rows={3}
                                        className={`w-full px-3 py-2 border rounded-lg ${
                                            theme === 'dark' 
                                                ? 'border-gray-600 bg-gray-700 text-white' 
                                                : 'border-gray-300 bg-white text-gray-900'
                                        }`}
                                    />
                                </div>

                                {/* Features */}
                                <div>
                                    <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Plan Features
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${
                                                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                            }`}>
                                                Max Kitchens (-1 for unlimited)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.features.maxKitchens}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    features: {...formData.features, maxKitchens: parseInt(e.target.value)}
                                                })}
                                                min="-1"
                                                className={`w-full px-3 py-2 border rounded-lg ${
                                                    theme === 'dark' 
                                                        ? 'border-gray-600 bg-gray-700 text-white' 
                                                        : 'border-gray-300 bg-white text-gray-900'
                                                }`}
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${
                                                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                                            }`}>
                                                Max Menu Items per Kitchen
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.features.maxMenuItemsPerKitchen}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    features: {...formData.features, maxMenuItemsPerKitchen: parseInt(e.target.value)}
                                                })}
                                                min="-1"
                                                className={`w-full px-3 py-2 border rounded-lg ${
                                                    theme === 'dark' 
                                                        ? 'border-gray-600 bg-gray-700 text-white' 
                                                        : 'border-gray-300 bg-white text-gray-900'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.features.prioritySupport}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    features: {...formData.features, prioritySupport: e.target.checked}
                                                })}
                                                className="mr-2"
                                            />
                                            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                                                Priority Support
                                            </span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.features.analyticsAccess}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    features: {...formData.features, analyticsAccess: e.target.checked}
                                                })}
                                                className="mr-2"
                                            />
                                            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                                                Analytics Access
                                            </span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={formData.features.customization}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    features: {...formData.features, customization: e.target.checked}
                                                })}
                                                className="mr-2"
                                            />
                                            <span className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>
                                                Customization
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex space-x-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className={`flex-1 px-4 py-2 border rounded-lg ${
                                            theme === 'dark' 
                                                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                                    >
                                        {editingPlan ? 'Update Plan' : 'Create Plan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminSubscriptionPlans;
                                     