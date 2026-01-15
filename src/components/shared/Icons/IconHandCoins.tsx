import type { IconProps } from './types'

export const IconHandCoins = ({ size = 48, color = 'currentColor', className }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 48 49'
    >
      <path
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M22 30.012h4a4 4 0 1 0 0-8h-6c-1.2 0-2.2.4-2.8 1.2L6 34.012m8 8 3.2-2.8c.6-.8 1.6-1.2 2.8-1.2h8c2.2 0 4.2-.8 5.6-2.4l9.2-8.8a4.004 4.004 0 1 0-5.5-5.82l-8.4 7.8M4 32.012l12 12m21.8-26a5.8 5.8 0 1 1-11.6 0 5.8 5.8 0 0 1 11.6 0Zm-19.8-8a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z'
      />
    </svg>
  )
}
