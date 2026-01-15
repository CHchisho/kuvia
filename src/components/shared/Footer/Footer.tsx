'use client';
import {IconHeart} from '../Icons/IconHeart';
import Image from 'next/image';
import {Tab} from '@/components/Tab/Tab';
import ButtonIcon from '@/components/Button/ButtonIcon';
import {IconTelegram} from '../Icons/IconTelegram';
import {IconTwitter} from '../Icons/IconTwitter';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCamera, faHeart, faX} from '@fortawesome/free-solid-svg-icons';
import {
  faDiscord,
  faInstagram,
  faTelegram,
} from '@fortawesome/free-brands-svg-icons';

interface FooterLink {
  label: string;
  href: string;
  disabled?: boolean;
}

interface FooterLinks {
  TOPS: FooterLink[];
  UPLOAD: FooterLink[];
  SOCIAL: FooterLink[];
}

const links: FooterLinks = {
  TOPS: [
    {label: 'CHAT', href: '#'},
    {label: 'UPLOAD', href: '#'},
    {label: 'SOCIAL', href: '#'},
  ],
  UPLOAD: [{label: 'UPLOAD', href: '#'}],
  SOCIAL: [{label: 'SOCIAL', href: '#'}],
};

const Footer = () => {
  return (
    <>
      <footer className="bg-mono-500 px-6 py-12 lg:px-8 xl:px-12 border-t border-mono-400">
        <div className="flex justify-between w-full max-w-[1600px] mx-auto">
          <div className="w-[117px] flex flex-col lg:justify-between gap-8">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCamera} className="text-[20px]" />
                <h1 className="text-[24px] font-medium leading-none uppercase">
                  KUVIA
                </h1>
              </div>
              <p className="text-mono-200 text-[10px] leading-4 uppercase">
                Kuvia is a platform for sharing images.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ButtonIcon href="#" external>
                <FontAwesomeIcon icon={faInstagram} />
              </ButtonIcon>
              <ButtonIcon href="#" external>
                <FontAwesomeIcon icon={faDiscord} />
              </ButtonIcon>
              <ButtonIcon href="#" external>
                <IconTelegram />
              </ButtonIcon>
            </div>
          </div>
          <div className="flex lg:gap-32 gap-16 md:flex-row flex-col">
            {Object.entries(links).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-3">
                <h3 className=" font-bold text-mono-100 text-[24px] leading-none uppercase">
                  {key}
                </h3>
                <div className="flex flex-col gap-2">
                  {value.map((link: FooterLink) => (
                    <Tab
                      key={link.label}
                      text={link.label}
                      href={link.href}
                      disabled={link.disabled}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
