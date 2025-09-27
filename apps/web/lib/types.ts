import { Platform, Difficulty, Priority, ProjectStatus, SkillLevel, DayOfWeek } from '@prisma/client'

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Dashboard Types
export interface DashboardSummary {
  totalTasks: number
  completedTasks: number
  currentStreak: number
  weeklyGoal: number
  weeklyProgress: number
  recentActivities: RecentActivity[]
}

export interface RecentActivity {
  id: string
  type: 'task' | 'project' | 'community'
  title: string
  description: string
  timestamp: string
  platform?: Platform
  difficulty?: Difficulty
}

// Stats Types
export interface StatsSummary {
  totalProblems: number
  skillRating: number
  dayStreak: number
  achievements: number
  weeklyProgress: WeeklyProgress[]
  difficultyDistribution: DifficultyStats[]
  platformStats: PlatformStats[]
}

export interface WeeklyProgress {
  day: DayOfWeek
  problems: number
}

export interface DifficultyStats {
  difficulty: Difficulty
  count: number
  percentage: number
  color: string
}

export interface PlatformStats {
  platform: Platform
  problems: number
  percentage: number
}

// Community Types
export interface CommunityData {
  id: string
  name: string
  category: string
  description: string
  members: number
  discussions: number
  isJoined: boolean
}

export interface PostData {
  id: string
  title: string
  description: string
  author: string
  community: string
  platform?: Platform
  difficulty?: Difficulty
  votes: number
  answers: number
  views: number
  createdAt: string
  tags: string[]
  isAnswered: boolean
}

// Task Types
export interface TaskData {
  id: string
  description: string
  platform: Platform
  difficulty: Difficulty
  completed: boolean
  date: string
  projectId?: string
  priority: Priority
  createdAt: string
}

export interface DailyTasksData {
  day: DayOfWeek
  tasks: TaskData[]
  completedCount: number
  totalCount: number
  progressPercentage: number
}

// Project Types
export interface ProjectData {
  id: string
  title: string
  description: string
  status: ProjectStatus
  createdAt: string
  updatedAt: string
  taskCount: number
  completedTasks: number
  progressPercentage: number
}

// Profile Types
export interface ProfileData {
  id: string
  name: string
  email: string
  profilePic?: string
  bio?: string
  theme: string
  notificationSettings: NotificationSettings
  achievements: Achievement[]
  skills: SkillData[]
  linkedAccounts: LinkedAccount[]
}

export interface Achievement {
  id: string
  name: string
  description: string
  earnedAt: string
  icon: string
}

export interface SkillData {
  id: string
  name: string
  level: SkillLevel
  completionPercentage: number
  color: string
}

export interface LinkedAccount {
  platform: Platform
  username: string
  connected: boolean
  lastSync?: string
}

export interface NotificationSettings {
  email: boolean
  push: boolean
  community: boolean
  achievements: boolean
  tasks: boolean
  projects: boolean
}

// Filter Types
export interface TaskFilters {
  platform?: Platform
  difficulty?: Difficulty
  priority?: Priority
  completed?: boolean
  dateFrom?: string
  dateTo?: string
  projectId?: string
}

export interface StatsFilters {
  platform?: Platform
  difficulty?: Difficulty
  dateRange?: 'today' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear' | 'all'
}

export interface CommunityFilters {
  category?: string
  sortBy?: 'popular' | 'recent' | 'members' | 'discussions'
  showJoined?: boolean
}

// API Request Types
export interface CreateTaskRequest {
  description: string
  platform: Platform
  difficulty: Difficulty
  date: string
  projectId?: string
  priority?: Priority
}

export interface UpdateTaskRequest {
  description?: string
  platform?: Platform
  difficulty?: Difficulty
  completed?: boolean
  priority?: Priority
}

export interface CreateProjectRequest {
  title: string
  description?: string
}

export interface UpdateProjectRequest {
  title?: string
  description?: string
  status?: ProjectStatus
}

export interface CreatePostRequest {
  title: string
  description: string
  platform?: Platform
  difficulty?: Difficulty
}

export interface UpdateProfileRequest {
  name?: string
  bio?: string
  profilePic?: string
  theme?: string
  notificationSettings?: Partial<NotificationSettings>
}

// Bulk Operations
export interface BulkTaskUpdate {
  taskIds: string[]
  action: 'complete' | 'delete' | 'update'
  updates?: Partial<UpdateTaskRequest>
}

// Student Dashboard Types
export interface StudentDashboardData {
  userStats: StudentStats
  topPerformances: TopPerformance[]
  activeContests: ActiveContest[]
  recentActivities: StudentActivity[]
}

export interface StudentStats {
  score: number
  problemsSolved: number
  contestsWon: number
  accuracy: number
}

export interface TopPerformance {
  contestName: string
  rank: number
  score: number
  date?: string
}

export interface ActiveContest {
  contestId: string
  title: string
  deadline: string
  status: string
  description?: string
}

export interface StudentActivity {
  type: 'solved_problem' | 'joined_contest' | 'feedback_received' | 'badge_earned'
  title: string
  date: string
  details?: string
}

// Feedback Types
export interface FeedbackData {
  feedbackStats: FeedbackStats
  feedbacks: FeedbackItem[]
}

export interface FeedbackStats {
  total: number
  averageRating: number
  activeMentors: number
  monthlyFeedback: number
}

export interface FeedbackItem {
  id: string
  mentor: string
  type: string
  rating: number
  content: string
  category?: string
  createdAt: string
  contestId?: string
}

export interface FeedbackRequest {
  mentorId?: string
  type: string
  message?: string
}

// Contest Types
export interface ContestData {
  contests: ContestItem[]
  pagination?: PaginationInfo
}

export interface ContestItem {
  id: string
  title: string
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate: string
  description?: string
  difficulty?: string
  maxParticipants?: number
  currentParticipants: number
}

export interface ContestDetails extends ContestItem {
  problems: ProblemSummary[]
  leaderboard: LeaderboardEntry[]
  isRegistered: boolean
  userRank?: number
  userScore?: number
}

export interface ProblemSummary {
  id: string
  title: string
  difficulty: string
  points: number
  solved?: boolean
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  score: number
  problemsSolved: number
  lastSubmission?: string
}

// Contest Participation Types
export interface ParticipantData {
  participant: ParticipantInfo
  submissions: SubmissionInfo[]
}

export interface ParticipantInfo {
  studentId: string
  name: string
  score: number
  rank: number
  status: string
  joinedAt: string
}

export interface SubmissionInfo {
  id: string
  problemId: string
  problemTitle: string
  status: string
  score: number
  submittedAt: string
  language: string
  executionTime?: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
