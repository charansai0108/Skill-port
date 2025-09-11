// SkillPort Tracker Extension Popup Script
class PopupController {
    constructor() {
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
        this.flags = [];
        this.init();
    }

    async init() {
        console.log('🔧 PopupController: Initializing...');
        
        try {
            // Load stored data
            await this.loadStoredData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Update UI
            this.updateUI();
            this.renderFlags();
            
            // Hide loading, show content
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';
            
        } catch (error) {
            console.error('🔧 PopupController: Error initializing:', error);
            this.showError('Failed to load stats');
        }
    }

    async loadStoredData() {
        try {
            const result = await chrome.storage.local.get(['userStats', 'submissions', 'flags']);
            
            if (result.userStats) {
                this.userStats = { ...this.userStats, ...result.userStats };
            }
            
            if (result.submissions) {
                this.calculateTodayStats(result.submissions);
            }
            
            if (result.flags) {
                this.flags = result.flags;
            }
            
            console.log('🔧 PopupController: Stored data loaded:', this.userStats);
        } catch (error) {
            console.error('🔧 PopupController: Error loading stored data:', error);
        }
    }

    calculateTodayStats(submissions) {
        const today = new Date().toDateString();
        const todaySubmissions = submissions.filter(sub => 
            new Date(sub.timestamp).toDateString() === today
        );
        
        this.userStats.todaySubmissions = todaySubmissions.length;
        this.userStats.todayAccepted = todaySubmissions.filter(sub => sub.status === 'accepted').length;
        
        // Calculate streak
        this.userStats.currentStreak = this.calculateStreak(submissions);
        
        // Calculate total problems
        this.userStats.totalProblems = submissions.length;
        
        // Calculate platform stats
        this.userStats.platformStats = {
            leetcode: submissions.filter(sub => sub.platform === 'leetcode').length,
            hackerrank: submissions.filter(sub => sub.platform === 'hackerrank').length,
            gfg: submissions.filter(sub => sub.platform === 'gfg').length,
            interviewbit: submissions.filter(sub => sub.platform === 'interviewbit').length
        };
    }

    calculateStreak(submissions) {
        if (submissions.length === 0) return 0;
        
        const sortedSubmissions = submissions
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        let streak = 0;
        let currentDate = new Date();
        
        for (const submission of sortedSubmissions) {
            const submissionDate = new Date(submission.timestamp);
            const daysDiff = Math.floor((currentDate - submissionDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === streak) {
                streak++;
                currentDate = submissionDate;
            } else if (daysDiff > streak) {
                break;
            }
        }
        
        return streak;
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshStats();
        });
        
        // Sync button
        document.getElementById('syncBtn').addEventListener('click', () => {
            this.syncWithPlatforms();
        });
        
