import type { IconProps } from './types'

export const IconCrosshair = ({ size = 48, color = 'currentColor', className }: IconProps) => {
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
        d='M44 24.013c0 11.046-8.954 20-20 20m20-20c0-11.046-8.954-20-20-20m20 20h-8m-12 20c-11.046 0-20-8.954-20-20m20 20v-8m-20-12c0-11.046 8.954-20 20-20m-20 20h8m12-20v8'
      />
    </svg>
  )
}
