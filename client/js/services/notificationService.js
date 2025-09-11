/**
 * Notification Service
 * Handles real-time notifications and user interactions
 */

import { db } from './firebaseClient.js';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

class NotificationService {
    constructor() {
        this.db = db;
        this.notifications = [];
        this.unreadCount = 0;
        this.listeners = [];
        this.isListening = false;
    }

    /**
     * Start listening for notifications
     * @param {string} userId - User ID
     */
    async startListening(userId) {
        if (this.isListening) {
            return;
        }

        try {
            const notificationsQuery = query(
                collection(this.db, 'notifications'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            this.unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
                this.notifications = [];
                let unreadCount = 0;

                snapshot.forEach((doc) => {
                    const notification = {
                        id: doc.id,
                        ...doc.data()
                    };
                    this.notifications.push(notification);
                    
                    if (!notification.read) {
                        unreadCount++;
                    }
                });

                this.unreadCount = unreadCount;
                this.notifyListeners();
            });

            this.isListening = true;
            console.log('Notification listener started');
        } catch (error) {
            console.error('Error starting notification listener:', error);
        }
    }

    /**
     * Stop listening for notifications
     */
    stopListening() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.isListening = false;
            console.log('Notification listener stopped');
        }
    }

    /**
     * Add notification listener
     * @param {Function} callback - Callback function
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * Remove notification listener
     * @param {Function} callback - Callback function
     */
    removeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    /**
     * Notify all listeners
     */
    notifyListeners() {
        this.listeners.forEach(callback => {
            try {
                callback({
                    notifications: this.notifications,
                    unreadCount: this.unreadCount
                });
            } catch (error) {
                console.error('Error in notification listener:', error);
            }
        });
    }

    /**
     * Get notifications
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Notifications array
     */
    async getNotifications(options = {}) {
        try {
            const { limit = 20, offset = 0, unreadOnly = false } = options;
            
            let notificationsQuery = query(
                collection(this.db, 'notifications'),
                where('userId', '==', window.authManager.getUserId()),
                orderBy('createdAt', 'desc')
            );

            if (unreadOnly) {
                notificationsQuery = query(
                    collection(this.db, 'notifications'),
                    where('userId', '==', window.authManager.getUserId()),
                    where('read', '==', false),
                    orderBy('createdAt', 'desc')
                );
            }

            const snapshot = await getDocs(notificationsQuery);
            const notifications = [];

            snapshot.forEach((doc) => {
                notifications.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return notifications.slice(offset, offset + limit);
        } catch (error) {
            console.error('Error getting notifications:', error);
            return [];
        }
    }

    /**
     * Mark notification as read
     * @param {string} notificationId - Notification ID
     * @returns {Promise<boolean>} Success status
     */
    async markAsRead(notificationId) {
        try {
            const notificationRef = doc(this.db, 'notifications', notificationId);
            await updateDoc(notificationRef, {
                read: true,
                readAt: new Date(),
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    /**
     * Mark all notifications as read
     * @returns {Promise<boolean>} Success status
     */
    async markAllAsRead() {
        try {
            const unreadNotifications = this.notifications.filter(n => !n.read);
            
            for (const notification of unreadNotifications) {
                await this.markAsRead(notification.id);
            }
            
            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }

    /**
     * Delete notification
     * @param {string} notificationId - Notification ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteNotification(notificationId) {
        try {
            const notificationRef = doc(this.db, 'notifications', notificationId);
            await deleteDoc(notificationRef);
            return true;
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }

    /**
     * Create notification
     * @param {Object} notificationData - Notification data
     * @returns {Promise<string|null>} Notification ID or null
     */
    async createNotification(notificationData) {
        try {
            const notificationRef = await addDoc(collection(this.db, 'notifications'), {
                ...notificationData,
                userId: window.authManager.getUserId(),
                read: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            return notificationRef.id;
        } catch (error) {
            console.error('Error creating notification:', error);
            return null;
        }
    }

    /**
     * Get notification statistics
     * @returns {Promise<Object>} Statistics object
     */
    async getStats() {
        try {
            const notifications = await this.getNotifications();
            
            const stats = {
                total: notifications.length,
                unread: notifications.filter(n => !n.read).length,
                read: notifications.filter(n => n.read).length,
                byType: {}
            };

            notifications.forEach(notification => {
                const type = notification.type || 'unknown';
                stats.byType[type] = (stats.byType[type] || 0) + 1;
            });

            return stats;
        } catch (error) {
            console.error('Error getting notification stats:', error);
            return {
                total: 0,
                unread: 0,
                read: 0,
                byType: {}
            };
        }
    }

    /**
     * Show notification in browser
     * @param {Object} notification - Notification object
     */
    showBrowserNotification(notification) {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return;
        }

        if (Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: notification.message,
                icon: notification.icon || '/favicon.ico',
                tag: notification.id,
                data: notification.data
            });

            browserNotification.onclick = () => {
                window.focus();
                browserNotification.close();
                
                // Navigate to relevant page based on notification type
                this.handleNotificationClick(notification);
            };

            // Auto-close after 5 seconds
            setTimeout(() => {
                browserNotification.close();
            }, 5000);
        }
    }

    /**
     * Handle notification click
     * @param {Object} notification - Notification object
     */
    handleNotificationClick(notification) {
        switch (notification.type) {
            case 'contest_start':
                window.location.href = '/pages/student/user-contests.html';
                break;
            case 'submission_evaluated':
                window.location.href = '/pages/student/user-contests.html';
                break;
            case 'community_invite':
                window.location.href = '/pages/community.html';
                break;
            case 'mentor_feedback':
                window.location.href = '/pages/student/user-mentor-feedback.html';
                break;
            default:
                window.location.href = '/pages/personal/profile.html';
        }
    }

    /**
     * Request notification permission
     * @returns {Promise<boolean>} Permission granted
     */
    async requestPermission() {
        if (!('Notification' in window)) {
            return false;
        }

        if (Notification.permission === 'granted') {
            return true;
        }

        if (Notification.permission === 'denied') {
            return false;
        }

        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    /**
     * Get current notifications
     * @returns {Array} Notifications array
     */
    getCurrentNotifications() {
        return this.notifications;
    }

    /**
     * Get unread count
     * @returns {number} Unread count
     */
    getUnreadCount() {
        return this.unreadCount;
    }
}

// Create and export singleton instance
const notificationService = new NotificationService();
export default notificationService;
