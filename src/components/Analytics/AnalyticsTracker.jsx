import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AnalyticsTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const trackView = async () => {
            // Don't track Admin pages or Auth pages
            if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/login') || location.pathname.startsWith('/signup')) return;

            // Don't track in development optional? No, user wants to test.
            // if (import.meta.env.DEV) return; 

            try {
                // Determine Referrer
                // document.referrer is only available if navigating from another site (or page depending on policy)
                // For internal navigation, it might not be useful for "Source" tracking, 
                // but good for "Coming from Google".
                const referrer = document.referrer;

                // Fetch Country
                let country = 'Unknown';
                try {
                    const countryRes = await fetch('https://api.country.is');
                    if (countryRes.ok) {
                        const countryData = await countryRes.json();
                        country = countryData.country; // e.g. "US", "NG"
                    }
                } catch (e) {
                    // Ignore country fetch error
                }

                await fetch(`${import.meta.env.VITE_API_BASE_URL}/track`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        path: location.pathname,
                        referrer: referrer || 'Direct',
                        country: country
                    })
                });
            } catch (err) {
                // Silently fail
            }
        };

        // Debounce or just run? React 18 strict mode runs twice.
        // Analytics implementations often dedupe.
        // For simplicity, just run.
        const timeout = setTimeout(trackView, 1000); // 1s delay to debounce rapid nav

        return () => clearTimeout(timeout);
    }, [location.pathname]);

    return null;
};

export default AnalyticsTracker;
