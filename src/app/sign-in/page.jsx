'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema } from '@/lib/validationSchemas';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';
import TifinLogo from '@/components/Logo/TifinLogo';

function SignInPage() {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useUser();
  const { theme, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data) => {
    setMessage('');

    const result = await login(data);

    if (result.success) {
      setMessage('Sign-in successful! Redirecting...');
      setMessageType('success');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } else {
      setMessage(result.error || 'Something went wrong');
      setMessageType('error');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-br from-orange-50 via-white to-yellow-50'
    }`}>
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
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
          
          <div className="flex justify-center mb-4">
            <TifinLogo size="large" />
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Welcome back to <span className="text-orange-600">TifinCart</span>
          </h2>
          <p className={`mt-2 text-sm sm:text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            Sign in to continue your tiffin journey
          </p>
          <p className={`mt-1 text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Don't have an account?{' '}
            <Link href="/sign-up" className="font-medium text-orange-600 hover:text-orange-500 transition-colors">
              Create one here
            </Link>
          </p>
        </div>

        <div className={`rounded-xl shadow-lg p-6 sm:p-8 border transition-colors ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm sm:text-base ${
                    errors.email 
                      ? 'border-red-500' 
                      : theme === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="Enter your email"
                  autoFocus="true"
                  autoComplete="email"
                />
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <svg className={`h-4 w-4 sm:h-5 sm:w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              {errors.email && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-sm sm:text-base ${
                    errors.password 
                      ? 'border-red-500' 
                      : theme === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="Enter your password"
                  autoComplete='false'
                />
                <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                  <svg className={`h-4 w-4 sm:h-5 sm:w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <Link href="/forgot-password" className="text-xs sm:text-sm text-orange-600 hover:text-orange-500 text-right">
                Forgot password?
              </Link>
            </div>

            {message && (
              <div className={`p-3 sm:p-4 rounded-lg border ${
                messageType === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-center">
                  {messageType === 'success' ? (
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  <span className="text-xs sm:text-sm">{message}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
 
          <div className="mt-4 sm:mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`} />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className={`px-2 ${
                  theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'
                }`}>Quick access</span>
              </div>
            </div>
          </div>
 
          <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className={`p-3 sm:p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="text-center">
                <div className="text-lg sm:text-2xl mb-1 sm:mb-2">🍽️</div>
                <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Customer Portal</div>
              </div>
            </div>
            <div className={`p-3 sm:p-4 rounded-lg border ${
              theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-red-50 border-red-200'
            }`}>
              <div className="text-center">
                <div className="text-lg sm:text-2xl mb-1 sm:mb-2">👨‍🍳</div>
                <div className={`text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Seller Dashboard</div>
              </div>
            </div>
          </div>
        </div>
 
        <div className={`text-center text-xs sm:text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Secure login with industry-standard encryption
        </div>
      </div>
    </div>
  );
}

export default SignInPage;