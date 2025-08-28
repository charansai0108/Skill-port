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

// Load user profile
async function loadUserProfile() {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            window.location.href = '../auth/login.html';
            return;
        }

        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const data = await response.json();
        if (data.success) {
            displayUserInfo(data.data);
            displayAdditionalEmails(data.data.additionalEmails || []);
        }
    } catch (error) {
        console.error('Load profile error:', error);
        showNotification('Failed to load profile', 'error');
    }
}

// Display user information
function displayUserInfo(user) {
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('primaryEmail').textContent = user.email;
    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
}

// Display additional emails
function displayAdditionalEmails(emails) {
    const emailList = document.getElementById('emailList');
    
    if (emails.length === 0) {
        emailList.innerHTML = '<p>No additional emails added yet.</p>';
        return;
    }

    emailList.innerHTML = emails.map(email => `
        <div class="email-item">
            <div class="email-info">
                <span class="email-address">${email.email}</span>
                <span class="email-label">${email.label}</span>
                <small style="color: #666; margin-left: 10px;">
                    Added: ${new Date(email.addedAt).toLocaleDateString()}
                </small>
            </div>
            <button class="btn btn-danger" onclick="removeEmail('${email._id}')">Remove</button>
        </div>
    `).join('');
}

// Add additional email
async function addAdditionalEmail(email, label) {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        const response = await fetch(`${API_BASE_URL}/users/add-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ email, label })
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Email added successfully!', 'success');
            displayAdditionalEmails(data.data.additionalEmails);
            document.getElementById('addEmailForm').reset();
        } else {
            showNotification(data.message || 'Failed to add email', 'error');
        }
    } catch (error) {
        console.error('Add email error:', error);
        showNotification('Failed to add email', 'error');
    }
}

// Remove additional email
async function removeEmail(emailId) {
    try {
        const token = localStorage.getItem('skillport_token');
        if (!token) {
            throw new Error('No authentication token');
        }

        const response = await fetch(`${API_BASE_URL}/users/remove-email/${emailId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Email removed successfully!', 'success');
            displayAdditionalEmails(data.data.additionalEmails);
        } else {
            showNotification(data.message || 'Failed to remove email', 'error');
        }
    } catch (error) {
        console.error('Remove email error:', error);
        showNotification('Failed to remove email', 'error');
    }
}

// Handle form submission
document.getElementById('addEmailForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const label = document.getElementById('label').value;
    
    if (!email || !label) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    addAdditionalEmail(email, label);
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile page loaded');
    loadUserProfile();
});
