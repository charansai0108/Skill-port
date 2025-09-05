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
    const res = await fetch('/api/v1/auth/me', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      window.__CURRENT_USER__ = data.user;
      window.__AUTH_BOOTSTRAP_DONE__ = true;
      document.dispatchEvent(new CustomEvent('auth-ready', { detail: data.user }));
      return;
    }

    if (res.status === 401) {
      const ref = await fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'include' });
      if (ref.ok) {
        const me = await fetch('/api/v1/auth/me', { credentials: 'include' });
        if (me.ok) {
          const data2 = await me.json();
          window.__CURRENT_USER__ = data2.user;
          window.__AUTH_BOOTSTRAP_DONE__ = true;
          document.dispatchEvent(new CustomEvent('auth-ready', { detail: data2.user }));
          return;
        }
      }
    }

    window.__CURRENT_USER__ = null;
    window.__AUTH_BOOTSTRAP_DONE__ = true;
    document.dispatchEvent(new CustomEvent('auth-ready', { detail: null }));
  } catch (err) {
    console.error('bootstrapAuth error', err);
    window.__CURRENT_USER__ = null;
    window.__AUTH_BOOTSTRAP_DONE__ = true;
    document.dispatchEvent(new CustomEvent('auth-ready', { detail: null }));
  }
}

// Run this immediately on page load
bootstrapAuth();
