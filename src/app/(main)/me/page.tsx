'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faChartLine,
  faImage,
  faArrowLeft,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import Button from '@/components/Button/Button';
import {useIsAllowed} from '@/store/useIsAllowed';

type User = {id: number; username: string; email: string};

type UploadItem = {
  id: number;
  shortCode: string;
  url: string;
  imageUrl: string;
  isPublic: boolean;
  expiresAt: string;
  createdAt: string;
};

export default function MePage() {
  const router = useRouter();
  const setIsAllowed = useIsAllowed((s) => s.setIsAllowed);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', {credentials: 'include'})
      .then((res) => res.json())
      .then((data: {success: boolean; user?: User}) => {
        if (cancelled) return;
        if (data.success && data.user) {
          setUser(data.user);
          return fetch('/api/images/my', {credentials: 'include'});
        }
        router.replace('/login');
        return null;
      })
      .then((res) => {
        if (cancelled || res == null) return res;
        return res.json();
      })
      .then((data: {success?: boolean; items?: UploadItem[]} | null) => {
        if (cancelled) return;
        if (data?.success && Array.isArray(data.items)) {
          setUploads(data.items);
        }
      })
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
        <p className="text-mono-200">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-[calc(100vh-var(--header-height)-var(--footer-height))] px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-mono-200 hover:text-primary-100 transition-colors text-sm"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Home
        </Link>

        {/* Profile info */}
        <section className="bg-mono-400 rounded-lg p-6 border border-mono-300">
          <h1 className="text-2xl font-bold text-mono-100 mb-4">Profile</h1>

          <div className="flex items-center justify-between">
            <div className="space-y-2 text-mono-100">
              <p>
                <span className="text-mono-200">Username:</span>{' '}
                <strong>{user.username}</strong>
              </p>
              <p>
                <span className="text-mono-200">Email:</span> {user.email}
              </p>
            </div>
            <div>
              <Button
                variant="primary"
                type="button"
                onClick={async () => {
                  await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include',
                  });
                  setIsAllowed(undefined);
                  router.push('/');
                  router.refresh();
                }}
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
                Logout
              </Button>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-mono-300 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-mono-200">
              <FontAwesomeIcon icon={faHeart} className="text-primary-100" />
              <span>Likes</span>
              <span className="text-mono-100 font-medium">—</span>
            </div>
            <div className="flex items-center gap-2 text-mono-200">
              <FontAwesomeIcon
                icon={faChartLine}
                className="text-primary-100"
              />
              <span>Tops</span>
              <span className="text-mono-100 font-medium">—</span>
            </div>
          </div>
        </section>

        {/* My uploads */}
        <section className="bg-mono-400 rounded-lg p-6 border border-mono-300">
          <h2 className="text-xl font-bold text-mono-100 mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faImage} />
            My uploads
          </h2>
          {uploads.length === 0 ? (
            <p className="text-mono-200">
              No photos yet. Your uploaded images will appear here.
            </p>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {uploads.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/${item.shortCode}`}
                    className="block rounded-lg overflow-hidden border border-mono-300 hover:border-primary-100 transition-colors aspect-square bg-mono-500"
                  >
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </Link>
                  <p className="text-xs text-mono-300 mt-1 truncate">
                    /{item.shortCode} · {item.isPublic ? 'public' : 'private'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
