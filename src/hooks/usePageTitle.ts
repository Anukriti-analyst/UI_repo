import { useEffect } from 'react';

const APP_NAME = 'FM Essentials';

/**
 * Sets document.title to "<pageTitle> | FM Essentials".
 * Resets to just "FM Essentials" on unmount.
 */
export function usePageTitle(pageTitle: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME;
    return () => { document.title = prev; };
  }, [pageTitle]);
}
