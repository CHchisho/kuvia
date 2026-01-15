import type { IconProps } from './types'

export const IconFerrisWheel = ({
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
        d='M24 28.013a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 0-6 16m6-16 6 16m-6-40v8m-10.4 18-7 4m34.8-20-7 4m-20.8 0-7-4m34.8 20-7-4m-18.4 14h16m4-6.6a18 18 0 1 0-24 0'
      />
    </svg>
  )
}
