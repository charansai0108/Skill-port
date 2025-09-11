/**
 * Leaderboard Service
 * Handles leaderboard data and real-time updates
 */

import { db } from './firebaseClient.js';
import { collection, query, where, orderBy, onSnapshot, getDocs, limit, startAfter } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

class LeaderboardService {
    constructor() {
        this.db = db;
        this.leaderboards = new Map();
        this.listeners = [];
    }

    /**
     * Get global leaderboard
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Leaderboard data
     */
    async getGlobalLeaderboard(options = {}) {
        try {
            const { timeRange = 'all', limit = 50, offset = 0 } = options;
            
            const apiBaseUrl = window.__SKILLPORT_CONFIG__?.api?.baseUrl || 'https://skillport-a0c39.web.app/api';
            const response = await fetch(`${apiBaseUrl}/leaderboard?timeRange=${timeRange}&limit=${limit}&offset=${offset}`, {
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.success ? result.leaderboard : [];
        } catch (error) {
            console.error('Error getting global leaderboard:', error);
            return [];
        }
    }

    /**
     * Get community leaderboard
     * @param {string} communityId - Community ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Leaderboard data
     */
    async getCommunityLeaderboard(communityId, options = {}) {
        try {
            const { timeRange = 'all', limit = 50, offset = 0 } = options;
            
            const apiBaseUrl = window.__SKILLPORT_CONFIG__?.api?.baseUrl || 'https://skillport-a0c39.web.app/api';
            const response = await fetch(`${apiBaseUrl}/leaderboard?community=${communityId}&timeRange=${timeRange}&limit=${limit}&offset=${offset}`, {
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.success ? result.leaderboard : [];
        } catch (error) {
            console.error('Error getting community leaderboard:', error);
            return [];
        }
    }

    /**
     * Get contest leaderboard
     * @param {string} contestId - Contest ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Leaderboard data
     */
    async getContestLeaderboard(contestId, options = {}) {
        try {
            const { limit = 50, offset = 0 } = options;
            
            const apiBaseUrl = window.__SKILLPORT_CONFIG__?.api?.baseUrl || 'https://skillport-a0c39.web.app/api';
            const response = await fetch(`${apiBaseUrl}/leaderboard?contest=${contestId}&limit=${limit}&offset=${offset}`, {
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.success ? result.leaderboard : [];
        } catch (error) {
            console.error('Error getting contest leaderboard:', error);
            return [];
        }
    }

    /**
     * Get user ranking
     * @param {string} userId - User ID
     * @param {Object} options - Query options
     * @returns {Promise<Object|null>} User ranking data
     */
    async getUserRanking(userId, options = {}) {
        try {
            const { community, contest, timeRange = 'all' } = options;
            
            let url = `${window.__SKILLPORT_CONFIG__?.api?.baseUrl || 'https://skillport-a0c39.web.app/api'}/leaderboard/user/${userId}`;
            const params = new URLSearchParams();
            
            if (community) params.append('community', community);
            if (contest) params.append('contest', contest);
            if (timeRange) params.append('timeRange', timeRange);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.success ? result.ranking : null;
        } catch (error) {
            console.error('Error getting user ranking:', error);
            return null;
        }
    }

    /**
     * Start real-time leaderboard updates
     * @param {string} type - Leaderboard type (global, community, contest)
     * @param {string} id - ID for community or contest
     * @param {Function} callback - Callback function
     */
    startRealTimeUpdates(type, id, callback) {
        const key = `${type}_${id || 'global'}`;
        
        if (this.leaderboards.has(key)) {
            return; // Already listening
        }

        try {
            let leaderboardQuery;
            
            switch (type) {
                case 'community':
                    leaderboardQuery = query(
                        collection(this.db, 'submissions'),
                        where('community', '==', id),
                        where('status', '==', 'evaluated'),
                        orderBy('score', 'desc')
                    );
                    break;
                case 'contest':
                    leaderboardQuery = query(
                        collection(this.db, 'submissions'),
                        where('contestId', '==', id),
                        where('status', '==', 'evaluated'),
                        orderBy('score', 'desc')
                    );
                    break;
                default:
                    leaderboardQuery = query(
                        collection(this.db, 'submissions'),
                        where('status', '==', 'evaluated'),
                        orderBy('score', 'desc')
                    );
            }

            const unsubscribe = onSnapshot(leaderboardQuery, async (snapshot) => {
                const leaderboard = await this.processLeaderboardData(snapshot);
                callback(leaderboard);
            });

            this.leaderboards.set(key, unsubscribe);
        } catch (error) {
            console.error('Error starting real-time leaderboard updates:', error);
        }
    }

    /**
     * Stop real-time leaderboard updates
     * @param {string} type - Leaderboard type
     * @param {string} id - ID for community or contest
     */
    stopRealTimeUpdates(type, id) {
        const key = `${type}_${id || 'global'}`;
        
        if (this.leaderboards.has(key)) {
            this.leaderboards.get(key)();
            this.leaderboards.delete(key);
        }
    }

    /**
     * Process leaderboard data from Firestore snapshot
     * @param {Object} snapshot - Firestore snapshot
     * @returns {Promise<Array>} Processed leaderboard data
     */
    async processLeaderboardData(snapshot) {
        const userScores = new Map();
        
        // Aggregate scores by user
        snapshot.forEach(doc => {
            const data = doc.data();
            const userId = data.userId;
            
            if (!userScores.has(userId)) {
                userScores.set(userId, {
                    userId,
                    totalScore: 0,
                    submissionCount: 0,
                    averageScore: 0
                });
            }
            
            const userScore = userScores.get(userId);
            userScore.totalScore += data.score || 0;
            userScore.submissionCount += 1;
        });

        // Calculate average scores
        userScores.forEach(userScore => {
            userScore.averageScore = userScore.totalScore / userScore.submissionCount;
        });

        // Sort by average score
        const sortedUsers = Array.from(userScores.values())
            .sort((a, b) => b.averageScore - a.averageScore);

        // Get user details and build leaderboard
        const leaderboard = await Promise.all(
            sortedUsers.map(async (user, index) => {
                try {
                    const userDoc = await getDocs(query(
                        collection(this.db, 'users'),
                        where('__name__', '==', user.userId)
                    ));
                    
                    let userData = {};
                    if (!userDoc.empty) {
                        userData = userDoc.docs[0].data();
                    }
                    
                    return {
                        rank: index + 1,
                        userId: user.userId,
                        displayName: userData.displayName || 'Anonymous',
                        photoURL: userData.photoURL || '',
                        totalScore: user.totalScore,
                        submissionCount: user.submissionCount,
                        averageScore: Math.round(user.averageScore * 100) / 100
                    };
                } catch (error) {
                    console.error('Error getting user data:', error);
                    return {
                        rank: index + 1,
                        userId: user.userId,
                        displayName: 'Anonymous',
                        photoURL: '',
                        totalScore: user.totalScore,
                        submissionCount: user.submissionCount,
                        averageScore: Math.round(user.averageScore * 100) / 100
                    };
                }
            })
        );

        return leaderboard;
    }

    /**
     * Get leaderboard statistics
     * @param {string} type - Leaderboard type
     * @param {string} id - ID for community or contest
     * @returns {Promise<Object>} Statistics object
     */
    async getLeaderboardStats(type, id) {
        try {
            let leaderboard;
            
            switch (type) {
                case 'community':
                    leaderboard = await this.getCommunityLeaderboard(id);
                    break;
                case 'contest':
                    leaderboard = await this.getContestLeaderboard(id);
                    break;
                default:
                    leaderboard = await this.getGlobalLeaderboard();
            }

            const stats = {
                totalParticipants: leaderboard.length,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0
            };

            if (leaderboard.length > 0) {
                const scores = leaderboard.map(entry => entry.averageScore || entry.score || 0);
                stats.averageScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
                stats.highestScore = Math.max(...scores);
                stats.lowestScore = Math.min(...scores);
            }

            return stats;
        } catch (error) {
            console.error('Error getting leaderboard stats:', error);
            return {
                totalParticipants: 0,
                averageScore: 0,
                highestScore: 0,
                lowestScore: 0
            };
        }
    }

    /**
     * Get auth token
     * @returns {Promise<string>} Auth token
     */
    async getAuthToken() {
        try {
            if (window.authManager && window.authManager.getCurrentUser()) {
                return await window.authManager.getCurrentUser().getIdToken();
            }
            return '';
        } catch (error) {
            console.error('Error getting auth token:', error);
            return '';
        }
    }

    /**
     * Format leaderboard for display
     * @param {Array} leaderboard - Leaderboard data
     * @param {Object} options - Formatting options
     * @returns {Array} Formatted leaderboard
     */
    formatLeaderboard(leaderboard, options = {}) {
        const { showRank = true, showScore = true, showSubmissions = true } = options;
        
        return leaderboard.map(entry => ({
            ...entry,
            displayScore: showScore ? (entry.averageScore || entry.score || 0) : null,
            displaySubmissions: showSubmissions ? (entry.submissionCount || 0) : null,
            rankDisplay: showRank ? `#${entry.rank}` : null
        }));
    }

    /**
     * Get leaderboard filters
     * @returns {Object} Available filters
     */
    getAvailableFilters() {
        return {
            timeRange: ['all', 'daily', 'weekly', 'monthly'],
            limit: [10, 25, 50, 100],
            sortBy: ['score', 'submissions', 'recent']
        };
    }

    /**
     * Clean up all listeners
     */
    cleanup() {
        this.leaderboards.forEach(unsubscribe => unsubscribe());
        this.leaderboards.clear();
        this.listeners = [];
    }
}

// Create and export singleton instance
const leaderboardService = new LeaderboardService();
export default leaderboardService;
