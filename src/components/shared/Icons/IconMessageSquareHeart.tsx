import type { IconProps } from './types'

export const IconMessageSquareHeart = ({
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
        d='M44 34.013a4 4 0 0 1-4 4H13.656a4 4 0 0 0-2.828 1.172L6.424 43.59A1.42 1.42 0 0 1 4 42.585V10.013a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v24Z'
      />
      <path
        stroke={color}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M15 19.013c0 1.374.53 2.766 1.394 3.688l6.018 6.528c.22.269.498.484.814.628a1.999 1.999 0 0 0 1.566-.008 2.28 2.28 0 0 0 .796-.62l6.016-6.528A5.54 5.54 0 0 0 33 19.013a5 5 0 0 0-9-3 5 5 0 0 0-9 3Z'
      />
    </svg>
  )
}
