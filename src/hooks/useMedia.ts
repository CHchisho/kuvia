'use client'
import { useMediaQuery } from 'react-responsive'

export const useMedia = () => {
  // Default to desktop values during SSR
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isMobileBig: false,
      isTablet: false,
      isDesktop: true,
    }
  }

  const isMobile = useMediaQuery({ query: '(max-width: 520px)' })
  const isTablet = useMediaQuery({
    query: '(min-width: 520px) and (max-width: 1024px)',
  })
  const isMobileBig = useMediaQuery({
    query: '(min-width: 520px) and (max-width: 768px)',
  })

  return { isMobile, isMobileBig, isTablet, isDesktop: !isMobile && !isTablet }
}
