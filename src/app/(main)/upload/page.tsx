'use client';

import React, {useState} from 'react';
import {ImageUpload} from '@/components/upload/ImageUpload/ImageUpload';
import {cn} from '@/utils/cn';

export default function UploadPage() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [description, setDescription] = useState('');

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-mono-100">Upload Photo</h1>

      <div className="space-y-6">
        <ImageUpload />

        {/* Privacy checkbox */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="privacy"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="w-5 h-5 rounded border-mono-300 bg-mono-400 text-primary-100 focus:ring-primary-100 focus:ring-2 cursor-pointer"
          />
          <label
            htmlFor="privacy"
            className="text-mono-100 cursor-pointer select-none"
          >
            Private Photo
          </label>
        </div>

        {/* Description textarea */}
        <div className="space-y-2">
          <label
            htmlFor="description"
            className="block text-mono-100 font-medium"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter photo description..."
            rows={4}
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'bg-mono-400 border border-mono-300',
              'text-mono-100 placeholder-mono-300',
              'focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent',
              'resize-none'
            )}
          />
        </div>
      </div>
    </div>
  );
}
