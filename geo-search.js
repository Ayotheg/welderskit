/**
 * findNearby - Locates shops or services near the user's current location.
 * Optimised for iOS (Apple Maps) and Android (Google Maps).
 */
function findNearby(query) {
    console.log("Searching for:", query);
    
    // Platform detection
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(userAgent);

    // Function to handle the final URL redirection
    const redirect = (url) => {
        console.log("Redirecting to:", url);
        // Using location.href is often more reliable on mobile for app-scheme triggers
        window.location.href = url;
    };

    if (navigator.geolocation) {
        // Request user permission for location to provide better results
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                let url;
                if (isIOS) {
                    // iOS: Apple Maps is the most reliable native scheme
                    url = `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(query)}`;
                } else if (isAndroid) {
                    // Android: Intent-based geo scheme
                    url = `geo:${lat},${lng}?q=${encodeURIComponent(query)}`;
                } else {
                    // Desktop/Other: Professional Google Maps Search API
                    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                }
                redirect(url);
            },
            (error) => {
                console.warn("Geolocation permission denied or timed out. Falling back to query-only search.", error);
                
                let url;
                if (isIOS) {
                    // Fallback without coordinates for iOS
                    url = `https://maps.apple.com/?q=${encodeURIComponent(query)}`;
                } else if (isAndroid) {
                    // Fallback without coordinates for Android
                    url = `geo:0,0?q=${encodeURIComponent(query)}`;
                } else {
                    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                }
                redirect(url);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        // Fallback for browsers without Geolocation API
        const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
        redirect(url);
    }
}
