/**
 * Environmental metrics for Kuvia.
 * Formula based on Carbon Trust [6]: ~2 g CO₂ per MB stored/transferred.
 * Savings = (originalSize - storedSize) from compression + avoided duplicate storage.
 */

const CO2_GRAMS_PER_MB = 2

/**
 * Saved bytes → CO₂ saved in grams.
 */
export function savedBytesToCO2Grams(savedBytes: number): number {
  if (savedBytes <= 0) return 0
  const mb = savedBytes / (1024 * 1024)
  return Math.round(mb * CO2_GRAMS_PER_MB * 100) / 100
}

/**
 * Compute saved bytes from original and stored sizes
 */
export function computeSavedBytes(
  originalSizeBytes: number | null,
  storedSizeBytes: number | null
): number {
  if (
    originalSizeBytes == null ||
    storedSizeBytes == null ||
    originalSizeBytes <= 0
  ) {
    return 0
  }
  return Math.max(0, originalSizeBytes - storedSizeBytes)
}

/**
 * Format saved bytes for display (e.g. "1.2 MB").
 */
export function formatSavedBytes(bytes: number): string {
  if (bytes <= 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Format CO₂ for display (e.g. "0.05 g" or "1.2 kg").
 */
export function formatCO2(grams: number): string {
  if (grams <= 0) return '0 g'
  if (grams < 1000) return `${grams.toFixed(2)} g`
  return `${(grams / 1000).toFixed(2)} kg`
}
