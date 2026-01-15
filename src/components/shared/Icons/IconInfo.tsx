import type { IconProps } from './types'

export const IconInfo = ({ size = 12, color = '#5F5F60', className }: IconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 12 11'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <path
        d='M6 7.5V5.5M6 3.5H6.005M11 5.5C11 8.26142 8.76142 10.5 6 10.5C3.23858 10.5 1 8.26142 1 5.5C1 2.73858 3.23858 0.5 6 0.5C8.76142 0.5 11 2.73858 11 5.5Z'
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
