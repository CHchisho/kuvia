import {cn} from '@/utils/cn';
import Link from 'next/link';
import React, {useState} from 'react';

export interface ButtonIconProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'href'> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  href?: string;
  external?: boolean;
  disabledWithComingSoon?: boolean;
}

const ButtonIcon = React.forwardRef<HTMLButtonElement, ButtonIconProps>(
  (
    {
      variant = 'primary',
      className,
      disabled,
      children,
      href,
      external,
      disabledWithComingSoon,
      ...props
    },
    ref
  ) => {
    const [isHovered, setIsHovered] = useState(false);
    const isDisabled = disabled || (disabledWithComingSoon && isHovered);

    const baseClasses = cn(
      'group tracking-base text-[14px] leading-[18px]',
      'font-bold p-1',
      'flex items-center justify-center gap-1 whitespace-nowrap',
      'transition-colors duration-100 touch-manipulation',
      variant === 'primary' && [
        !isDisabled && 'text-primary-100',
        !isDisabled &&
          '[@media(hover:hover)]:hover:bg-primary-100 [@media(hover:hover)]:hover:text-mono-500',
        'disabled:text-mono-300 disabled:cursor-not-allowed',
      ],
      variant === 'secondary' && [
        !isDisabled && 'text-mono-500',
        !isDisabled &&
          '[@media(hover:hover)]:hover:bg-mono-500 [@media(hover:hover)]:hover:text-primary-100',
        'disabled:text-mono-300 disabled:cursor-not-allowed',
      ],
      className
    );

    // Извлекаем только совместимые с anchor свойства
    const {
      form,
      formAction,
      formEncType,
      formMethod,
      formNoValidate,
      formTarget,
      onClick,
      ...anchorProps
    } = props;

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (isDisabled) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      // Вызываем onClick из props, если он есть
      if (onClick) {
        onClick(e as any);
      }
    };

    if (href) {
      if (external) {
        return (
          <a
            href={isDisabled ? undefined : href}
            target={isDisabled ? undefined : '_blank'}
            rel={isDisabled ? undefined : 'noopener noreferrer'}
            className={baseClasses}
            onClick={handleLinkClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-disabled={isDisabled}
            {...(anchorProps as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
          >
            {isHovered && disabledWithComingSoon ? 'COMING SOON' : children}
          </a>
        );
      }
      return (
        <Link
          href={isDisabled ? '#' : href}
          className={baseClasses}
          onClick={handleLinkClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-disabled={isDisabled}
          {...(anchorProps as any)}
        >
          {isHovered && disabledWithComingSoon ? 'COMING SOON' : children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={baseClasses}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {isHovered && disabledWithComingSoon ? 'COMING SOON' : children}
      </button>
    );
  }
);
ButtonIcon.displayName = 'ButtonIcon';

export default ButtonIcon;
