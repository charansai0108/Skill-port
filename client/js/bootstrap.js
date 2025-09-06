window.__AUTH_BOOTSTRAP_DONE__ = false;
window.__CURRENT_USER__ = undefined;

/**
 * bootstrapAuth:
 * - Tries /api/v1/auth/me with credentials: 'include'
 * - If 401, tries /api/v1/auth/refresh (POST) to rotate access token, then /me again
 * - Sets window.__CURRENT_USER__ to user object or null
 * - Dispatches 'auth-ready' event when done
 */
async function bootstrapAuth() {
  try {
    console.log('🔐 Bootstrap: Starting authentication check...');
    
    // First attempt: try to get current user
    const res = await fetch('/api/v1/auth/me', { 
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('🔐 Bootstrap: /me response:', data);
      
      // Standardized format: {success: true, data: {user: ...}}
      if (data.success && data.data && data.data.user) {
        const user = data.data.user;
        console.log('🔐 Bootstrap: User authenticated:', user);
        window.__CURRENT_USER__ = user;
        window.__AUTH_BOOTSTRAP_DONE__ = true;
        document.dispatchEvent(new CustomEvent('auth-ready', { detail: user }));
        return;
      } else {
        console.warn('🔐 Bootstrap: Invalid response format:', data);
        throw new Error('Invalid response format');
      }
    }

    // If 401, try refresh token
    if (res.status === 401) {
      console.log('🔐 Bootstrap: 401 received, attempting refresh...');
      const refreshRes = await fetch('/api/v1/auth/refresh', { 
        method: 'POST', 
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        console.log('🔐 Bootstrap: Refresh response:', refreshData);
        
        if (refreshData.success && refreshData.data && refreshData.data.user) {
          const user = refreshData.data.user;
          console.log('🔐 Bootstrap: User authenticated after refresh:', user);
          window.__CURRENT_USER__ = user;
          window.__AUTH_BOOTSTRAP_DONE__ = true;
          document.dispatchEvent(new CustomEvent('auth-ready', { detail: user }));
          return;
        }
      }
    }

    // If all attempts fail, set unauthenticated state
    console.log('🔐 Bootstrap: Authentication failed, setting unauthenticated state');
    window.__CURRENT_USER__ = null;
    window.__AUTH_BOOTSTRAP_DONE__ = true;
    document.dispatchEvent(new CustomEvent('auth-ready', { detail: null }));
    
  } catch (error) {
    console.error('🔐 Bootstrap: Authentication error:', error);
    // Always set bootstrap done to prevent hanging
    window.__CURRENT_USER__ = null;
    window.__AUTH_BOOTSTRAP_DONE__ = true;
    document.dispatchEvent(new CustomEvent('auth-ready', { detail: null }));
  }
}

// Run this immediately on page load
bootstrapAuth();
