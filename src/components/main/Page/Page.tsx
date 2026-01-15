'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {mockImages} from '@/data/mockPhotos';

export const Page = () => {
  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-mono-100">Gallery</h1>
      <div
        className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4"
        style={{columnGap: '1rem'}}
      >
        {mockImages.map((image) => (
          <Link
            key={image.id}
            href={`/${image.code}`}
            className="block w-full mb-4 break-inside-avoid"
          >
            <div className="relative w-full overflow-hidden rounded-lg bg-mono-400 cursor-pointer hover:opacity-80 transition-opacity">
              <div
                className="relative w-full"
                style={{
                  aspectRatio: `${image.width} / ${image.height}`,
                }}
              >
                <Image
                  src={image.url}
                  alt={image.description}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 20vw, 20vw"
                />
              </div>
              <div className="p-3 bg-mono-400">
                <p className="text-sm text-mono-100">{image.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
