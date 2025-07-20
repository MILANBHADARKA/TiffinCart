'use client'

import { usePathname } from 'next/navigation';
import Header from '../Header/Header';
import Footer from '../Footer/Footer';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const hideHeaderRoutes = ['/forgot-password', '/reset-password', '/sign-in', '/sign-up', '/verify-email'];
  const hideFooterRoutes = ['/forgot-password', '/reset-password', '/sign-in', '/sign-up', '/verify-email'];

  const showHeader = !hideHeaderRoutes.includes(pathname);
  const showFooter = !hideFooterRoutes.includes(pathname);

  return (
    <>
      {showHeader && <Header />}
      <main className={`${showHeader ? 'pt-16 md:pt-20' : ''} transition-all duration-300`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
}