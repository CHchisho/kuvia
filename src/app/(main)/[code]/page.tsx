import React from 'react';
import Image from 'next/image';
import {notFound} from 'next/navigation';
import {mockImages} from '@/data/mockPhotos';
import Link from 'next/link';

interface PhotoPageProps {
  params: Promise<{
    code: string;
  }>;
}

export default async function PhotoPage({params}: PhotoPageProps) {
  const {code} = await params;
  const photo = mockImages.find((img) => img.code === code);

  if (!photo) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="inline-block mb-6 text-mono-200 hover:text-primary-100 transition-colors"
      >
        ← Back to Gallery
      </Link>

      <div className="overflow-hidden flex flex-col lg:flex-row justify-between gap-4 h-[70vh]">
        {/* Photo */}
        <div className="relative inline-block border border-mono-300 rounded-lg overflow-hidden h-full">
          <Image
            src={photo.url}
            alt={photo.description}
            width={photo.width}
            height={photo.height}
            className="object-contain max-h-[70vh] w-auto h-full"
            priority
          />
        </div>

        {/* Info */}
        <div className="p-6 space-y-4 flex-1 lg:min-w-[300px] lg:max-w-md border border-mono-300 rounded-lg bg-mono-400 h-fit">
          {/* Description */}
          {photo.description && (
            <div>
              <h2 className="text-lg font-semibold text-mono-100 mb-2">
                Description
              </h2>
              <p className="text-mono-200">{photo.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap gap-6 pt-4 border-t border-mono-300">
            <div>
              <span className="text-sm text-mono-300">Author</span>
              <p className="text-mono-100 font-medium">{photo.author}</p>
            </div>
            <div>
              <span className="text-sm text-mono-300">Upload Date</span>
              <p className="text-mono-100 font-medium">
                {formatDate(photo.uploadDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
