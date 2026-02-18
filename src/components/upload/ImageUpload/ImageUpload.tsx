'use client';

import React, {useState, useRef, useCallback} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp,
  faUpload,
  faTimes,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import {cn} from '@/utils/cn';
import Button from '@/components/Button/Button';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE_MB = 10;

export type ImageUploadProps = {
  isPublic?: boolean;
  expiresInDays?: number;
  onSuccess?: (data: {shortCode: string; url: string}) => void;
  onError?: (message: string) => void;
};

const DESCRIPTION_MAX_LENGTH = 200;

export const ImageUpload = ({
  isPublic = true,
  expiresInDays = 1,
  onSuccess,
  onError,
}: ImageUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearPreview = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    setDescription('');
    setError(null);
  }, [preview]);

  const validateAndSetFile = useCallback((file: File): boolean => {
    if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
      setError(`Allowed formats: JPEG, PNG, GIF, WebP.`);
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Maximum size is ${MAX_SIZE_MB} MB.`);
      return false;
    }
    setError(null);
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
    return true;
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file?.type?.startsWith('image/')) return;
      validateAndSetFile(file);
    },
    [validateAndSetFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) handleFileSelect(files[0]!);
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item?.kind === 'file') {
        const file = item.getAsFile();
        if (file && file.type.startsWith('image/')) {
          e.preventDefault();
          handleFileSelect(file);
          return;
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set('file', selectedFile);
      formData.set('isPublic', isPublic ? 'true' : 'false');
      formData.set('expiresInDays', String(expiresInDays));
      if (description.trim()) formData.set('description', description.trim());

      const res = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.error || 'Upload error';
        setError(msg);
        onError?.(msg);
        return;
      }

      onSuccess?.({shortCode: data.shortCode, url: data.url});
      clearPreview();
    } catch {
      const msg = 'Network error';
      setError(msg);
      onError?.(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          preview
            ? 'border-mono-200 border-solid'
            : 'border-mono-300 hover:border-mono-200'
        )}
        onPaste={handlePaste}
        tabIndex={0}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleInputChange}
          className="hidden"
        />

        {preview ? (
          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-mono-500 flex items-center justify-center">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="text-left">
              <label
                htmlFor="upload-description"
                className="block text-sm text-mono-200 mb-1"
              >
                Photo description (optional, up to {DESCRIPTION_MAX_LENGTH}{' '}
                characters)
              </label>
              <textarea
                id="upload-description"
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value.slice(0, DESCRIPTION_MAX_LENGTH)
                  )
                }
                maxLength={DESCRIPTION_MAX_LENGTH}
                placeholder="Describe the photo..."
                className="w-full px-3 py-2 rounded-lg bg-mono-500 text-mono-100 border border-mono-300 focus:outline-none focus:border-primary-100 resize-none"
                rows={2}
                disabled={uploading}
              />
              <p className="text-xs text-mono-300 mt-1">
                {description.length}/{DESCRIPTION_MAX_LENGTH}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                variant="primary"
                disabled={uploading}
                onClick={handleUpload}
              >
                <FontAwesomeIcon icon={faUpload} />
                {uploading ? ' Uploading…' : ' Upload'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="text-mono-200 hover:text-primary-100 text-sm"
              >
                Choose another file
              </button>
              <button
                type="button"
                onClick={clearPreview}
                className="text-mono-300 hover:text-mono-100 p-1"
                aria-label="Remove"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            {selectedFile && (
              <p className="text-sm text-mono-300">
                {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="w-full flex flex-col items-center justify-center py-8 focus:outline-none focus:ring-2 focus:ring-primary-100 rounded-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            <FontAwesomeIcon
              icon={faCloudArrowUp}
              className="text-5xl text-mono-300 mb-4"
            />
            <p className="text-mono-200 mb-2">
              Click to select a file or paste an image from clipboard
              (Ctrl+V)
            </p>
            <p className="text-sm text-mono-300">
              JPG, PNG, GIF, WebP, up to {MAX_SIZE_MB} MB
            </p>
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-2">
          <FontAwesomeIcon icon={faImage} />
          {error}
        </p>
      )}
    </div>
  );
};
