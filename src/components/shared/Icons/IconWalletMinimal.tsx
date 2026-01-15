import type { IconProps } from './types'

export const IconWalletMinimal = ({
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
        d='M34 28.013h.02m-20.02-14h24a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-28a4 4 0 0 1 4-4h28'
      />
    </svg>
  )
}
