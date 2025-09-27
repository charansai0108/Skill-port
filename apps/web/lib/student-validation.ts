import { z } from 'zod'

// Feedback request validation schema
export const feedbackRequestSchema = z.object({
  mentorId: z.string().optional(),
  type: z.string().min(1, 'Type is required'),
  message: z.string().optional()
})

// Contest registration validation schema
export const contestRegistrationSchema = z.object({
  terms: z.boolean().optional()
})

// Submission validation schema
export const submissionSchema = z.object({
  problemId: z.string().min(1, 'Problem ID is required'),
  code: z.string().min(1, 'Code is required'),
  language: z.enum(['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust'], {
    errorMap: () => ({ message: 'Invalid programming language' })
  })
})

// Query parameter validation schemas
export const feedbackQuerySchema = z.object({
  type: z.string().optional(),
  mentorId: z.string().optional(),
  rating: z.string().regex(/^[1-5]$/, 'Rating must be between 1 and 5').optional(),
  sortBy: z.enum(['createdAt', 'rating', 'mentor'], {
    errorMap: () => ({ message: 'Invalid sort field' })
  }).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10')
})

export const contestQuerySchema = z.object({
  status: z.enum(['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  sortBy: z.enum(['startDate', 'endDate', 'title', 'createdAt']).default('startDate'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10')
})

export const participantQuerySchema = z.object({
  sortBy: z.enum(['rank', 'score', 'name', 'joinedAt']).default('rank'),
  order: z.enum(['asc', 'desc']).default('asc'),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('50')
})

export const submissionQuerySchema = z.object({
  userId: z.string().optional(),
  problemId: z.string().optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR']).optional(),
  language: z.string().optional(),
  sortBy: z.enum(['submittedAt', 'score', 'status']).default('submittedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20')
})

// Validation helper function
export function validateRequest<T>(schema: z.ZodSchema<T>, data: any): { success: boolean; data?: T; errors?: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      return { success: false, errors }
    }
    return { success: false, errors: ['Validation failed'] }
  }
}

// Validation middleware helper
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  data: any
): T {
  const result = validateRequest(schema, data)
  if (!result.success) {
    throw new Error(`Validation failed: ${result.errors?.join(', ')}`)
  }
  return result.data!
}
