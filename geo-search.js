function findNearby(query) {
    console.log("Searching for:", query);

    // Platform detection
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(userAgent);

    const redirect = (url) => {
        console.log("Redirecting to Google Maps:", url);
        window.location.href = url;
    };

    if (navigator.geolocation) {
        // Request current position for pinpoint local results
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                let url;
                if (isAndroid) {
                    // Native Android Google Maps Trigger (using coordinates + search)
                    url = `geo:${lat},${lng}?q=${encodeURIComponent(query)}`;
                } else if (isIOS) {
                    // Force Google Maps on iOS (uses Universal Link to open app or web)
                    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&center=${lat},${lng}&zoom=15`;
                } else {
                    // Desktop/General Google Maps API
                    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}&center=${lat},${lng}`;
                }
                redirect(url);
            },
            (error) => {
                console.warn("GPS Access Denied - Falling back to general query.", error);
                
                // Fallback: Still use Google Maps but without precise coordinates
                let url;
                if (isAndroid) {
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
        // Direct redirection if Geolocation API is not supported
        redirect(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
    }
}