        // Test flag button
        document.getElementById('testFlagBtn').addEventListener('click', () => {
            this.testFlagDetection();
        });
    }

    updateUI() {
        // Update main stats
        document.getElementById('todaySubmissions').textContent = this.userStats.todaySubmissions;
        document.getElementById('todayAccepted').textContent = this.userStats.todayAccepted;
        document.getElementById('currentStreak').textContent = this.userStats.currentStreak;
        document.getElementById('totalProblems').textContent = this.userStats.totalProblems;
        
        // Update platform stats
        document.getElementById('leetcodeCount').textContent = this.userStats.platformStats.leetcode;
        document.getElementById('hackerrankCount').textContent = this.userStats.platformStats.hackerrank;
        document.getElementById('gfgCount').textContent = this.userStats.platformStats.gfg;
        document.getElementById('interviewbitCount').textContent = this.userStats.platformStats.interviewbit;
    }

    renderFlags() {
        const container = document.getElementById('flagsContainer');
        const section = document.getElementById('flagsSection');
        
        if (!container || !section) return;
        
        if (!this.flags || this.flags.length === 0) {
            container.innerHTML = '<div class="no-flags">No flags detected</div>';
            section.style.display = 'none';
            return;
        }
        
        // Show flags section
        section.style.display = 'block';
        
        // Render flags (show last 5)
        container.innerHTML = this.flags.slice(0, 5).map(flag => `
            <div class="flag-item">
                <div class="flag-time">${new Date(flag.flaggedAt).toLocaleString()}</div>
                <div class="flag-reason">${flag.reason}</div>
                <div class="flag-questions">
                    <div>Previous: ${flag.previous?.title || 'Unknown'} (${flag.previous?.difficulty || 'Unknown'})</div>
                    <div>Current: ${flag.current?.title || 'Unknown'} (${flag.current?.difficulty || 'Unknown'})</div>
                </div>
                <div class="flag-gap">Time gap: ${(flag.gapMs / 60000).toFixed(1)} minutes</div>
                <div class="flag-codes">
                    <details class="code-details">
                        <summary class="code-summary">View Code Comparison</summary>
                        <div class="code-comparison">
                            <div class="code-section">
                                <h4>Previous Code (${flag.previous?.title || 'Unknown'}):</h4>
                                <pre class="code-block">${flag.previousCode || 'No code available'}</pre>
                            </div>
                            <div class="code-section">
                                <h4>Current Code (${flag.current?.title || 'Unknown'}):</h4>
                                <pre class="code-block">${flag.currentCode || 'No code available'}</pre>
                            </div>
                        </div>
                    </details>
                </div>
            </div>
        `).join('');
        
        console.log('🚩 PopupController: Rendered', this.flags.length, 'flags');
    }

    async refreshStats() {
        try {
            document.getElementById('refreshBtn').textContent = 'Refreshing...';
            document.getElementById('refreshBtn').disabled = true;
            
            // Reload data
            await this.loadStoredData();
            this.updateUI();
            this.renderFlags();
            
            document.getElementById('refreshBtn').textContent = 'Refresh Stats';
            document.getElementById('refreshBtn').disabled = false;
            
        } catch (error) {
            console.error('🔧 PopupController: Error refreshing stats:', error);
            this.showError('Failed to refresh stats');
        }
    }

    async syncWithPlatforms() {
        try {
            document.getElementById('syncBtn').textContent = 'Syncing...';
            document.getElementById('syncBtn').disabled = true;
            
            // Send message to background script to sync
            chrome.runtime.sendMessage({ action: 'syncPlatforms' }, (response) => {
                if (response && response.success) {
                    // Reload data after sync
                    this.loadStoredData().then(() => {
                        this.updateUI();
                        this.renderFlags();
                        document.getElementById('syncBtn').textContent = 'Sync with Platforms';
                        document.getElementById('syncBtn').disabled = false;
                    });
                } else {
                    this.showError('Failed to sync with platforms');
                    document.getElementById('syncBtn').textContent = 'Sync with Platforms';
                    document.getElementById('syncBtn').disabled = false;
                }
            });
            
        } catch (error) {
            console.error('🔧 PopupController: Error syncing with platforms:', error);
            this.showError('Failed to sync with platforms');
            document.getElementById('syncBtn').textContent = 'Sync with Platforms';
            document.getElementById('syncBtn').disabled = false;
        }
    }

    async testFlagDetection() {
        try {
            document.getElementById('testFlagBtn').textContent = 'Testing...';
            document.getElementById('testFlagBtn').disabled = true;
            
            // Send message to background script to test flag detection
            chrome.runtime.sendMessage({ action: 'testFlagDetection' }, (response) => {
                if (response && response.success) {
                    console.log('🧪 PopupController: Flag test completed');
                    // Reload data after test
                    this.loadStoredData().then(() => {
                        this.updateUI();
                        this.renderFlags();
                        document.getElementById('testFlagBtn').textContent = 'Test Flag Detection';
                        document.getElementById('testFlagBtn').disabled = false;
                    });
                } else {
                    console.log('🧪 PopupController: Flag test failed');
                    document.getElementById('testFlagBtn').textContent = 'Test Flag Detection';
                    document.getElementById('testFlagBtn').disabled = false;
                }
            });
            
        } catch (error) {
            console.error('🔧 PopupController: Error testing flag detection:', error);
            document.getElementById('testFlagBtn').textContent = 'Test Flag Detection';
            document.getElementById('testFlagBtn').disabled = false;
        }
    }

    showError(message) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'none';
        document.getElementById('error').style.display = 'block';
        document.getElementById('error').textContent = message;
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupController();
});
