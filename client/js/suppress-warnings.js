// Suppress console warnings for production
(function() {
    'use strict';
    
    // Suppress Tailwind CDN warning
    const originalWarn = console.warn;
    console.warn = function(...args) {
        const message = args.join(' ');
        if (message.includes('cdn.tailwindcss.com should not be used in production')) {
            return; // Suppress this specific warning
        }
        originalWarn.apply(console, args);
    };
    
    // Suppress Firebase warnings
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('Firebase: Error (auth/email-already-in-use)')) {
            return; // Suppress this specific error
        }
        originalError.apply(console, args);
    };
})();
