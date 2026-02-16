'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';

type GalleryItem = {
  id: number;
  code: string;
  description: string;
  imageUrl: string;
};

export const Page = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/images')
      .then((res) => res.json())
      .then((data: {success?: boolean; items?: GalleryItem[]}) => {
        if (data.success && Array.isArray(data.items)) {
          setItems(data.items);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-mono-100">Gallery</h1>
      {loading ? (
        <p className="text-mono-200">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-mono-200">No public photos yet.</p>
      ) : (
        <div
          className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4"
          style={{columnGap: '1rem'}}
        >
          {items.map((image) => (
            <Link
              key={image.id}
              href={`/${image.code}`}
              className="block w-full mb-4 break-inside-avoid"
            >
              <div className="relative w-full overflow-hidden rounded-lg bg-mono-400 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="relative w-full aspect-square">
                  <img
                    src={image.imageUrl}
                    alt={image.description || 'Photo'}
                    className="object-cover w-full h-full"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 20vw"
                  />
                </div>
                {image.description && (
                  <div className="p-3 bg-mono-400">
                    <p className="text-sm text-mono-100">{image.description}</p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
