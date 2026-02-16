'use client';

import {useEffect} from 'react';
import {useRouter, usePathname} from 'next/navigation';
import Link from 'next/link';
import {Tab} from '@/components/Tab/Tab';
import Button from '@/components/Button/Button';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCamera, faFileArrowUp} from '@fortawesome/free-solid-svg-icons';
import {useIsAllowed} from '@/store/useIsAllowed';

interface NavigationItem {
  label: string;
  href: string;
}

const navigationItems: NavigationItem[] = [
  {label: 'HOME', href: '/'},
  {label: 'TOPS', href: '#'},
];

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {isAllowed, username, setIsAllowed} = useIsAllowed();

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', {credentials: 'include'})
      .then((res) => res.json())
      .then((data: {success: boolean; user?: {username: string}}) => {
        if (cancelled) return;
        if (data.success && data.user) {
          setIsAllowed(data.user.username);
        } else {
          setIsAllowed(undefined);
        }
      })
      .catch(() => {
        if (!cancelled) setIsAllowed(undefined);
      });
    return () => {
      cancelled = true;
    };
  }, [setIsAllowed]);

  const handleNavClick = (
    href: string,
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    if (href.startsWith('#')) {
      event.preventDefault();
      const id = href.slice(1);
      const targetElement = document.getElementById(id);
      if (targetElement) {
        targetElement.scrollIntoView({behavior: 'smooth'});
      }
      if (pathname !== '/') {
        router.push('/' + href);
      }
    }
  };

  useEffect(() => {
    if (window.location.hash) {
      history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
  }, []);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-14 border-b border-mono-400 z-[1000] lg:h-16 bg-mono-500">
        <div className="flex h-full justify-between items-center max-w-[1600px] mx-auto pl-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-mono-100 hover:text-primary-100"
          >
            <FontAwesomeIcon icon={faCamera} className="text-[20px]" />
            <h1 className="text-[24px] font-medium leading-none uppercase">
              KUVIA
            </h1>
          </Link>
          <nav className="hidden md:flex items-center lg:gap-12 md:gap-10">
            {navigationItems.map((item) => (
              <Tab
                key={item.label}
                text={item.label}
                href={item.href}
                onClick={(e) => handleNavClick(item.href, e)}
              />
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isAllowed && username && (
              <Link
                href="/me"
                className="text-mono-200 hover:text-primary-100 text-sm hidden sm:inline transition-colors"
              >
                {username}
              </Link>
            )}
            <Button variant="primary" href="/upload">
              UPLOAD IMAGE{' '}
              <span>
                <FontAwesomeIcon icon={faFileArrowUp} />
              </span>
            </Button>
            {!(isAllowed && username) && pathname !== '/login' && (
              <Button variant="primary" href="/login">
                LOGIN
              </Button>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
