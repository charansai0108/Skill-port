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
        this.flags = [];
        this.init();
    }

    async init() {
        // BackgroundController: Initializing...
        
        // Load stored data
        await this.loadStoredData();
        
        // Setup message listeners
        this.setupMessageListeners();
        
        // Check connection to SkillPort API
        await this.checkAPIConnection();
        
        // BackgroundController: Initialization complete
    }

    async loadStoredData() {
        try {
            const result = await chrome.storage.local.get(['userStats', 'submissions', 'flags']);
            
            if (result.userStats) {
                this.userStats = { ...this.userStats, ...result.userStats };
            }
            
            if (result.submissions) {
                this.submissions = result.submissions;
            }
            if (result.flags) {
                this.flags = result.flags;
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
                submissions: this.submissions,
                flags: this.flags
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
                    console.log('🔧 BackgroundController: Received submission from content script:', message.data);
                    this.handleSubmissionTracking(message.data, sendResponse);
                    break;
                case 'getFlags':
                    sendResponse({ success: true, data: this.flags });
                    break;
                    
                case 'updateStats':
                    this.updateStats(message.data, sendResponse);
                    break;
                    
                case 'testFlagDetection':
                    try {
                        const testFlag = this.testFlagDetection();
                        sendResponse({ 
                            success: true, 
                            flagDetected: !!testFlag,
                            message: testFlag ? 'Test flag detected!' : 'No test flag detected'
                        });
                    } catch (error) {
                        console.error('🔧 BackgroundController: Error in test flag detection:', error);
                        sendResponse({ 
                            success: false, 
                            error: error.message 
                        });
                    }
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

    // Validate submission data
    validateSubmissionData(data) {
        if (!data || typeof data !== 'object') {
            return { valid: false, error: 'Invalid submission data' };
        }

        const required = ['platform', 'difficulty'];
        for (const field of required) {
            if (!data[field] || typeof data[field] !== 'string') {
                return { valid: false, error: `Missing or invalid ${field}` };
            }
        }
        
        // Check for title (can be 'title' or 'problemTitle')
        const title = data.title || data.problemTitle;
        if (!title || typeof title !== 'string') {
            return { valid: false, error: 'Missing or invalid title' };
        }

        const validPlatforms = ['leetcode', 'geeksforgeeks', 'hackerrank', 'interviewbit'];
        if (!validPlatforms.includes(data.platform)) {
            return { valid: false, error: 'Invalid platform' };
        }

        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(data.difficulty)) {
            return { valid: false, error: 'Invalid difficulty' };
        }

        if (title.length > 200) {
            return { valid: false, error: 'Title too long' };
        }
        if (data.code && data.code.length > 10000) {
            return { valid: false, error: 'Code too long' };
        }

        return { valid: true };
    }

    // Sanitize submission data
    sanitizeSubmissionData(data) {
        const title = data.title || data.problemTitle || '';
        return {
            userId: data.userId?.toString().trim() || 'anonymous',
            platform: data.platform?.toString().toLowerCase().trim() || 'leetcode',
            questionId: data.questionId?.toString().trim() || data.slug?.toString().trim() || '',
            title: title.toString().trim().substring(0, 200),
            difficulty: data.difficulty?.toString().toLowerCase().trim() || 'easy',
            code: data.code?.toString().substring(0, 10000) || '',
            verdict: data.verdict?.toString().trim() || 'Unknown',
            timestamp: data.timestamp || Date.now()
        };
    }

    async handleSubmissionTracking(submissionData, sendResponse) {
        try {
            console.log('🔧 BackgroundController: Tracking submission:', submissionData);
            
            // Validate input data
            const validation = this.validateSubmissionData(submissionData);
            if (!validation.valid) {
                console.error('🔧 BackgroundController: Validation failed:', validation.error);
                sendResponse({ success: false, error: validation.error });
                return;
            }

            // Sanitize data
            const sanitizedData = this.sanitizeSubmissionData(submissionData);
            const normalized = this.normalizeSubmission(sanitizedData);
            
            // Add submission to local storage
            const previous = this.submissions[0];
            this.submissions.unshift(normalized);
            
            // Keep only last 100 submissions
            if (this.submissions.length > 100) {
                this.submissions = this.submissions.slice(0, 100);
            }
            
            // Update stats
            this.updateStatsFromSubmission(normalized);
            
            // Only process successful submissions for flag detection
            if (normalized.status === 'accepted' || normalized.verdict === 'Accepted') {
                // Evaluate flag heuristic
                console.log('🔍 BackgroundController: Evaluating flag for submission:', {
                    current: normalized,
                    previous: previous,
                    hasPrevious: !!previous
                });
                
                const flag = this.evaluateFlag(previous, normalized);
                if (flag) {
                    console.log('🚩 BackgroundController: FLAG DETECTED!', flag);
                    
                    // Add code to flag data
                    flag.currentCode = normalized.code || '';
                    flag.previousCode = previous?.code || '';
                    
                    this.flags.unshift(flag);
                    // keep last 100 flags
                    if (this.flags.length > 100) this.flags = this.flags.slice(0, 100);
                
                    // Try to POST to local API with validation
                try {
                    const flagData = {
                        userId: normalized.userId || 'anonymous',
                        platform: normalized.platform,
                        questionId: normalized.questionId,
                        title: normalized.title,
                        difficulty: normalized.difficulty,
                        codePrev: previous?.code || '',
                        codeCurr: normalized.code || '',
                        previous,
                        current: normalized,
                        gapMs: flag.gapMs,
                        // Additional code data for UI display
                        currentCode: normalized.code || '',
                        previousCode: previous?.code || '',
                        currentSubmissionId: normalized.id || normalized.submissionId || '',
                        previousSubmissionId: previous?.id || previous?.submissionId || '',
                        // Flag-specific data
                        flaggedAt: flag.flaggedAt,
                        reason: flag.reason
                    };

                    // Validate flag data before sending
                    const flagValidation = this.validateSubmissionData(flagData);
                    if (flagValidation.valid) {
                        const response = await fetch('http://localhost:5001/api/v1/flags', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(flagData)
                        });

                        if (!response.ok) {
                            const errorText = await response.text();
                            console.warn('🔧 BackgroundController: API error:', response.status, errorText);
                        } else {
                            console.log('🔧 BackgroundController: Flag sent successfully');
                        }
                    } else {
                        console.warn('🔧 BackgroundController: Flag validation failed:', flagValidation.error);
                    }
                } catch (e) {
                    console.warn('🔧 BackgroundController: Failed to POST flag to API', e);
                }
                } // Close the if (flag) block
            }
            
            // Save to storage
            await this.saveStoredData();
            
            // Send to SkillPort API if connected
            if (this.isConnected) {
                await this.sendToAPI(normalized);
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

    normalizeSubmission(sub) {
        const ts = sub.submittedAt || sub.timestamp || Date.now();
        return {
            id: sub.id || sub.submissionId || `${Date.now()}`,
            questionId: sub.questionId || sub.slug || sub.title || 'unknown',
            title: sub.title || sub.name || String(sub.questionId || 'Unknown'),
            difficulty: (sub.difficulty || '').toLowerCase(),
            platform: (sub.platform || '').toLowerCase(),
            status: sub.status || 'accepted',
            code: sub.code || sub.source || '',
            submittedAt: ts,
            timestamp: ts
        };
    }

    evaluateFlag(previous, current) {
        try {
            if (!previous) {
                console.log('🔍 BackgroundController: No previous submission, skipping flag evaluation');
                return null;
            }
            
            const tenMinutesMs = 10 * 60 * 1000;
            const prevTime = new Date(previous.submittedAt || previous.timestamp).getTime();
            const currTime = new Date(current.submittedAt || current.timestamp).getTime();
            if (isNaN(prevTime) || isNaN(currTime)) {
                console.log('🔍 BackgroundController: Invalid timestamps, skipping flag evaluation');
                return null;
            }
            
            const gap = Math.abs(currTime - prevTime);
            const isRapid = gap <= tenMinutesMs;
            const isDifferentQuestion = (previous.questionId || previous.title) !== (current.questionId || current.title);
            const isMediumOrHard = ['medium','hard'].includes((current.difficulty || '').toLowerCase()) && ['medium','hard'].includes((previous.difficulty || '').toLowerCase());
            
            console.log('🔍 BackgroundController: Flag evaluation details:', {
                gap: gap,
                gapMinutes: Math.round(gap / 60000),
                isRapid: isRapid,
                isDifferentQuestion: isDifferentQuestion,
                isMediumOrHard: isMediumOrHard,
                previousQuestion: previous.questionId || previous.title,
                currentQuestion: current.questionId || current.title,
                previousDifficulty: previous.difficulty,
                currentDifficulty: current.difficulty
            });
            
            if (isRapid && isDifferentQuestion && isMediumOrHard) {
                console.log('🚩 BackgroundController: FLAG CONDITIONS MET!');
                console.log('🚩 BackgroundController: Both questions are medium/hard difficulty');
                return {
                    flaggedAt: Date.now(),
                    reason: 'Rapid different medium/hard submissions within 10 minutes',
                    previous: previous,
                    current: current,
                    gapMs: gap
                };
            }
            
            console.log('🔍 BackgroundController: No flag detected - conditions not met');
            return null;
        } catch (e) {
            console.error('🔧 BackgroundController: evaluateFlag error', e);
            return null;
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
            // Check authentication first
            const authResponse = await fetch('http://localhost:5001/api/v1/auth/me', {
                credentials: 'include'
            });
            
            if (!authResponse.ok) {
                console.log('🔧 BackgroundController: User not authenticated, skipping API call');
                return;
            }

            const response = await fetch('http://localhost:5001/api/v1/extension/submission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
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

    // Test function to manually create flags for testing
    testFlagDetection() {
        console.log('🧪 BackgroundController: Testing flag detection...');
        
        // Create test submissions
        const testSubmission1 = {
            id: 'test1',
            questionId: 'two-sum',
            title: 'Two Sum',
            difficulty: 'medium',
            platform: 'leetcode',
            status: 'accepted',
            code: 'test code 1',
            submittedAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago
            timestamp: Date.now() - 5 * 60 * 1000
        };
        
        const testSubmission2 = {
            id: 'test2',
            questionId: 'three-sum',
            title: 'Three Sum',
            difficulty: 'hard',
            platform: 'leetcode',
            status: 'accepted',
            code: 'test code 2',
            submittedAt: Date.now(), // now
            timestamp: Date.now()
        };
        
        // Test flag evaluation
        const flag = this.evaluateFlag(testSubmission1, testSubmission2);
        if (flag) {
            console.log('🧪 BackgroundController: Test flag detected!', flag);
        } else {
            console.log('🧪 BackgroundController: Test flag not detected');
        }
        
        return flag;
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
