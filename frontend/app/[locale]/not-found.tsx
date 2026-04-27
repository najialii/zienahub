import { getTranslations } from 'next-intl/server';
import NotFoundClient from './not-found-client';

export default async function NotFound({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  let translations = {
    title: 'Page Not Found',
    description: "Oops! The page you're looking for seems to have wandered off. Let's get you back on track.",
    goHome: 'Go Home',
    goBack: 'Go Back'
  };

  try {
    const t = await getTranslations();
    translations = {
      title: t('notFound.title') || translations.title,
      description: t('notFound.description') || translations.description,
      goHome: t('notFound.goHome') || translations.goHome,
      goBack: t('notFound.goBack') || translations.goBack,
    };
  } catch (e) {
    // Use default translations if there's an error
  }

  return <NotFoundClient locale={locale} translations={translations} />;
}
