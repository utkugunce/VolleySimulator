import { getRequestConfig } from 'next-intl/server';

export const locales = ['tr', 'en'] as const;
export const defaultLocale = 'tr' as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // Get the requested locale, or fall back to default
  let locale = await requestLocale;

  // Validate locale
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  // Import messages based on locale
  let messages;
  if (locale === 'en') {
    messages = (await import('../messages/en.json')).default;
  } else {
    messages = (await import('../messages/tr.json')).default;
  }

  return {
    locale,
    messages
  };
});
