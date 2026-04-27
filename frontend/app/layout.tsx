import { ReactNode } from 'react';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import HeaderWrapper from '@/components/HeaderWrapper';
import { categoriesApi } from '@/lib/server';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>; 
};

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();
  const categories = await categoriesApi.getAll(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} className={cn("font-sans", geist.variable)}>
      <body>
       <NextIntlClientProvider messages={messages} locale={locale}>
          <HeaderWrapper categories={categories} />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}