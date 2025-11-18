import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView as trackPageViewGA } from '../utils/analytics';
import { trackPageView as trackPageViewDB, updateSessionMetrics } from '../utils/tracking';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    const pageTitle = document.title;
    const pagePath = location.pathname;

    trackPageViewGA(pagePath, pageTitle);
    trackPageViewDB(pagePath, pageTitle);
    updateSessionMetrics();

    const interval = setInterval(() => {
      updateSessionMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, [location]);
}
