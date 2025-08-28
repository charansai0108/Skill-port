// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Toggle password visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggleBtn = input.parentNode.querySelector('.password-toggle');
    const eyeIcon = toggleBtn.querySelector('.eye-icon');

    if (input.type === 'password') {
        input.type = 'text';
        eyeIcon.textContent = '🙈';
    } else {
        input.type = 'password';
        eyeIcon.textContent = '👁️';
    }
}

// Redirect to dashboard
function redirectToDashboard(role) {
    const dashboards = {
        'admin': '../admin/admin-dashboard.html',
        'mentor': '../mentor/mentor-dashboard.html',
        'student': '../user/user-dashboard.html',
        'user': '../user/user-dashboard.html'
    };
    
    const dashboardPath = dashboards[role] || dashboards['user'];
    window.location.href = dashboardPath;
}

// Handle form submission
function handleLogin(e) {
    e.preventDefault(); // ← THIS IS THE KEY FIX!
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    console.log('Form submitted:', { email, password });
    
    // Call the async login function
    performLogin(email, password);
}

// Perform the actual login
async function performLogin(email, password) {
    try {
        showNotification('Signing you in...', 'info');
        
        // Call MongoDB API
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        console.log('API response:', data);
        
        if (data.success) {
            // Store token and user data
            localStorage.setItem('skillport_token', data.data.token);
            localStorage.setItem('skillport_user', JSON.stringify(data.data.user));
            localStorage.setItem('skillport_is_authenticated', 'true');
            
            showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to appropriate dashboard
            setTimeout(() => {
                redirectToDashboard(data.data.user.role);
            }, 1000);
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Network error. Please check your connection.', 'error');
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth login page loaded with MongoDB API integration');
    
    // Get the form
    const form = document.getElementById('loginForm');
    console.log('Form found:', form);
    
    if (form) {
        console.log('Adding submit event listener...');
        
        // Add submit event listener
        form.addEventListener('submit', handleLogin);
        
        console.log('Event listener added successfully!');
    } else {
        console.error('Form not found!');
    }
    
    // Auto-focus email input
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.focus();
    }
});
