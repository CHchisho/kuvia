import {cn} from '@/utils/cn';
import Link from 'next/link';
import React, {useState} from 'react';

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'href'> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  href?: string;
  external?: boolean;
  disabledWithComingSoon?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
      'tracking-base text-[14px] leading-[18px]',
      'font-bold',
      'flex items-center justify-center gap-1 whitespace-nowrap',
      'transition-colors duration-100 touch-manipulation',
      variant === 'primary' && [
        !isDisabled && 'text-primary-100',
        !isDisabled &&
          '[@media(hover:hover)]:hover:bg-primary-100 [@media(hover:hover)]:hover:text-mono-500',
        'px-8 py-[23px] disabled:text-mono-300 disabled:cursor-not-allowed',
      ],
      variant === 'secondary' && [
        !isDisabled && 'text-primary-100',
        !isDisabled &&
          '[@media(hover:hover)]:hover:bg-primary-100 [@media(hover:hover)]:hover:text-mono-500',
        'leading-[22px] p-1 disabled:text-mono-300 disabled:cursor-not-allowed',
      ],
      className
    );

    // Extract only anchor-compatible props
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
      // Call onClick from props if provided
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
Button.displayName = 'Button';

export default Button;
