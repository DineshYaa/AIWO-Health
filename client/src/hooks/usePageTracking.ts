import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// Set to false to disable analytics in development
const ENABLE_ANALYTICS = import.meta.env.PROD;

export function usePageTracking() {
  const [location] = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Skip if analytics is disabled or we've already tracked this path
    if (!ENABLE_ANALYTICS || location === lastTrackedPath.current) return;

    lastTrackedPath.current = location;

    const trackPageView = async () => {
      if (!ENABLE_ANALYTICS) return;
      
      try {
        await apiRequest('POST', '/api/analytics/track', {
          eventType: 'page_view',
          eventName: 'view',
          page: location,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
        });
      } catch (error) {
        // Silently fail in production, log in development
        if (import.meta.env.DEV) {
          console.debug('Analytics tracking disabled in development');
        }
      }
    };

    trackPageView();
  }, [location]);
}

export function useEventTracking() {
  const trackEvent = async (eventName: string, eventData?: Record<string, any>, page?: string) => {
    if (!ENABLE_ANALYTICS) return;
    
    try {
      await apiRequest('POST', '/api/analytics/track', {
        eventType: 'action',
        eventName,
        eventData,
        page: page || window.location.pathname,
      });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug('Analytics event tracking disabled in development');
      }
    }
  };

  return { trackEvent };
}
