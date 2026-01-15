import type { IconProps } from './types'

export const IconFlipVertical = ({
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
        d='M42 16.012v-6a4 4 0 0 0-4-4H10a4 4 0 0 0-4 4v6m36 16v6a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-6m2-8H4m16 0h-4m16 0h-4m16 0h-4'
      />
    </svg>
  )
}
