'use client';

import React, {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faWallet,
  faDroplet,
} from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/Button/Button';

export default function TopUpPage() {
  const router = useRouter();
  const [amountEur, setAmountEur] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(amountEur);
    if (Number.isNaN(value) || value <= 0) {
      setError('Enter a valid positive amount.');
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch('/api/balance/topup', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({amountEur: value}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? 'Top-up failed');
        return;
      }
      setSuccess(
        `Added €${(data.addedCents / 100).toFixed(2)} to your balance. New balance: €${(data.balanceCents / 100).toFixed(2)}.`
      );
      setAmountEur('');
      setTimeout(() => router.push('/me'), 1500);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-var(--header-height)-var(--footer-height))] px-4 py-8">
      <div className="max-w-md mx-auto">
        <Link
          href="/me"
          className="inline-flex items-center gap-2 text-mono-200 hover:text-primary-100 transition-colors text-sm mb-6"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Profile
        </Link>

        <section className="bg-mono-400 rounded-lg p-6 border border-mono-300">
          <h1 className="text-2xl font-bold text-mono-100 mb-2 flex items-center gap-2">
            <FontAwesomeIcon icon={faWallet} />
            Top up balance
          </h1>
          <p className="text-mono-200 text-sm mb-6 leading-4">
            Add funds to your account (test mode: no real payment). Each upload
            beyond the free monthly limit uses balance and 5¢ goes to water
            projects.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-mono-200 mb-1"
              >
                Amount (EUR)
              </label>
              <input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amountEur}
                onChange={(e) => setAmountEur(e.target.value)}
                placeholder="e.g. 5.00"
                className="w-full px-3 py-2 rounded-lg bg-mono-500 text-mono-100 border border-mono-300 focus:outline-none focus:border-primary-100"
                disabled={loading}
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && (
              <p className="text-sm text-green-500 flex items-center gap-2">
                <FontAwesomeIcon icon={faDroplet} />
                {success}
              </p>
            )}
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Topping up…' : 'Top up'}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
