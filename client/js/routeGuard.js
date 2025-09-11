function waitForAuthReady() {
  return new Promise((resolve) => {
    if (window.__AUTH_BOOTSTRAP_DONE__) return resolve(window.__CURRENT_USER__);
    document.addEventListener('auth-ready', () => resolve(window.__CURRENT_USER__), { once: true });
  });
}

/**
 * routeGuard(targetRoute)
 * targetRoute: { path: '/x', requiresAuth: Boolean, roles: ['admin', ...] }
 * returns true if allowed; false if redirecting.
 */
async function routeGuard(targetRoute) {
  const user = await waitForAuthReady();

  if (targetRoute.requiresAuth && !user) {
    if (sessionStorage.getItem('lastRedirect') === targetRoute.path) return false;
    sessionStorage.setItem('lastRedirect', targetRoute.path);
    window.location.href = '/pages/auth/login.html';
    return false;
  }

  if (targetRoute.roles && (!user || !targetRoute.roles.includes(user.role))) {
    window.location.href = '/pages/auth/unauthorized.html';
    return false;
  }

  return true;
}

// Auto-route guard for pages with data-route attributes
document.addEventListener('DOMContentLoaded', async () => {
  const routeElement = document.querySelector('[data-route]');
  if (routeElement) {
    const routeConfig = JSON.parse(routeElement.dataset.route);
    const allowed = await routeGuard(routeConfig);
    if (!allowed) return;
  }
});
