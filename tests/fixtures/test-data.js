/**
 * Test Data Fixtures
 * Reusable test data for all test suites
 */

const testData = {
  // User fixtures
  users: {
    admin: {
      uid: 'admin-user-123',
      email: 'admin@skillport.com',
      displayName: 'Admin User',
      photoURL: 'https://example.com/admin.jpg',
      role: 'community-admin',
      community: 'admin-community-123',
      emailVerified: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    mentor: {
      uid: 'mentor-user-123',
      email: 'mentor@skillport.com',
      displayName: 'Mentor User',
      photoURL: 'https://example.com/mentor.jpg',
      role: 'mentor',
      community: 'test-community-123',
      emailVerified: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    student: {
      uid: 'student-user-123',
      email: 'student@skillport.com',
      displayName: 'Student User',
      photoURL: 'https://example.com/student.jpg',
      role: 'student',
      community: 'test-community-123',
      emailVerified: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    personal: {
      uid: 'personal-user-123',
      email: 'personal@skillport.com',
      displayName: 'Personal User',
      photoURL: 'https://example.com/personal.jpg',
      role: 'personal',
      community: null,
      emailVerified: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  },

  // Community fixtures
  communities: {
    active: {
      id: 'test-community-123',
      name: 'Test Community',
      code: 'TEST001',
      description: 'A test community for development',
      admin: 'admin-user-123',
      members: ['admin-user-123', 'mentor-user-123', 'student-user-123'],
      mentors: ['mentor-user-123'],
      students: ['student-user-123'],
      settings: {
        allowStudentRegistration: true,
        requireApproval: false,
        maxStudents: 100
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    inactive: {
      id: 'inactive-community-123',
      name: 'Inactive Community',
      code: 'INACTIVE001',
      description: 'An inactive community',
      admin: 'admin-user-123',
      members: ['admin-user-123'],
      mentors: [],
      students: [],
      settings: {
        allowStudentRegistration: false,
        requireApproval: true,
        maxStudents: 50
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }
  },

  // Contest fixtures
  contests: {
    upcoming: {
      id: 'upcoming-contest-123',
      title: 'Upcoming Contest',
      description: 'A contest that will start soon',
      community: 'test-community-123',
      createdBy: 'mentor-user-123',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-31'),
      status: 'upcoming',
      participants: ['student-user-123'],
      submissions: [],
      rules: ['No cheating', 'Submit on time'],
      prizes: [
        { position: 1, description: 'First Place', value: '$100' },
        { position: 2, description: 'Second Place', value: '$50' }
      ],
      maxParticipants: 100,
      difficulty: 'medium',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    active: {
      id: 'active-contest-123',
      title: 'Active Contest',
      description: 'A contest currently running',
      community: 'test-community-123',
      createdBy: 'mentor-user-123',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31'),
      status: 'active',
      participants: ['student-user-123'],
      submissions: ['submission-123'],
      rules: ['No cheating', 'Submit on time'],
      prizes: [
        { position: 1, description: 'First Place', value: '$100' }
      ],
      maxParticipants: 50,
      difficulty: 'hard',
      startedAt: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    completed: {
      id: 'completed-contest-123',
      title: 'Completed Contest',
      description: 'A contest that has ended',
      community: 'test-community-123',
      createdBy: 'mentor-user-123',
      startDate: new Date('2023-12-01'),
      endDate: new Date('2023-12-31'),
      status: 'completed',
      participants: ['student-user-123'],
      submissions: ['submission-123', 'submission-456'],
      rules: ['No cheating', 'Submit on time'],
      prizes: [
        { position: 1, description: 'First Place', value: '$100' }
      ],
      maxParticipants: 25,
      difficulty: 'easy',
      startedAt: new Date('2023-12-01'),
      endedAt: new Date('2023-12-31'),
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2023-12-31')
    }
  },

  // Submission fixtures
  submissions: {
    evaluated: {
      id: 'submission-123',
      userId: 'student-user-123',
      contestId: 'active-contest-123',
      community: 'test-community-123',
      title: 'Two Sum Solution',
      description: 'My solution to the Two Sum problem',
      code: 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}',
      language: 'javascript',
      platform: 'leetcode',
      difficulty: 'easy',
      executionTime: 45,
      memoryUsed: 42.1,
      verdict: 'Accepted',
      score: 85,
      status: 'evaluated',
      evaluatedBy: 'mentor-user-123',
      evaluatedAt: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    pending: {
      id: 'submission-456',
      userId: 'student-user-123',
      contestId: 'active-contest-123',
      community: 'test-community-123',
      title: 'Valid Parentheses Solution',
      description: 'My solution to the Valid Parentheses problem',
      code: 'function isValid(s) {\n  const stack = [];\n  const map = {\n    ")": "(",\n    "}": "{",\n    "]": "["\n  };\n  \n  for (let char of s) {\n    if (char in map) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  \n  return stack.length === 0;\n}',
      language: 'javascript',
      platform: 'leetcode',
      difficulty: 'easy',
      executionTime: 32,
      memoryUsed: 38.5,
      verdict: 'Accepted',
      score: 0,
      status: 'submitted',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16')
    }
  },

  // OTP fixtures
  otps: {
    valid: {
      email: 'test@example.com',
      code: '123456',
      expiry: Date.now() + 600000, // 10 minutes from now
      attempts: 0,
      createdAt: new Date()
    },
    expired: {
      email: 'expired@example.com',
      code: '654321',
      expiry: Date.now() - 600000, // 10 minutes ago
      attempts: 0,
      createdAt: new Date(Date.now() - 1200000) // 20 minutes ago
    },
    maxAttempts: {
      email: 'maxattempts@example.com',
      code: '111111',
      expiry: Date.now() + 600000,
      attempts: 3,
      createdAt: new Date()
    }
  },

  // Notification fixtures
  notifications: {
    welcome: {
      id: 'notification-123',
      userId: 'student-user-123',
      type: 'welcome',
      title: 'Welcome to SkillPort!',
      message: 'Welcome to our platform. Start your coding journey today!',
      read: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    contestStart: {
      id: 'notification-456',
      userId: 'student-user-123',
      type: 'contest_start',
      title: 'Contest Started!',
      message: 'The "Active Contest" has started. Good luck!',
      read: false,
      data: {
        contestId: 'active-contest-123',
        contestTitle: 'Active Contest'
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    submissionEvaluated: {
      id: 'notification-789',
      userId: 'student-user-123',
      type: 'submission_evaluated',
      title: 'Submission Evaluated',
      message: 'Your submission "Two Sum Solution" has been evaluated.',
      read: true,
      data: {
        submissionId: 'submission-123',
        score: 85
      },
      readAt: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  },

  // Leaderboard fixtures
  leaderboard: {
    global: [
      {
        rank: 1,
        userId: 'student-user-123',
        displayName: 'Student User',
        photoURL: 'https://example.com/student.jpg',
        totalScore: 170,
        submissionCount: 2,
        averageScore: 85
      },
      {
        rank: 2,
        userId: 'mentor-user-123',
        displayName: 'Mentor User',
        photoURL: 'https://example.com/mentor.jpg',
        totalScore: 150,
        submissionCount: 1,
        averageScore: 150
      }
    ],
    community: [
      {
        rank: 1,
        userId: 'student-user-123',
        displayName: 'Student User',
        photoURL: 'https://example.com/student.jpg',
        totalScore: 170,
        submissionCount: 2,
        averageScore: 85
      }
    ],
    contest: [
      {
        rank: 1,
        userId: 'student-user-123',
        displayName: 'Student User',
        photoURL: 'https://example.com/student.jpg',
        score: 85,
        submissionId: 'submission-123',
        submittedAt: new Date('2024-01-15'),
        executionTime: 45,
        memoryUsed: 42.1
      }
    ]
  },

  // Analytics fixtures
  analytics: {
    daily: {
      date: '2024-01-15',
      type: 'daily',
      data: {
        users: {
          total: 100,
          new: 5,
          active: 25
        },
        communities: {
          total: 10,
          new: 1
        },
        contests: {
          total: 50,
          new: 2,
          active: 5,
          completed: 43
        },
        submissions: {
          total: 500,
          new: 15
        }
      },
      generatedAt: new Date('2024-01-15')
    }
  },

  // Extension fixtures
  extension: {
    leetcodeSubmission: {
      userId: 'student-user-123',
      platform: 'leetcode',
      questionId: '1',
      title: 'Two Sum',
      difficulty: 'easy',
      verdict: 'Accepted',
      timestamp: 1640995200000,
      submissionId: 'leetcode-sub-123',
      language: 'javascript',
      executionTime: 45,
      memoryUsed: 42.1,
      code: 'function twoSum(nums, target) { /* solution */ }'
    },
    geeksforgeeksSubmission: {
      userId: 'student-user-123',
      platform: 'geeksforgeeks',
      questionId: '2',
      title: 'Valid Parentheses',
      difficulty: 'easy',
      verdict: 'Accepted',
      timestamp: 1640995200000,
      submissionId: 'gfg-sub-456',
      language: 'javascript',
      executionTime: 32,
      memoryUsed: 38.5,
      code: 'function isValid(s) { /* solution */ }'
    }
  },

  // File fixtures
  files: {
    profileImage: {
      name: 'profile.jpg',
      type: 'image/jpeg',
      size: 1024000, // 1MB
      content: Buffer.from('fake-image-data')
    },
    contestAttachment: {
      name: 'problem-statement.pdf',
      type: 'application/pdf',
      size: 2048000, // 2MB
      content: Buffer.from('fake-pdf-data')
    },
    codeFile: {
      name: 'solution.js',
      type: 'text/javascript',
      size: 1024, // 1KB
      content: Buffer.from('console.log("Hello World");')
    }
  },

  // API request fixtures
  requests: {
    createUser: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      role: 'personal',
      experience: 'beginner'
    },
    createCommunity: {
      name: 'Test Community',
      code: 'TEST001',
      description: 'A test community'
    },
    createContest: {
      title: 'Test Contest',
      description: 'A test contest',
      community: 'test-community-123',
      startDate: '2024-01-01T00:00:00Z',
      endDate: '2024-01-31T23:59:59Z',
      difficulty: 'medium'
    },
    createSubmission: {
      contestId: 'test-contest-123',
      title: 'Test Submission',
      description: 'A test submission',
      code: 'console.log("Hello World");',
      language: 'javascript',
      platform: 'leetcode',
      difficulty: 'easy'
    },
    generateOTP: {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User'
    },
    verifyOTP: {
      email: 'test@example.com',
      otp: '123456'
    }
  },

  // Error fixtures
  errors: {
    validation: {
      message: 'Validation failed',
      details: 'Invalid email format'
    },
    unauthorized: {
      message: 'Unauthorized',
      details: 'No token provided'
    },
    forbidden: {
      message: 'Forbidden',
      details: 'Insufficient permissions'
    },
    notFound: {
      message: 'Not found',
      details: 'Resource not found'
    },
    serverError: {
      message: 'Internal server error',
      details: 'Something went wrong'
    }
  }
};

module.exports = testData;
