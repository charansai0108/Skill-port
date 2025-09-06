async function handleLogin(evt) {
  evt.preventDefault();
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (res.ok && data.ok) {
    window.__CURRENT_USER__ = data.user;
    sessionStorage.removeItem('lastRedirect');

    if (data.user.role === 'community-admin') window.location.href = '/pages/admin/admin-dashboard.html';
    else if (data.user.role === 'mentor') window.location.href = '/pages/mentor/mentor-dashboard.html';
    else if (data.user.role === 'student') window.location.href = '/pages/student/user-dashboard.html';
    else window.location.href = '/pages/personal/index.html';
  } else {
    alert(data.message || 'Login failed');
  }
}

// Attach to login form if it exists
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});
