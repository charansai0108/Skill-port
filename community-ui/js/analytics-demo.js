/**
 * Analytics Demo Data Generator
 * Provides sample data for the Admin Analytics Dashboard
 * This file can be used for development and testing purposes
 */

class AnalyticsDemoData {
  constructor() {
    this.currentDate = new Date();
    this.demoData = null;
  }

  // Generate comprehensive demo analytics data
  generateDemoData() {
    this.demoData = {
      metrics: this.generateMetrics(),
      userGrowth: this.generateUserGrowth(),
      contestPerformance: this.generateContestPerformance(),
      topUsers: this.generateTopUsers(),
      recentActivity: this.generateRecentActivity(),
      reportMetrics: this.generateReportMetrics(),
      realTimeMetrics: this.generateRealTimeMetrics()
    };
    return this.demoData;
  }

  // Generate key performance metrics
  generateMetrics() {
    return {
      totalUsers: 1247,
      userGrowth: 12.5,
      activeContests: 8,
      contestGrowth: 3,
      problemsSolved: 15420,
      problemGrowth: 8.2,
      systemHealth: 98.5
    };
  }

  // Generate user growth data for different time periods
  generateUserGrowth() {
    const periods = {
      7: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], data: [15, 22, 18, 25, 30, 28, 35] },
      30: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], data: [120, 135, 142, 158] },
      90: { labels: ['Month 1', 'Month 2', 'Month 3'], data: [450, 520, 580] },
      365: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], data: [1200, 1350, 1420, 1580] }
    };
    return periods;
  }

  // Generate contest performance data
  generateContestPerformance() {
    const periods = {
      7: { labels: ['Contest A', 'Contest B', 'Contest C'], data: [78, 85, 92] },
      30: { labels: ['DSA Contest', 'Java Challenge', 'Python Basics', 'Web Dev'], data: [82, 88, 75, 91] },
      90: { labels: ['Q1 Contest', 'Q2 Contest', 'Q3 Contest'], data: [85, 89, 87] }
    };
    return periods;
  }

  // Generate top performing users
  generateTopUsers() {
    return [
      {
        firstName: 'Priya',
        lastName: 'Sharma',
        username: 'priyasharma',
        totalScore: 1850,
        contestsParticipated: 18
      },
      {
        firstName: 'Rahul',
        lastName: 'Kumar',
        username: 'rahulkumar',
        totalScore: 1720,
        contestsParticipated: 15
      },
      {
        firstName: 'Amit',
        lastName: 'Patel',
        username: 'amitpatel',
        totalScore: 1680,
        contestsParticipated: 16
      },
      {
        firstName: 'Neha',
        lastName: 'Singh',
        username: 'nehasingh',
        totalScore: 1540,
        contestsParticipated: 14
      },
      {
        firstName: 'Suresh',
        lastName: 'Verma',
        username: 'sureshverma',
        totalScore: 1420,
        contestsParticipated: 12
      }
    ];
  }

  // Generate recent activity
  generateRecentActivity() {
    const activities = [
      'New user registered: @codingmaster2024',
      'Contest "Winter Coding Challenge" started',
      'User @priyasharma solved 3 problems in DSA Contest',
      'Mentor @expertcoder provided feedback to 5 students',
      'System maintenance completed successfully',
      'New contest "Python Advanced" created',
      'User @rahulkumar won Java Programming contest',
      'Platform reached 1500 total users milestone'
    ];

    return activities.map((description, index) => ({
      description,
      timestamp: new Date(Date.now() - (index * 2 * 60 * 60 * 1000)).toISOString()
    }));
  }

  // Generate report metrics
  generateReportMetrics() {
    return {
      userEngagement: 87.5,
      contestSuccessRate: 92.3,
      mentorRating: 4.8,
      systemUptime: 99.9
    };
  }

  // Generate real-time metrics
  generateRealTimeMetrics() {
    return {
      activeUsers: Math.floor(Math.random() * 50) + 30, // 30-80 users
      ongoingContests: Math.floor(Math.random() * 5) + 3, // 3-8 contests
      submissionsToday: Math.floor(Math.random() * 200) + 150 // 150-350 submissions
    };
  }

  // Generate problem difficulty distribution
  generateProblemDifficulty() {
    return {
      labels: ['Easy', 'Medium', 'Hard', 'Expert'],
      data: [35, 40, 18, 7]
    };
  }

  // Generate activity heatmap data
  generateActivityHeatmap() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const heatmapData = [];

    for (let hour = 0; hour < 24; hour++) {
      const dayData = [];
      days.forEach(() => {
        // Generate realistic activity patterns
        let activity;
        if (hour >= 9 && hour <= 17) {
          // Work hours - higher activity
          activity = Math.floor(Math.random() * 40) + 60; // 60-100
        } else if (hour >= 18 && hour <= 22) {
          // Evening - medium activity
          activity = Math.floor(Math.random() * 30) + 30; // 30-60
        } else {
          // Night/early morning - lower activity
          activity = Math.floor(Math.random() * 20) + 10; // 10-30
        }
        dayData.push(activity);
      });
      heatmapData.push(dayData);
    }

    return { days, data: heatmapData };
  }

  // Simulate API responses
  simulateAPIResponse(endpoint, params = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let data;
        
        switch (endpoint) {
          case '/analytics/overview':
            data = this.generateDemoData();
            break;
          
          case '/analytics/user-growth':
            const days = params.days || 30;
            data = this.generateUserGrowth()[days] || this.generateUserGrowth()[30];
            break;
          
          case '/analytics/contest-performance':
            const period = params.days || 30;
            data = this.generateContestPerformance()[period] || this.generateContestPerformance()[30];
            break;
          
          case '/analytics/top-users':
            const limit = params.limit || 10;
            data = this.generateTopUsers().slice(0, limit);
            break;
          
          case '/analytics/recent-activity':
            const activityLimit = params.limit || 10;
            data = this.generateRecentActivity().slice(0, activityLimit);
            break;
          
          case '/analytics/system-health':
            data = this.generateRealTimeMetrics();
            break;
          
          default:
            data = { error: 'Endpoint not found' };
        }

        resolve({
          success: true,
          data: data
        });
      }, Math.random() * 500 + 200); // Random delay between 200-700ms
    });
  }

  // Update real-time metrics periodically
  startRealTimeSimulation(callback) {
    setInterval(() => {
      const newMetrics = this.generateRealTimeMetrics();
      if (callback) {
        callback(newMetrics);
      }
    }, 30000); // Update every 30 seconds
  }

  // Generate contest statistics
  generateContestStats() {
    return {
      totalContests: 24,
      activeContests: 8,
      completedContests: 16,
      averageParticipants: 45,
      averageCompletionRate: 78.5,
      topContest: 'DSA Contest #5',
      mostPopularTopic: 'Data Structures'
    };
  }

  // Generate user demographics
  generateUserDemographics() {
    return {
      ageGroups: {
        '18-25': 45,
        '26-35': 35,
        '36-45': 15,
        '45+': 5
      },
      experienceLevels: {
        'Beginner': 30,
        'Intermediate': 45,
        'Advanced': 20,
        'Expert': 5
      },
      preferredLanguages: {
        'Java': 35,
        'Python': 30,
        'C++': 20,
        'JavaScript': 15
      }
    };
  }

  // Generate learning progress metrics
  generateLearningProgress() {
    return {
      averageTimeToSolve: '45 minutes',
      problemsPerDay: 3.2,
      streakMaintenance: 78,
      topicMastery: {
        'Arrays': 85,
        'Strings': 78,
        'Dynamic Programming': 65,
        'Graphs': 72,
        'Trees': 80
      }
    };
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsDemoData;
} else {
  window.AnalyticsDemoData = AnalyticsDemoData;
}
