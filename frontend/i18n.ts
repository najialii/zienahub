import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export const locales = ['en', 'ar'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async () => {
  // cookies() returns a Promise in Next.js 16+
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const locale = localeCookie?.value || 'en';

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
  