import { z } from 'zod'

// Contest validation schemas
export const createContestSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(500, 'Description must be less than 500 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50, 'Category must be less than 50 characters'),
  batchId: z.string().uuid('Invalid batch ID'),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  maxParticipants: z.number().int().min(1, 'Max participants must be at least 1').max(1000, 'Max participants must be less than 1000').optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional()
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: 'Start date must be before end date',
  path: ['endDate']
})

export const updateContestSchema = createContestSchema.partial()

export const contestParticipantSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  contestId: z.string().uuid('Invalid contest ID')
})

// Problem validation schemas
export const createProblemSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  points: z.number().int().min(1, 'Points must be at least 1').max(1000, 'Points must be less than 1000'),
  timeLimit: z.number().int().min(1, 'Time limit must be at least 1 second').max(3600, 'Time limit must be less than 1 hour'),
  memoryLimit: z.number().int().min(1, 'Memory limit must be at least 1 MB').max(1024, 'Memory limit must be less than 1 GB'),
  testCases: z.array(z.object({
    input: z.string().min(1, 'Test case input is required'),
    expectedOutput: z.string().min(1, 'Test case expected output is required'),
    isHidden: z.boolean().optional()
  })).min(1, 'At least one test case is required')
})

export const updateProblemSchema = createProblemSchema.partial()

// Feedback validation schemas
export const createFeedbackSchema = z.object({
  studentId: z.string().uuid('Invalid student ID'),
  contestId: z.string().uuid('Invalid contest ID').optional(),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be less than 1000 characters'),
  category: z.enum(['PERFORMANCE', 'BEHAVIOR', 'TECHNICAL', 'GENERAL']).optional()
})

export const updateFeedbackSchema = createFeedbackSchema.partial()

// Profile validation schemas
export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format').optional(),
  location: z.string().min(2, 'Location must be at least 2 characters').max(100, 'Location must be less than 100 characters').optional(),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio must be less than 500 characters').optional(),
  specialization: z.array(z.string()).max(10, 'Maximum 10 specializations allowed').optional()
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0, 'Page must be greater than 0').optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100').optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

export const contestFilterSchema = z.object({
  status: z.enum(['upcoming', 'active', 'completed']).optional(),
  category: z.string().optional(),
  batchId: z.string().uuid().optional(),
  search: z.string().optional()
})

export const leaderboardFilterSchema = z.object({
  contestId: z.string().uuid().optional(),
  batchId: z.string().uuid().optional(),
  timeRange: z.enum(['week', 'month', 'year', 'all']).optional()
})

// File upload validation
export const fileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string(),
  size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'), // 5MB limit
  buffer: z.instanceof(Buffer)
})

export const imageUploadSchema = fileUploadSchema.refine(
  (file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.mimetype),
  'Only JPEG, PNG, GIF, and WebP images are allowed'
)

// Validation helper functions
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
    return {
      success: false,
      errors: ['Validation failed']
    }
  }
}

export function validateQueryParams<T>(schema: z.ZodSchema<T>, searchParams: URLSearchParams): { success: true; data: T } | { success: false; errors: string[] } {
  const params = Object.fromEntries(searchParams.entries())
  return validateData(schema, params)
}
