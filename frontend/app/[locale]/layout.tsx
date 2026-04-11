import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import CartModal from '@/components/CartModal';
import WishlistModal from '@/components/WishlistModal';
import ToastContainer from '@/components/ToastContainer';
import { PlatformSettingsProvider } from '@/contexts/PlatformSettingsContext';
import WhatsAppFloatingButton from '@/components/whatsapp';
import '../globals.css';

export const metadata = {
  title: 'Zeina - Elegant Gifts & Flowers',
  description: 'Discover elegant gifts and beautiful flowers for every occasion',
};

export default async function LocaleLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <PlatformSettingsProvider>
        {children}
        <CartModal />
        <WishlistModal />
        <ToastContainer />
        <WhatsAppFloatingButton />
      </PlatformSettingsProvider>
    </NextIntlClientProvider>
  );
}
