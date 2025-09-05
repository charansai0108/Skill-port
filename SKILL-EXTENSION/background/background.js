// SkillPort Tracker Extension Background Script
class BackgroundController {
    constructor() {
        this.isConnected = false;
        this.userStats = {
            todaySubmissions: 0,
            todayAccepted: 0,
            currentStreak: 0,
            totalProblems: 0,
            platformStats: {
                leetcode: 0,
                hackerrank: 0,
                gfg: 0,
                interviewbit: 0
            }
        };
        this.submissions = [];
        this.init();
    }

    async init() {
        console.log('🔧 BackgroundController: Initializing...');
        
        // Load stored data
        await this.loadStoredData();
        
        // Setup message listeners
        this.setupMessageListeners();
        
        // Check connection to SkillPort API
        await this.checkAPIConnection();
        
        console.log('🔧 BackgroundController: Initialization complete');
    }

    async loadStoredData() {
        try {
            const result = await chrome.storage.local.get(['userStats', 'submissions']);
            
            if (result.userStats) {
                this.userStats = { ...this.userStats, ...result.userStats };
            }
            
            if (result.submissions) {
                this.submissions = result.submissions;
            }
            
            console.log('🔧 BackgroundController: Stored data loaded');
        } catch (error) {
            console.error('🔧 BackgroundController: Error loading stored data:', error);
        }
    }

    async saveStoredData() {
        try {
            await chrome.storage.local.set({
                userStats: this.userStats,
                submissions: this.submissions
            });
            console.log('🔧 BackgroundController: Data saved to storage');
        } catch (error) {
            console.error('🔧 BackgroundController: Error saving data:', error);
        }
    }

    async checkAPIConnection() {
        try {
            // Try to connect to SkillPort API
            const response = await fetch('http://localhost:5001/api/v1/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.isConnected = true;
                console.log('🔧 BackgroundController: API connection established');
            } else {
                this.isConnected = false;
                console.log('🔧 BackgroundController: API connection failed');
            }
        } catch (error) {
            this.isConnected = false;
            console.log('🔧 BackgroundController: API connection error:', error);
        }
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            console.log('🔧 BackgroundController: Received message:', message);
            
            switch (message.action) {
                case 'getStatus':
                    sendResponse({ 
                        success: true, 
                        connected: this.isConnected,
                        data: { isConnected: this.isConnected }
                    });
                    break;
                    
                case 'getUserStats':
                    sendResponse({ 
                        success: true, 
                        data: this.userStats 
                    });
                    break;
                    
                case 'trackSubmission':
                    this.handleSubmissionTracking(message.data, sendResponse);
                    break;
                    
                case 'updateStats':
                    this.updateStats(message.data, sendResponse);
                    break;
                    
                default:
                    sendResponse({ 
                        success: false, 
                        error: 'Unknown action' 
                    });
            }
            
            return true; // Keep message channel open for async response
        });
    }

    async handleSubmissionTracking(submissionData, sendResponse) {
        try {
            console.log('🔧 BackgroundController: Tracking submission:', submissionData);
            
            // Add submission to local storage
            this.submissions.unshift(submissionData);
            
            // Keep only last 100 submissions
            if (this.submissions.length > 100) {
                this.submissions = this.submissions.slice(0, 100);
            }
            
            // Update stats
            this.updateStatsFromSubmission(submissionData);
            
            // Save to storage
            await this.saveStoredData();
            
            // Send to SkillPort API if connected
            if (this.isConnected) {
                await this.sendToAPI(submissionData);
            }
            
            sendResponse({ 
                success: true, 
                message: 'Submission tracked successfully' 
            });
            
        } catch (error) {
            console.error('🔧 BackgroundController: Error tracking submission:', error);
            sendResponse({ 
                success: false, 
                error: error.message 
            });
        }
    }

    updateStatsFromSubmission(submissionData) {
        // Update today's submissions
        const today = new Date().toDateString();
        const submissionDate = new Date(submissionData.submittedAt).toDateString();
        
        if (submissionDate === today) {
            this.userStats.todaySubmissions++;
            
            if (submissionData.status === 'accepted') {
                this.userStats.todayAccepted++;
            }
        }
        
        // Update platform stats
        if (this.userStats.platformStats[submissionData.platform] !== undefined) {
            this.userStats.platformStats[submissionData.platform]++;
        }
        
        // Update total problems (only count accepted)
        if (submissionData.status === 'accepted') {
            this.userStats.totalProblems++;
        }
        
        // Update streak (simplified logic)
        if (submissionData.status === 'accepted' && submissionDate === today) {
            this.userStats.currentStreak = Math.max(this.userStats.currentStreak, 1);
        }
    }

    async sendToAPI(submissionData) {
        try {
            const response = await fetch('http://localhost:5001/api/v1/extension/submission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submissionData)
            });
            
            if (response.ok) {
                console.log('🔧 BackgroundController: Submission sent to API successfully');
            } else {
                console.error('🔧 BackgroundController: API submission failed:', response.status);
            }
        } catch (error) {
            console.error('🔧 BackgroundController: Error sending to API:', error);
        }
    }

    async updateStats(newStats, sendResponse) {
        try {
            this.userStats = { ...this.userStats, ...newStats };
            await this.saveStoredData();
            
            sendResponse({ 
                success: true, 
                message: 'Stats updated successfully' 
            });
        } catch (error) {
            console.error('🔧 BackgroundController: Error updating stats:', error);
            sendResponse({ 
                success: false, 
                error: error.message 
            });
        }
    }
}

// Initialize background controller
const backgroundController = new BackgroundController();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    console.log('🔧 SkillPort Extension installed:', details.reason);
    
    if (details.reason === 'install') {
        // Set default settings
        chrome.storage.local.set({
            userStats: backgroundController.userStats,
            submissions: []
        });
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('🔧 SkillPort Extension started');
});

console.log('🔧 SkillPort background script loaded');
