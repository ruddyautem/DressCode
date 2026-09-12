import { getRequestConfig } from 'next-intl/server';
 
export default getRequestConfig(async () => {
  // Static configuration / fallback locale
  const locale = 'fr';
 
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
