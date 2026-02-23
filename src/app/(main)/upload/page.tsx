'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faDroplet, faWallet} from '@fortawesome/free-solid-svg-icons';
import {ImageUpload} from '@/components/upload/ImageUpload/ImageUpload';
import {cn} from '@/utils/cn';

const EXPIRY_OPTIONS = [
  {value: 1, label: '1 day'},
  {value: 7, label: '7 days'},
  {value: 14, label: '14 days'},
  {value: 30, label: '30 days'},
] as const;

type User = {id: number; username: string; email: string};

type Allowance = {
  canUpload: boolean;
  freeUploadsLimit: number;
  usedThisMonth: number;
  balanceCents: number;
  uploadWaterCents: number;
};

export default function UploadPage() {
  const router = useRouter();
  const [isPublic, setIsPublic] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState(1);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [allowance, setAllowance] = useState<Allowance | null>(null);
  const [waterMessage, setWaterMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', {credentials: 'include'})
      .then((res) => res.json())
      .then((data: {success: boolean; user?: User}) => {
        if (cancelled) return;
        if (data.success && data.user) {
          setUser(data.user);
          return fetch('/api/users/me/upload-allowance', {
            credentials: 'include',
          }).then((r) => r.json());
        }
        router.replace('/login');
        return null;
      })
      .then(
        (
          allowanceRes: {
            success?: boolean;
            canUpload?: boolean;
            freeUploadsLimit?: number;
            usedThisMonth?: number;
            balanceCents?: number;
            uploadWaterCents?: number;
          } | null
        ) => {
          if (cancelled || !allowanceRes?.success) return;
          setAllowance({
            canUpload: allowanceRes.canUpload ?? true,
            freeUploadsLimit: allowanceRes.freeUploadsLimit ?? 5,
            usedThisMonth: allowanceRes.usedThisMonth ?? 0,
            balanceCents: allowanceRes.balanceCents ?? 0,
            uploadWaterCents: allowanceRes.uploadWaterCents ?? 5,
          });
        }
      )
      .catch(() => {
        if (!cancelled) router.replace('/login');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-var(--header-height)-var(--footer-height))] flex items-center justify-center px-4">
        <p className="text-mono-200">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-mono-100">Upload photo</h1>

      {allowance && !allowance.canUpload && (
        <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-wrap items-center gap-2">
          <FontAwesomeIcon icon={faWallet} />
          <span>
            Free upload limit reached. Please top up your balance to continue.
          </span>
          <Link
            href="/me/topup"
            className="font-medium text-primary-100 hover:underline"
          >
            Top up balance
          </Link>
        </div>
      )}

      {waterMessage && (
        <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-200 flex items-center gap-2">
          <FontAwesomeIcon icon={faDroplet} />
          {waterMessage}
        </div>
      )}

      <div className="space-y-6">
        <ImageUpload
          isPublic={isPublic}
          expiresInDays={expiresInDays}
          onSuccess={({url, waterContributionCents}) => {
            if (waterContributionCents != null && waterContributionCents > 0) {
              setWaterMessage(
                `${waterContributionCents}¢ went to water projects.`
              );
            }
            setTimeout(
              () => {
                router.push(url);
                router.refresh();
              },
              waterContributionCents ? 1500 : 0
            );
          }}
          onNeedTopUp={() => router.push('/me/topup')}
        />

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="privacy"
              checked={!isPublic}
              onChange={(e) => setIsPublic(!e.target.checked)}
              className="w-5 h-5 rounded border-mono-300 bg-mono-400 text-primary-100 focus:ring-primary-100 focus:ring-2 cursor-pointer"
            />
            <label
              htmlFor="privacy"
              className="text-mono-100 cursor-pointer select-none"
            >
              Private photo (not publicly visible)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="expiry" className="text-mono-100 font-medium">
              Storage time:
            </label>
            <select
              id="expiry"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(Number(e.target.value))}
              className={cn(
                'px-3 py-2 rounded-lg bg-mono-400 border border-mono-300',
                'text-mono-100 focus:outline-none focus:ring-2 focus:ring-primary-100'
              )}
            >
              {EXPIRY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
