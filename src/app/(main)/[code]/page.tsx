'use client';

import React, {useState} from 'react';
import Link from 'next/link';

interface PhotoPageProps {
  params: Promise<{code: string}>;
}

export default function PhotoPage({params}: PhotoPageProps) {
  const [code, setCode] = useState<string | null>(null);
  const [error, setError] = useState(false);

  React.useEffect(() => {
    params.then((p) => setCode(p.code));
  }, [params]);

  if (code === null) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <p className="text-mono-200">Loading…</p>
      </div>
    );
  }

  const imageUrl = `/api/images/${code}`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-block mb-6 text-mono-200 hover:text-primary-100 transition-colors"
      >
        ← Back to Gallery
      </Link>

      {error ? (
        <div className="rounded-lg border border-mono-300 bg-mono-400 p-8 text-center">
          <p className="text-mono-100 font-medium mb-2">
            Link is invalid or expired
          </p>
          <p className="text-mono-300 text-sm mb-4">
            Photo is deleted or storage time has expired.
          </p>
          <Link href="/" className="text-primary-100 hover:underline">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="relative border border-mono-300 rounded-lg overflow-hidden bg-mono-500 flex items-center justify-center min-h-[60vh]">
          <img
            src={imageUrl}
            alt="Фото"
            className="max-w-full max-h-[70vh] w-auto h-auto object-contain"
            onError={() => setError(true)}
          />
        </div>
      )}
    </div>
  );
}
