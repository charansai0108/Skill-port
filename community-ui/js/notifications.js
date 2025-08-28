// Real-time Notification System for SkillPort
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.isInitialized = false;
        this.websocket = null;
        this.notificationContainer = null;
        this.soundEnabled = true;
        this.desktopNotificationsEnabled = false;
        
        this.initialize();
    }

    async initialize() {
        try {
            // Check if user is authenticated
            if (!skillPort.isAuthenticated) {
                return;
            }

            // Request notification permissions
            await this.requestNotificationPermission();
            
            // Create notification container
            this.createNotificationContainer();
            
            // Initialize WebSocket connection
            this.initializeWebSocket();
            
            // Load existing notifications
            await this.loadNotifications();
            
            // Start polling for new notifications
            this.startPolling();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('Notification system initialization error:', error);
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.desktopNotificationsEnabled = permission === 'granted';
        }
    }

    createNotificationContainer() {
        // Create notification container if it doesn't exist
        this.notificationContainer = document.getElementById('notification-container');
        
        if (!this.notificationContainer) {
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.id = 'notification-container';
            this.notificationContainer.className = 'notification-container';
            document.body.appendChild(this.notificationContainer);
        }
    }

    initializeWebSocket() {
        try {
            // In production, this would connect to a real WebSocket server
            // For now, we'll simulate real-time updates with polling
            console.log('WebSocket connection initialized (simulated)');
        } catch (error) {
            console.error('WebSocket initialization error:', error);
        }
    }

    async loadNotifications() {
        try {
            // Load notifications from API
            const response = await skillPort.apiRequest('/notifications');
            if (response.success) {
                this.notifications = response.data.notifications || [];
                this.renderNotifications();
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        }
    }

    startPolling() {
        // Poll for new notifications every 30 seconds
        setInterval(async () => {
            if (skillPort.isAuthenticated) {
                await this.checkForNewNotifications();
            }
        }, 30000);
    }

    async checkForNewNotifications() {
        try {
            const response = await skillPort.apiRequest('/notifications/unread');
            if (response.success && response.data.count > 0) {
                // Show notification badge
                this.updateNotificationBadge(response.data.count);
                
                // Play notification sound
                if (this.soundEnabled) {
                    this.playNotificationSound();
                }
                
                // Show desktop notification
                if (this.desktopNotificationsEnabled) {
                    this.showDesktopNotification('New notifications', `You have ${response.data.count} new notifications`);
                }
            }
        } catch (error) {
            console.error('Failed to check for new notifications:', error);
        }
    }

    async markAsRead(notificationId) {
        try {
            await skillPort.apiRequest(`/notifications/${notificationId}/read`, {
                method: 'PUT'
            });
            
            // Update local state
            const notification = this.notifications.find(n => n._id === notificationId);
            if (notification) {
                notification.isRead = true;
                this.renderNotifications();
            }
            
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    async markAllAsRead() {
        try {
            await skillPort.apiRequest('/notifications/mark-all-read', {
                method: 'PUT'
            });
            
            // Update local state
            this.notifications.forEach(n => n.isRead = true);
            this.renderNotifications();
            
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    }

    renderNotifications() {
        if (!this.notificationContainer) return;

        const unreadCount = this.notifications.filter(n => !n.isRead).length;
        
        // Update notification badge
        this.updateNotificationBadge(unreadCount);
        
        // Render notification list if dropdown is open
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown && dropdown.style.display === 'block') {
            this.renderNotificationList();
        }
    }

    updateNotificationBadge(count) {
        // Update notification badge in navigation
        const badge = document.getElementById('notificationBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
        }
    }

    renderNotificationList() {
        const dropdown = document.getElementById('notificationDropdown');
        if (!dropdown) return;

        if (this.notifications.length === 0) {
            dropdown.innerHTML = `
                <div class="notification-empty">
                    <p>No notifications</p>
                </div>
            `;
            return;
        }

        const notificationHTML = this.notifications.map(notification => `
            <div class="notification-item ${notification.isRead ? 'read' : 'unread'}" 
                 onclick="notificationSystem.markAsRead('${notification._id}')">
                <div class="notification-icon">
                    ${this.getNotificationIcon(notification.type)}
                </div>
                <div class="notification-content">
                    <p class="notification-title">${notification.title}</p>
                    <p class="notification-message">${notification.message}</p>
                    <span class="notification-time">${this.formatNotificationTime(notification.createdAt)}</span>
                </div>
                ${!notification.isRead ? '<div class="notification-dot"></div>' : ''}
            </div>
        `).join('');

        dropdown.innerHTML = `
            <div class="notification-header">
                <h3>Notifications</h3>
                <button class="mark-all-read" onclick="notificationSystem.markAllAsRead()">
                    Mark all as read
                </button>
            </div>
            <div class="notification-list">
                ${notificationHTML}
            </div>
        `;
    }

    getNotificationIcon(type) {
        const icons = {
            'contest_invitation': '🏆',
            'contest_result': '🎯',
            'community_invitation': '🏘️',
            'achievement': '🏅',
            'streak_milestone': '🔥',
            'system': '🔔',
            'default': '📢'
        };
        return icons[type] || icons.default;
    }

    formatNotificationTime(timestamp) {
        const now = new Date();
        const notificationTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }

    showNotification(title, message, type = 'info', duration = 5000) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${this.getNotificationIcon(type)}</div>
                <div class="toast-text">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;

        // Add to notification container
        this.notificationContainer.appendChild(toast);

        // Auto-remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);

        // Play sound
        if (this.soundEnabled) {
            this.playNotificationSound();
        }

        return toast;
    }

    playNotificationSound() {
        try {
            // Create audio context for notification sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.error('Failed to play notification sound:', error);
        }
    }

    showDesktopNotification(title, message) {
        if (this.desktopNotificationsEnabled && 'Notification' in window) {
            new Notification(title, {
                body: message,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: 'skillport-notification'
            });
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        localStorage.setItem('skillport_notification_sound', this.soundEnabled);
        
        // Update UI
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.textContent = this.soundEnabled ? '🔊' : '🔇';
        }
    }

    toggleDesktopNotifications() {
        if ('Notification' in window) {
            if (this.desktopNotificationsEnabled) {
                this.desktopNotificationsEnabled = false;
            } else {
                Notification.requestPermission().then(permission => {
                    this.desktopNotificationsEnabled = permission === 'granted';
                });
            }
            localStorage.setItem('skillport_desktop_notifications', this.desktopNotificationsEnabled);
        }
    }

    // Simulate real-time notifications for testing
    simulateNotification() {
        const types = ['contest_invitation', 'achievement', 'community_invitation', 'system'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const titles = {
            'contest_invitation': 'New Contest Available!',
            'achievement': 'Achievement Unlocked!',
            'community_invitation': 'Community Invitation',
            'system': 'System Update'
        };
        
        const messages = {
            'contest_invitation': 'Join the new "Algorithm Challenge" contest!',
            'achievement': 'Congratulations! You\'ve earned the "Problem Solver" badge.',
            'community_invitation': 'You\'ve been invited to join "Web Developers" community.',
            'system': 'New features have been added to SkillPort!'
        };

        this.showNotification(titles[type], messages[type], type);
    }

    // Cleanup
    destroy() {
        if (this.websocket) {
            this.websocket.close();
        }
        
        if (this.notificationContainer) {
            this.notificationContainer.remove();
        }
    }
}

// Initialize notification system
let notificationSystem;

document.addEventListener('DOMContentLoaded', () => {
    notificationSystem = new NotificationSystem();
});

// Global functions for notification management
window.toggleNotificationSound = () => notificationSystem?.toggleSound();
window.toggleDesktopNotifications = () => notificationSystem?.toggleDesktopNotifications();
window.simulateNotification = () => notificationSystem?.simulateNotification();
