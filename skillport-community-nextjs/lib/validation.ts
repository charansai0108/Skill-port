import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Sanitize HTML content
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  })
}

// Sanitize text input
export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

// Common validation schemas
export const emailSchema = z.string()
  .email('Invalid email format')
  .max(255, 'Email too long')
  .transform(sanitizeText)

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
  .transform(sanitizeText)

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .min(10, 'Phone number too short')
  .max(20, 'Phone number too long')
  .transform(sanitizeText)

// User registration validation
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  role: z.enum(['STUDENT', 'MENTOR', 'ADMIN']).optional().default('STUDENT'),
  phone: phoneSchema.optional(),
  bio: z.string()
    .max(500, 'Bio too long')
    .optional()
    .transform(val => val ? sanitizeHtml(val) : '')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// User login validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

// Password reset validation
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Contest validation
export const contestSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title too long')
    .transform(sanitizeText),
  description: z.string()
    .max(2000, 'Description too long')
    .optional()
    .transform(val => val ? sanitizeHtml(val) : ''),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  maxParticipants: z.number().int().min(1).max(10000).optional(),
  rules: z.string()
    .max(5000, 'Rules too long')
    .optional()
    .transform(val => val ? sanitizeHtml(val) : '')
}).refine((data) => new Date(data.startDate) < new Date(data.endDate), {
  message: "End date must be after start date",
  path: ["endDate"],
})

// Feedback validation
export const feedbackSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  category: z.enum(['GENERAL', 'CODE_REVIEW', 'CONTEST', 'IMPROVEMENT']),
  rating: z.number().int().min(1).max(5),
  comment: z.string()
    .min(10, 'Comment must be at least 10 characters')
    .max(2000, 'Comment too long')
    .transform(sanitizeHtml),
  contestId: z.string().optional()
})

// Profile update validation
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  bio: z.string()
    .max(500, 'Bio too long')
    .optional()
    .transform(val => val ? sanitizeHtml(val) : ''),
  phone: phoneSchema.optional(),
  theme: z.enum(['light', 'dark']).optional(),
  notificationSettings: z.record(z.boolean()).optional()
})

// File upload validation
export const fileUploadSchema = z.object({
  file: z.any().refine(
    (file) => file instanceof File,
    'File is required'
  ).refine(
    (file) => file.size <= (parseInt(process.env.MAX_FILE_SIZE || '5242880')), // 5MB default
    'File size too large'
  ).refine(
    (file) => {
      const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,application/pdf').split(',')
      return allowedTypes.includes(file.type)
    },
    'File type not allowed'
  )
})

// Generic validation function
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
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

// SQL injection prevention
export function sanitizeSqlInput(input: string): string {
  return input
    .replace(/['"\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comment starts
    .replace(/\*\//g, '') // Remove block comment ends
    .replace(/;/g, '') // Remove semicolons
    .trim()
}

// XSS prevention
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
