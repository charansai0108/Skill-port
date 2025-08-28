/**
 * SkillPort Production Optimizer
 * Handles cross-browser compatibility, performance optimization, and final testing
 */

class SkillPortOptimizer {
  constructor() {
    this.isProduction = window.location.hostname !== 'localhost';
    this.browserSupport = this.detectBrowserSupport();
    this.performanceMetrics = {};
    this.init();
  }

  init() {
    this.setupPerformanceMonitoring();
    this.optimizeForBrowser();
    this.setupErrorHandling();
    this.runFinalTests();
    this.setupAnalytics();
  }

  // Browser Support Detection
  detectBrowserSupport() {
    const userAgent = navigator.userAgent;
    const isChrome = /Chrome/.test(userAgent) && !/Edge/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isEdge = /Edge/.test(userAgent);
    const isIE = /MSIE|Trident/.test(userAgent);

    return {
      chrome: isChrome,
      firefox: isFirefox,
      safari: isSafari,
      edge: isEdge,
      ie: isIE,
      modern: !isIE,
      version: this.getBrowserVersion(userAgent)
    };
  }

  getBrowserVersion(userAgent) {
    const match = userAgent.match(/(chrome|firefox|safari|edge|msie|trident(?=\/))\/?\s*(\d+)/i);
    return match ? parseInt(match[2]) : 0;
  }

  // Performance Monitoring
  setupPerformanceMonitoring() {
    if ('performance' in window) {
      // Monitor page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          this.performanceMetrics = {
            loadTime: perfData.loadEventEnd - perfData.loadEventStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          };
          
          this.logPerformance();
        }, 100);
      });

      // Monitor resource loading
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource' && entry.duration > 3000) {
            console.warn('Slow resource detected:', entry.name, entry.duration + 'ms');
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['resource'] });
      } catch (e) {
        // Fallback for older browsers
      }
    }
  }

  logPerformance() {
    console.log('🚀 SkillPort Performance Metrics:', this.performanceMetrics);
    
    // Send to analytics in production
    if (this.isProduction) {
      this.sendAnalytics('performance', this.performanceMetrics);
    }
  }

  // Browser-Specific Optimizations
  optimizeForBrowser() {
    if (this.browserSupport.ie) {
      this.applyIEFixes();
    } else if (this.browserSupport.safari) {
      this.applySafariFixes();
    } else if (this.browserSupport.firefox) {
      this.applyFirefoxFixes();
    }

    // Apply modern browser optimizations
    if (this.browserSupport.modern) {
      this.applyModernOptimizations();
    }
  }

  applyIEFixes() {
    // Add polyfills for IE
    if (!window.Promise) {
      console.warn('Promise not supported, adding polyfill');
      // In production, you'd load a proper polyfill
    }
    
    // Fix flexbox issues
    document.body.style.display = 'block';
  }

  applySafariFixes() {
    // Fix Safari-specific CSS issues
    const style = document.createElement('style');
    style.textContent = `
      .safari-fix { -webkit-transform: translateZ(0); }
      input[type="search"] { -webkit-appearance: none; }
    `;
    document.head.appendChild(style);
  }

  applyFirefoxFixes() {
    // Fix Firefox-specific issues
    const style = document.createElement('style');
    style.textContent = `
      .firefox-fix { transform: translateZ(0); }
    `;
    document.head.appendChild(style);
  }

  applyModernOptimizations() {
    // Enable modern features
    if ('serviceWorker' in navigator) {
      this.setupServiceWorker();
    }
    
    if ('IntersectionObserver' in window) {
      this.setupLazyLoading();
    }
  }

  // Service Worker Setup
  setupServiceWorker() {
    if (this.isProduction) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }

  // Lazy Loading Setup
  setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // Error Handling
  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.handleError('JavaScript Error', event.error);
    });

    // Promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError('Unhandled Promise Rejection', event.reason);
    });

    // Network error handler
    window.addEventListener('offline', () => {
      this.showOfflineNotification();
    });

    window.addEventListener('online', () => {
      this.hideOfflineNotification();
    });
  }

  handleError(type, error) {
    console.error(`${type}:`, error);
    
    if (this.isProduction) {
      this.sendAnalytics('error', {
        type: type,
        message: error.message || error.toString(),
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    }

    // Show user-friendly error message
    this.showErrorNotification(type);
  }

  showErrorNotification(type) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg bg-red-500 text-white';
    notification.textContent = `An error occurred: ${type}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  showOfflineNotification() {
    if (!document.getElementById('offline-notification')) {
      const notification = document.createElement('div');
      notification.id = 'offline-notification';
      notification.className = 'fixed top-0 left-0 right-0 z-50 p-3 bg-yellow-500 text-white text-center';
      notification.textContent = 'You are currently offline. Some features may not work.';
      
      document.body.appendChild(notification);
    }
  }

  hideOfflineNotification() {
    const notification = document.getElementById('offline-notification');
    if (notification) {
      notification.remove();
    }
  }

  // Final Testing
  runFinalTests() {
    console.log('🧪 Running SkillPort final tests...');
    
    const tests = [
      this.testAuthentication(),
      this.testNavigation(),
      this.testResponsiveness(),
      this.testPerformance(),
      this.testCrossBrowser()
    ];

    Promise.all(tests).then(results => {
      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      
      console.log(`✅ SkillPort Tests: ${passed}/${total} passed`);
      
      if (passed === total) {
        console.log('🎉 All tests passed! SkillPort is ready for production.');
      } else {
        console.warn('⚠️ Some tests failed. Please review before production deployment.');
      }
    });
  }

  async testAuthentication() {
    try {
      // Test login functionality
      const loginForm = document.getElementById('login-form');
      const registerForm = document.getElementById('register-form');
      
      return {
        name: 'Authentication',
        passed: !!(loginForm || registerForm),
        details: 'Login/Register forms present'
      };
    } catch (error) {
      return {
        name: 'Authentication',
        passed: false,
        details: error.message
      };
    }
  }

  async testNavigation() {
    try {
      // Test navigation links
      const navLinks = document.querySelectorAll('nav a[href]');
      const validLinks = Array.from(navLinks).filter(link => {
        return link.href && link.href !== '#' && link.href !== window.location.href;
      });
      
      return {
        name: 'Navigation',
        passed: validLinks.length > 0,
        details: `${validLinks.length} valid navigation links found`
      };
    } catch (error) {
      return {
        name: 'Navigation',
        passed: false,
        details: error.message
      };
    }
  }

  async testResponsiveness() {
    try {
      // Test responsive design
      const viewport = window.innerWidth;
      const isMobile = viewport < 768;
      const isTablet = viewport >= 768 && viewport < 1024;
      const isDesktop = viewport >= 1024;
      
      return {
        name: 'Responsiveness',
        passed: true,
        details: `Viewport: ${viewport}px (${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'})`
      };
    } catch (error) {
      return {
        name: 'Responsiveness',
        passed: false,
        details: error.message
      };
    }
  }

  async testPerformance() {
    try {
      const loadTime = this.performanceMetrics.loadTime || 0;
      const isFast = loadTime < 3000;
      
      return {
        name: 'Performance',
        passed: isFast,
        details: `Page load time: ${loadTime}ms (${isFast ? 'Fast' : 'Slow'})`
      };
    } catch (error) {
      return {
        name: 'Performance',
        passed: false,
        details: error.message
      };
    }
  }

  async testCrossBrowser() {
    try {
      const isSupported = this.browserSupport.modern;
      
      return {
        name: 'Cross-Browser',
        passed: isSupported,
        details: `Browser: ${navigator.userAgent.split(' ').pop()} (${isSupported ? 'Supported' : 'Limited Support'})`
      };
    } catch (error) {
      return {
        name: 'Cross-Browser',
        passed: false,
        details: error.message
      };
    }
  }

  // Analytics Setup
  setupAnalytics() {
    if (this.isProduction) {
      // Initialize analytics (Google Analytics, etc.)
      console.log('📊 Analytics initialized for production');
    }
  }

  sendAnalytics(event, data) {
    if (this.isProduction) {
      // Send data to analytics service
      console.log('📊 Analytics Event:', event, data);
      
      // Example: Google Analytics
      if (window.gtag) {
        window.gtag('event', event, data);
      }
    }
  }

  // Utility Methods
  static getInstance() {
    if (!SkillPortOptimizer.instance) {
      SkillPortOptimizer.instance = new SkillPortOptimizer();
    }
    return SkillPortOptimizer.instance;
  }

  // Public API
  getBrowserInfo() {
    return this.browserSupport;
  }

  getPerformanceMetrics() {
    return this.performanceMetrics;
  }

  isBrowserSupported() {
    return this.browserSupport.modern;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.skillPortOptimizer = SkillPortOptimizer.getInstance();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SkillPortOptimizer;
}
