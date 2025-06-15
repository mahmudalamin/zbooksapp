// components/layout/Layout.tsx - Page Layout Component
'use client';

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from '../components/public/Navbar';
import Footer from '../components/public/Footer';
import Hero from '../components/public/Hero';


interface LayoutProps {
  children: ReactNode;

}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();
  
  // Check if current page is homepage
  const isHomePage = pathname === '/' || pathname === '/HomePage';
  
  return (
    <div className="layout-wrapper">
      <Header />
      
      {/* Hero section only on homepage */}
      {isHomePage && <Hero />}
      
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;