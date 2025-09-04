'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function SellerSubscription() {
    const { user, isAuthenticated, isLoading } = useUser();
    const { theme } = useTheme();
    const router = useRouter();
    
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
            router.push('/sign-in');
        } else if (isAuthenticated && user?.role === 'seller') {
            fetchData();
        }
    }, [isAuthenticated, isLoading, user, router]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch current subscription
            const subResponse = await fetch('/api/seller/subscription/current', {
                credentials: 'include'
            });
            const subResult = await subResponse.json();
            
            if (subResult.success) {
                setCurrentSubscription(subResult.data);
            }

            // Fetch available plans
            const plansResponse = await fetch('/api/seller/subscription/plans', {
                credentials: 'include'
            });
            const plansResult = await plansResponse.json();
            
            if (plansResult.success) {
                setPlans(plansResult.data.plans);
            }
        } catch (error) {
            console.error('Error fetching subscription data:', error);
            setError('Failed to load subscription data');
        } finally {
            setLoading(false);
        }
    };

    const canUpgrade = (plan) => {
        if (!currentSubscription?.hasSubscription) return true;
        return plan.price > currentSubscription.currentPlan.price;
    };

    const handleSubscribe = async (planId) => {
        const plan = plans.find(p => p._id === planId);
        if (!canUpgrade(plan)) {
            setError('You can only upgrade to higher-tier plans');
            return;
        }

        try {
            setProcessing(true);
            setError('');

            // Create order
            const orderResponse = await fetch('/api/seller/subscription/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId }),
                credentials: 'include'
            });

            const orderResult = await orderResponse.json();
            
            if (!orderResult.success) {
                throw new Error(orderResult.error);
            }

            // Initialize Razorpay
            const options = {
                key: orderResult.data.razorpayKeyId,
                amount: orderResult.data.amount,
                currency: orderResult.data.currency,
                name: 'TiffinCart',
                description: `${orderResult.data.plan.name} Subscription`,
                order_id: orderResult.data.orderId,
                handler: async function (response) {
                    await verifyPayment({
                        ...response,
                        planId: orderResult.data.plan.id
                    });
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || ''
                },
                theme: {
                    color: '#f97316'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Error creating subscription:', error);
            setError(error.message || 'Failed to create subscription');
        } finally {
            setProcessing(false);
        }
    };

    const verifyPayment = async (paymentData) => {
        try {
            const response = await fetch('/api/seller/subscription/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData),
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                alert('Subscription activated successfully!');
                fetchData(); // Refresh data
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            setError(error.message || 'Payment verification failed');
        }
    };

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        
        return () => {
            document.body.removeChild(script);
        };
    }, []);

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
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Current Subscription Status */}
                {currentSubscription && (
                    <div className={`mb-8 p-6 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <h2 className={`text-xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Your Current Plan
                        </h2>
                        {currentSubscription.hasSubscription ? (
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            {currentSubscription.currentPlan.name}
                                        </h3>
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                            Active
                                        </span>
                                    </div>
                                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Activated on {new Date(currentSubscription.currentPlan.activatedAt).toLocaleDateString()}
                                    </p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <div className="text-sm font-medium">Kitchens</div>
                                            <div className="text-lg font-bold text-orange-500">
                                                {currentSubscription.currentPlan.features.maxKitchens === -1 ? '∞' : currentSubscription.currentPlan.features.maxKitchens}
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <div className="text-sm font-medium">Menu Items</div>
                                            <div className="text-lg font-bold text-orange-500">
                                                {currentSubscription.currentPlan.features.maxMenuItemsPerKitchen === -1 ? '∞' : currentSubscription.currentPlan.features.maxMenuItemsPerKitchen}
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <div className="text-sm font-medium">Support</div>
                                            <div className="text-lg font-bold text-orange-500">
                                                {currentSubscription.currentPlan.features.prioritySupport ? '✓' : '✗'}
                                            </div>
                                        </div>
                                        <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                            <div className="text-sm font-medium">Analytics</div>
                                            <div className="text-lg font-bold text-orange-500">
                                                {currentSubscription.currentPlan.features.analyticsAccess ? '✓' : '✗'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0">
                                    <div className="text-right">
                                        <div className="text-3xl font-bold text-orange-500">₹{currentSubscription.currentPlan.price}</div>
                                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>lifetime</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        Free Plan
                                    </h3>
                                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        Limited features • 1 Kitchen • 3 Menu Items per Kitchen
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-green-500">₹0</div>
                                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>forever</div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="text-center mb-12">
                    <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {currentSubscription?.hasSubscription ? 'Upgrade Your Plan' : 'Choose Your Plan'}
                    </h1>
                    <p className={`mt-4 text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {currentSubscription?.hasSubscription 
                            ? 'Unlock more features for your tiffin business'
                            : 'Unlock more features for your tiffin business'
                        }
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 text-sm">{error}</p>
                    </div>
                )}

                {/* Free Plan */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                    <div className={`rounded-lg border p-6 ${
                        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                        <div className="text-center">
                            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Free Plan
                            </h3>
                            <div className="mt-4">
                                <span className="text-4xl font-bold text-green-500">₹0</span>
                                <span className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>/forever</span>
                            </div>
                        </div>
                        
                        <ul className={`mt-6 space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                1 Kitchen Maximum
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-500 mr-2">✓</span>
                                3 Menu Items per Kitchen
                            </li>
                            <li className="flex items-center">
                                <span className="text-red-500 mr-2">✗</span>
                                Priority Support
                            </li>
                            <li className="flex items-center">
                                <span className="text-red-500 mr-2">✗</span>
                                Analytics Dashboard
                            </li>
                        </ul>
                        
                        <div className="mt-8">
                            <button
                                disabled
                                className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                            >
                                Current Plan
                            </button>
                        </div>
                    </div>

                    {/* Subscription Plans */}
                    {plans.map((plan) => {
                        const isCurrentPlan = currentSubscription?.hasSubscription && 
                                            currentSubscription.currentPlan.id === plan._id;
                        const canUpgradeToThis = canUpgrade(plan);
                        
                        return (
                            <div key={plan._id} className={`rounded-lg border p-6 relative ${
                                isCurrentPlan 
                                    ? theme === 'dark' ? 'bg-green-900/20 border-green-600' : 'bg-green-50 border-green-300'
                                    : theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                            } ${!canUpgradeToThis && !isCurrentPlan ? 'opacity-50' : ''}`}>
                                {isCurrentPlan && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                            Current Plan
                                        </span>
                                    </div>
                                )}
                                
                                {!isCurrentPlan && canUpgradeToThis && plan.name === 'Pro' && (
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                            Recommended
                                        </span>
                                    </div>
                                )}
                                
                                <div className="text-center">
                                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                        {plan.name}
                                    </h3>
                                    <div className="mt-4">
                                        <span className="text-4xl font-bold text-orange-500">₹{plan.price}</span>
                                        <span className={`text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                            /lifetime
                                        </span>
                                    </div>
                                </div>
                                
                                <ul className={`mt-6 space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        {plan.features.maxKitchens === -1 ? 'Unlimited' : plan.features.maxKitchens} Kitchens
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        {plan.features.maxMenuItemsPerKitchen === -1 ? 'Unlimited' : plan.features.maxMenuItemsPerKitchen} Menu Items per Kitchen
                                    </li>
                                    <li className="flex items-center">
                                        <span className={`mr-2 ${plan.features.prioritySupport ? 'text-green-500' : 'text-red-500'}`}>
                                            {plan.features.prioritySupport ? '✓' : '✗'}
                                        </span>
                                        Priority Support
                                    </li>
                                    <li className="flex items-center">
                                        <span className={`mr-2 ${plan.features.analyticsAccess ? 'text-green-500' : 'text-red-500'}`}>
                                            {plan.features.analyticsAccess ? '✓' : '✗'}
                                        </span>
                                        Analytics Dashboard
                                    </li>
                                </ul>
                                
                                <div className="mt-8">
                                    {isCurrentPlan ? (
                                        <button
                                            disabled
                                            className="w-full py-2 px-4 bg-green-500 text-white rounded-lg cursor-not-allowed"
                                        >
                                            Current Plan
                                        </button>
                                    ) : canUpgradeToThis ? (
                                        <button
                                            onClick={() => handleSubscribe(plan._id)}
                                            disabled={processing}
                                            className="w-full py-2 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : 'Upgrade Now'}
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                                        >
                                            Lower Tier Plan
                                        </button>
                                    )}
                                </div>
                                
                                {!canUpgradeToThis && !isCurrentPlan && (
                                    <p className="text-xs text-red-500 mt-2 text-center">
                                        Cannot downgrade to lower tier plans
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Benefits Section */}
                <div className={`mt-12 p-8 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}>
                    <h2 className={`text-2xl font-bold text-center mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Why Upgrade?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="text-4xl mb-4">🏪</div>
                            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Multiple Kitchens
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Expand your business with unlimited kitchen locations - one-time payment!
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">🍽️</div>
                            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Unlimited Menu
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Add as many delicious items as you want to your menu - forever!
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                Business Analytics
                            </h3>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Track your performance with detailed insights - lifetime access!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SellerSubscription;
