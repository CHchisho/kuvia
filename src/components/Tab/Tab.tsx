import {cn} from '@/utils/cn';

export const Tab = ({
  text,
  href,
  onClick,
  disabled,
}: {
  text: string;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  disabled?: boolean;
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <a
      href={disabled ? undefined : href || '#'}
      onClick={handleClick}
      className={cn(
        'text-sm p-1 leading-[22px] uppercase w-fit',
        disabled
          ? 'text-mono-300 cursor-default pointer-events-none'
          : 'text-white cursor-pointer hover:text-mono-500 hover:bg-primary-100'
      )}
      aria-disabled={disabled}
    >
      {text}
    </a>
  );
};
