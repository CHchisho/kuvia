'use client';

import React, {useState} from 'react';
import {cn} from '@/utils/cn';
import Button from '@/components/Button/Button';
import Link from 'next/link';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isLogin ? 'Login' : 'Register', {email, password});
  };

  return (
    <div className="min-h-[calc(100vh-var(--header-height)-var(--footer-height))] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-mono-400 rounded-lg p-8 border border-mono-300">
          <h1 className="text-3xl font-bold mb-2 text-mono-100 text-center">
            {isLogin ? 'Login' : 'Sign Up'}
          </h1>
          <p className="text-mono-200 text-center mb-8">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-mono-100 font-medium"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className={cn(
                  'w-full px-4 py-3 rounded-lg',
                  'bg-mono-500 border border-mono-300',
                  'text-mono-100 placeholder-mono-300',
                  'focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent'
                )}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-mono-100 font-medium"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className={cn(
                  'w-full px-4 py-3 rounded-lg',
                  'bg-mono-500 border border-mono-300',
                  'text-mono-100 placeholder-mono-300',
                  'focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent'
                )}
              />
            </div>

            {/* Confirm Password (only for registration) */}
            {!isLogin && (
              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="block text-mono-100 font-medium"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg',
                    'bg-mono-500 border border-mono-300',
                    'text-mono-100 placeholder-mono-300',
                    'focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent'
                  )}
                />
              </div>
            )}

            {/* Submit Button */}
            <Button type="submit" variant="primary" className="w-full">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          {/* Toggle between login and registration */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-mono-200 hover:text-primary-100 transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </button>
          </div>

          {/* Link to home */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-mono-200 hover:text-primary-100 transition-colors text-sm"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
