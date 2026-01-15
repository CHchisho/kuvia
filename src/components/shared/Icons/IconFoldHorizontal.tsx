import type { IconProps } from './types'

export const IconFoldHorizontal = ({
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
      viewBox='0 0 49 48'
    >
      <path
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M4.333 24.006h12m0 0-6 6m6-6-6-6m34 6h-12m0 0 6-6m-6 6 6 6m-14-26v4m0 8v4m0 8v4m0 8v4'
      />
    </svg>
  )
}
