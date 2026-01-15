import React from 'react';
import {config} from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

config.autoAddCss = false;

import Header from '@/components/shared/Header';

import {cn} from '@/utils/cn';
import '@/styles/globals.css';
import {Metadata} from 'next';
import {headers} from 'next/headers';
import {QueryProvider} from '@/components/QueryProvider';
import {GeistMono, DharmaGothicE} from '../../styles/fonts';
import Footer from '@/components/shared/Footer';

const Layout = async ({children}: {children: React.ReactNode}) => {
  return (
    <html lang="en">
      <head></head>
      <body className={cn(GeistMono.variable, DharmaGothicE.variable)}>
        <QueryProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 pt-14 lg:pt-16">
              <div className="w-full max-w-[1600px] mx-auto">{children}</div>
            </main>
            <Footer />
          </div>
        </QueryProvider>
      </body>
    </html>
  );
};

export default Layout;
