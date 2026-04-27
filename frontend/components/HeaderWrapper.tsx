'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function HeaderWrapper({ categories }: { categories: any }) {
  const pathname = usePathname();
  
  // Do not render Header on admin dashboards or login pages
  if (
    pathname.includes('/admin') || 
    pathname.includes('/super-admin') || 
    pathname.includes('/login')
  ) {
    return null;
  }
  
  return <Header categories={categories} />;
}
