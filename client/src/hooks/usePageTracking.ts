import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { navigate } from 'wouter/use-browser-location';

export function usePageTracking() {
  const [location] = useLocation();
  console.log(location);
  const lastTrackedPath = useRef<string | null>(null);




  useEffect(() => {
    if (location === lastTrackedPath.current) return;

    lastTrackedPath.current = location;

    const trackPageView = async () => {
      try {
        await apiRequest('POST', '/api/analytics/track', {
          eventType: 'page_view',
          eventName: 'view',
          page: location,
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
        });
      } catch (error) {
        console.debug('Failed to track page view:', error);
      }
    };

    trackPageView();

  }, [location]);
}

export function useEventTracking() {
  const trackEvent = async (eventName: string, eventData?: Record<string, any>, page?: string) => {
    try {
      await apiRequest('POST', '/api/analytics/track', {
        eventType: 'action',
        eventName,
        eventData,
        page: page || window.location.pathname,
      });
    } catch (error) {
      console.debug('Failed to track event:', error);
    }
  };

  return { trackEvent };
}
