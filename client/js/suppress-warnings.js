// Suppress Tailwind CSS CDN warning and other development warnings
(function() {
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;
    
    console.warn = function(...args) {
        const message = args.join(' ');
        if (message.includes('cdn.tailwindcss.com should not be used in production') ||
            message.includes('Tailwind CSS') ||
            message.includes('production')) {
            return; // Suppress these warnings
        }
        originalConsoleWarn.apply(console, args);
    };
    
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('cdn.tailwindcss.com should not be used in production') ||
            message.includes('Tailwind CSS') ||
            message.includes('production')) {
            return; // Suppress these errors
        }
        originalConsoleError.apply(console, args);
    };
})();
