import React from 'react';
import {vi} from 'vitest';
import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import {ImageUpload} from '../ImageUpload';

const createFile = (name: string, type: string, sizeBytes = 1024) =>
  new File(['x'.repeat(sizeBytes)], name, {type});

describe('ImageUpload component', () => {
  beforeAll(() => {
    // Provide URL.createObjectURL implementation for JSDOM.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).URL.createObjectURL = vi.fn(() => 'blob:preview-url');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows an error for unsupported file type', () => {
    render(<ImageUpload />);

    const button = screen.getByRole('button', {
      name: /click to select a file/i,
    });

    fireEvent.click(button);

    const input = document.querySelector(
      'input[type=\"file\"]'
    ) as HTMLInputElement | null;

    if (!input) {
      throw new Error('File input not found');
    }

    const file = createFile('test.svg', 'image/svg+xml');
    fireEvent.change(input, {
      target: {files: [file]},
    });

    expect(
      screen.getByText('Allowed formats: JPEG, PNG, GIF, WebP.')
    ).toBeInTheDocument();
  });

  it('calls onSuccess on successful upload', async () => {
    const onSuccess = vi.fn();

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        shortCode: 'ABC12345',
        url: '/ABC12345',
        savedBytes: 1000,
        savedCO2Grams: 1.23,
      }),
    } as unknown as Response);

    render(<ImageUpload onSuccess={onSuccess} />);

    const trigger = screen.getByRole('button', {
      name: /click to select a file/i,
    });
    fireEvent.click(trigger);

    const input = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = createFile('photo.jpg', 'image/jpeg');

    fireEvent.change(input, {
      target: {files: [file]},
    });

    // Upload button appears after file is selected.
    const uploadButton = await screen.findByRole('button', {name: /upload/i});
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    expect(onSuccess.mock.calls[0][0]).toMatchObject({
      shortCode: 'ABC12345',
      url: '/ABC12345',
    });
  });
});
