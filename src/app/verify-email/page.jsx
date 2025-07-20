'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyEmailSchema } from '@/lib/validationSchemas';
import { useUser } from '@/context/User.context';
import { useTheme } from '@/context/Theme.context';

function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useUser();
  const { theme, toggleTheme } = useTheme();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: '',
      verifyCode: ''
    }
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
    
    // Pre-fill email from URL parameters
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setValue('email', emailFromUrl);
    }
  }, [isAuthenticated, router, searchParams, setValue]);

  const onSubmit = async (data) => {
    setMessage('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Email verified successfully! Redirecting to sign-in...');
        setMessageType('success');
        setTimeout(() => {
          router.push('/sign-in');
        }, 2000);
      } else {
        setMessage(result.error || 'Verification failed');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    }
  };

  const handleResendCode = async (email) => {
    if (!email) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    setIsResending(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Verification code sent! Please check your inbox.');
        setMessageType('success');
      } else {
        setMessage(result.error || 'Failed to resend code');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setIsResending(false);
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
            <Link href="/sign-up" className="text-sm text-orange-600 hover:text-orange-500 flex items-center">
              ← Back to sign up
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

          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Verify Your Email
          </h2>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
            We've sent a 6-digit verification code to your email
          </p>
          <div className={`mt-4 rounded-lg p-4 border ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-600' 
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-orange-800'
              }`}>
                Check your spam folder if you don't see the email
              </p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-lg p-8 border transition-colors ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-100'
        }`}>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                  className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                    errors.email 
                      ? 'border-red-500' 
                      : theme === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="Enter your email address"
                  readOnly={true}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="verifyCode" className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Verification Code
              </label>
              <div className="relative">
                <input
                  id="verifyCode"
                  type="text"
                  {...register('verifyCode')}
                  maxLength={6}
                  className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors text-center text-lg font-mono tracking-widest ${
                    errors.verifyCode 
                      ? 'border-red-500' 
                      : theme === 'dark' 
                        ? 'border-gray-600 bg-gray-700 text-white' 
                        : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="000000"
                  autoComplete="one-time-code"
                  {...register('verifyCode', { required: 'Verification code is required' })}
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              {errors.verifyCode && (
                <p className="mt-1 text-sm text-red-600">{errors.verifyCode.message}</p>
              )}
              <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Enter the 6-digit code sent to your email
              </p>
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
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify Email'
              )}
            </button>

            <button
              type="button"
              onClick={() => handleResendCode(document.getElementById('email').value)}
              disabled={isResending}
              className={`w-full py-3 px-4 rounded-lg font-medium focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isResending ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resending...
                </div>
              ) : (
                'Resend verification code'
              )}
            </button>
          </form>
        </div>

        <div className={`text-center space-y-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          <p className="text-xs">
            Having trouble? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailPage;
