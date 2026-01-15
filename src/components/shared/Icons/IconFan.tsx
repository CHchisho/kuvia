import type { IconProps } from './types'

export const IconFan = ({ size = 48, color = 'currentColor', className }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 48 48'
    >
      <path
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M24 24.006v.02m-2.346 8.738A12.164 12.164 0 0 1 4.418 18.758l10.824 2.9A12.164 12.164 0 0 1 29.246 4.425l-2.9 10.823a12.165 12.165 0 0 1 17.236 14.005l-10.824-2.9a12.164 12.164 0 0 1-14.004 17.235l2.9-10.824Z'
      />
    </svg>
  )
}
