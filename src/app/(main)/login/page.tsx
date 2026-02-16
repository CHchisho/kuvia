'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import {cn} from '@/utils/cn';
import Button from '@/components/Button/Button';
import Link from 'next/link';
import {useIsAllowed, type IsAllowed} from '@/store/useIsAllowed';

type AuthResponse = {
  success: boolean;
  error?: string;
  user?: {id: number; username: string; email: string};
};

export default function LoginPage() {
  const router = useRouter();
  const setIsAllowed = useIsAllowed((s: IsAllowed) => s.setIsAllowed);

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }

    setLoading(true);
    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? {email: email.trim(), password}
        : {
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password,
          };

      const res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data: AuthResponse = await res.json();

      if (!data.success) {
        setError(data.error ?? 'Something went wrong');
        return;
      }

      if (data.user) {
        setIsAllowed(data.user.username);
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setConfirmPassword('');
    setError('');
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

          {error && (
            <div
              className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-mono-100 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username (only for registration) */}
            {!isLogin && (
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-mono-100 font-medium"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="johndoe"
                  autoComplete="username"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg',
                    'bg-mono-500 border border-mono-300',
                    'text-mono-100 placeholder-mono-300',
                    'focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent'
                  )}
                />
              </div>
            )}

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
                autoComplete="email"
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
                autoComplete={isLogin ? 'current-password' : 'new-password'}
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
                  autoComplete="new-password"
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
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={switchMode}
              className="text-mono-200 hover:text-primary-100 transition-colors"
            >
              {isLogin
                ? "Don't have an account? Sign Up"
                : 'Already have an account? Sign In'}
            </button>
          </div>

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
