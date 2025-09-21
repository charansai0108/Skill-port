export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@skillport.com', password: 'admin123' },
  mentor: { email: 'mentor@skillport.com', password: 'mentor123' },
  student: { email: 'student@skillport.com', password: 'student123' },
} as const

export const ROUTES = {
  admin: '/admin/dashboard',
  mentor: '/mentor/dashboard',
  student: '/student/dashboard',
  personal: '/personal/dashboard',
} as const

export const STATS_DATA = {
  activeLearners: '10K+',
  problemsSolved: '500+',
  successRate: '95%',
  learningAccess: '24/7',
  skillCategories: '50+',
  practiceProblems: '1000+',
  support: '24/7',
} as const
