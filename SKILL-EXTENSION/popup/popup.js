// Popup script for SkillPort Tracker extension
class PopupController {
    constructor() {
        this.isConnected = false;
        this.userStats = null;
        this.init();
    }

    async init() {
        console.log("🎯 PopupController: Initializing...");
        
        // Check connection status
        await this.checkConnection();
        
        // Load user stats
        await this.loadUserStats();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log("🎯 PopupController: Initialization complete");
    }

    async checkConnection() {
        try {
            // Check if we can communicate with the background script
            const response = await chrome.runtime.sendMessage({ action: "getStatus" });
            
            if (response && response.connected) {
                this.isConnected = true;
                this.updateConnectionStatus(true);
            } else {
                this.isConnected = false;
                this.updateConnectionStatus(false);
            }
        } catch (error) {
            console.error("🎯 PopupController: Connection check failed:", error);
            this.isConnected = false;
            this.updateConnectionStatus(false);
        }
    }

    updateConnectionStatus(connected) {
        const statusDot = document.getElementById("status-dot");
        const statusText = document.getElementById("status-text");
        
        if (connected) {
            statusDot.classList.remove("disconnected");
            statusText.textContent = "Connected";
        } else {
            statusDot.classList.add("disconnected");
            statusText.textContent = "Disconnected";
        }
    }

    async loadUserStats() {
        try {
            this.showLoading(true);
            
            // Get stats from background script
            const response = await chrome.runtime.sendMessage({ action: "getUserStats" });
            
            if (response && response.success) {
                this.userStats = response.data;
                this.renderStats();
                this.showMessage("Data loaded successfully", "success");
            } else {
                this.showMessage("Failed to load data", "error");
            }
            
            this.showLoading(false);
        } catch (error) {
            console.error("🎯 PopupController: Error loading stats:", error);
            this.showMessage("Error loading data", "error");
            this.showLoading(false);
        }
    }

    renderStats() {
        if (!this.userStats) return;

        // Update today's progress
        document.getElementById("today-submissions").textContent = this.userStats.todaySubmissions || 0;
        document.getElementById("today-accepted").textContent = this.userStats.todayAccepted || 0;
        document.getElementById("current-streak").textContent = this.userStats.currentStreak || 0;
        document.getElementById("total-problems").textContent = this.userStats.totalProblems || 0;

        // Update platform stats
        const platformStats = this.userStats.platformStats || {};
        document.getElementById("leetcode-count").textContent = platformStats.leetcode || 0;
        document.getElementById("hackerrank-count").textContent = platformStats.hackerrank || 0;
        document.getElementById("gfg-count").textContent = platformStats.gfg || 0;
        document.getElementById("interviewbit-count").textContent = platformStats.interviewbit || 0;
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById("refresh-btn").addEventListener("click", () => {
            this.loadUserStats();
        });

        // Open dashboard button
        document.getElementById("open-dashboard-btn").addEventListener("click", () => {
            this.openDashboard();
        });

        // Settings button
        document.getElementById("settings-btn").addEventListener("click", () => {
            this.openSettings();
        });
    }

    openDashboard() {
        // Open the SkillPort dashboard in a new tab
        chrome.tabs.create({
            url: "http://localhost:8002/skillport-personal/student-dashboard.html"
        });
    }

    openSettings() {
        // Open extension settings page
        chrome.tabs.create({
            url: "http://localhost:8002/skillport-personal/profile.html"
        });
    }

    showLoading(show) {
        const loading = document.getElementById("loading");
        const mainContent = document.getElementById("main-content");
        
        if (show) {
            loading.style.display = "block";
            mainContent.style.display = "none";
        } else {
            loading.style.display = "none";
            mainContent.style.display = "block";
        }
    }

    showMessage(message, type) {
        const errorMessage = document.getElementById("error-message");
        const successMessage = document.getElementById("success-message");
        
        // Hide both messages first
        errorMessage.style.display = "none";
        successMessage.style.display = "none";
        
        if (type === "error") {
            errorMessage.textContent = message;
            errorMessage.style.display = "block";
        } else if (type === "success") {
            successMessage.textContent = message;
            successMessage.style.display = "block";
        }
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            errorMessage.style.display = "none";
            successMessage.style.display = "none";
        }, 3000);
    }
}

// Initialize popup when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
    new PopupController();
});

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("🎯 Popup: Received message:", message);
    
    if (message.action === "updateStats") {
        // Update stats when background script sends new data
        const popupController = window.popupController;
        if (popupController) {
            popupController.userStats = message.data;
            popupController.renderStats();
        }
    }
    
    sendResponse({ success: true });
});
