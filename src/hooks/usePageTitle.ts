import { useEffect } from 'react';

const APP_NAME = 'Policy Proposal Intake Manager';

/**
 * Sets the document title for the current page.
 * Resets to the application name on unmount.
 */
export function usePageTitle(pageTitle: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = pageTitle ? `${pageTitle} | ${APP_NAME}` : APP_NAME;
    return () => { document.title = prev; };
  }, [pageTitle]);
}
