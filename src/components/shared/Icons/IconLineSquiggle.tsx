import type { IconProps } from './types'

export const IconLineSquiggle = ({
  size = 48,
  color = 'currentColor',
  className,
}: IconProps) => {
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
        d='M14 7.013c10-4 14 5 6 8-17 5-16 15-10 17 10 4 18-20 28-14s1 27-8 24c-10-5 1-22 12-4'
      />
    </svg>
  )
}
