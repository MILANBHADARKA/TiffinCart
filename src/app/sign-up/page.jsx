'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema } from '@/lib/validationSchemas';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const router = useRouter();
  const { isAuthenticated } = useUser();
  const { theme, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'customer'
    }
  });

  const watchRole = watch('role');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Verification email sent! Please check your inbox.');
        setMessageType('success');
        setTimeout(() => {
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        }, 2000);
      } else {
        setMessage(result.error || 'Something went wrong');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-br from-orange-50 via-white to-yellow-50'
    }`}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="text-sm text-orange-600 hover:text-orange-500 flex items-center">
              ← Back to Home
            </Link>
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Join <span className="text-orange-600">TifinCart</span>
          </h2>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Start your journey with homemade food delivery
          </p>
          <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Already have an account?{' '}
            <Link href="/sign-in" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

        <div className={`rounded-xl shadow-lg p-8 border transition-colors ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="name" className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.name 
                    ? 'border-red-500' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.email 
                    ? 'border-red-500' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                id="password"
                type="password"
                {...register('password')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                  errors.password 
                    ? 'border-red-500' 
                    : theme === 'dark' 
                      ? 'border-gray-600 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                }`}
                placeholder="Create a secure password"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
              <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Password must contain at least 8 characters with uppercase, lowercase, and numbers
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Join as
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  watchRole === 'customer'
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                    : theme === 'dark'
                      ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}>
                  <input
                    type="radio"
                    value="customer"
                    {...register('role')}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center w-full">
                    <div className="text-2xl mb-1">🍽️</div>
                    <span className={`text-sm font-medium ${
                      watchRole === 'customer' ? 'text-orange-900' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Customer</span>
                    <span className={`text-xs ${
                      watchRole === 'customer' ? 'text-orange-700' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Order food</span>
                  </div>
                </label>

                <label className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                  watchRole === 'seller'
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500'
                    : theme === 'dark'
                      ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}>
                  <input
                    type="radio"
                    value="seller"
                    {...register('role')}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center w-full">
                    <div className="text-2xl mb-1">👨‍🍳</div>
                    <span className={`text-sm font-medium ${
                      watchRole === 'seller' ? 'text-orange-900' : theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Seller</span>
                    <span className={`text-xs ${
                      watchRole === 'seller' ? 'text-orange-700' : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Sell food</span>
                  </div>
                </label>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {message && (
              <div className={`p-4 rounded-lg border ${
                messageType === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  {messageType === 'success' ? (
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  <span className="text-sm">{message}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${
                  theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
                }`}>Join thousands of food lovers</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="text-center">
                <div className="text-xl mb-1">🎉</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Free to join</div>
              </div>
            </div>
            <div className={`p-3 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'
            }`}>
              <div className="text-center">
                <div className="text-xl mb-1">✨</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Instant access</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-orange-600 hover:text-orange-500">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-orange-600 hover:text-orange-500">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignUpPage;