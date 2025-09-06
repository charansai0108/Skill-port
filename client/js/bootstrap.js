window.__AUTH_BOOTSTRAP_DONE__ = false;
window.__CURRENT_USER__ = undefined;

/**
 * bootstrapAuth:
 * - Now uses Firebase Authentication for secure authentication
 * - Sets window.__CURRENT_USER__ to user object or null
 * - Dispatches 'auth-ready' event when done
 */
async function bootstrapAuth() {
  try {
    console.log('🔐 Bootstrap: Starting Firebase authentication check...');
    
    // Import Firebase Service
    const firebaseService = await import('./firebaseService.js');
    
    // Wait for Firebase auth state to be determined
    return new Promise((resolve) => {
      const unsubscribe = firebaseService.default.onAuthStateChange((user, isAuthenticated) => {
        console.log('🔐 Bootstrap: Firebase auth state determined:', isAuthenticated ? 'User logged in' : 'User logged out');
        
        if (isAuthenticated && user) {
          console.log('🔐 Bootstrap: User authenticated via Firebase:', user);
          window.__CURRENT_USER__ = user;
        } else {
          console.log('🔐 Bootstrap: User not authenticated');
          window.__CURRENT_USER__ = null;
        }
        
        window.__AUTH_BOOTSTRAP_DONE__ = true;
        document.dispatchEvent(new CustomEvent('auth-ready', { detail: window.__CURRENT_USER__ }));
        
        // Unsubscribe after first auth state change
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
        resolve();
      });
    });
    
  } catch (error) {
    console.error('🔐 Bootstrap: Firebase authentication error:', error);
    // Always set bootstrap done to prevent hanging
    window.__CURRENT_USER__ = null;
    window.__AUTH_BOOTSTRAP_DONE__ = true;
    document.dispatchEvent(new CustomEvent('auth-ready', { detail: null }));
  }
}

// Run this immediately on page load
bootstrapAuth();
