import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'
import crypto from 'crypto'

/**
 * Authentication utilities for SkillPort Community
 * 
 * Note: Type assertions (as any) are used for email verification and password reset fields
 * that exist in the Prisma schema but may not be reflected in the generated types
 * until the database is properly synced with `npx prisma db push`
 */

const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

// Ensure JWT_SECRET is defined for type safety
const jwtSecret = JWT_SECRET as string

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  profilePic?: string
  communityId?: string | null
}

export interface StudentUser {
  id: string
  name: string
  email: string
  role: UserRole
  profilePic?: string
  batchId?: string
}

export interface MentorUser {
  id: string
  name: string
  email: string
  role: UserRole
  profilePic?: string
  communityId?: string | null
  subject?: string
}

export interface AuthToken {
  admin?: AdminUser
  student?: StudentUser
  iat: number
  exp: number
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: any): string {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    communityId: user.communityId || null,
    name: user.name
  }
  return jwt.sign(payload, jwtSecret, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, jwtSecret) as AuthToken
  } catch (error) {
    return null
  }
}

export async function authenticateAdmin(email: string, password: string): Promise<AdminUser | null> {
  try {
    const admin = await prisma.admin.findFirst({
      where: { 
        user: { email },
        isActive: true 
      },
      include: { user: true }
    })

    if (!admin) {
      return null
    }

    const isValidPassword = await verifyPassword(password, admin.user.password)
    if (!isValidPassword) {
      return null
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    })

    return {
      id: admin.user.id,
      name: admin.user.name,
      email: admin.user.email,
      role: admin.user.role,
      profilePic: admin.user.profilePic || undefined
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

export async function getCurrentAdmin(request: NextRequest): Promise<AdminUser | null> {
  const token = getTokenFromRequest(request)
  if (!token) {
    return null
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  const userData = (decoded as any)
  if (!userData.id || !userData.role) {
    return null
  }

  // Check if user has admin role
  if (userData.role !== 'ADMIN') {
    return null
  }

  // Verify user still exists and is active
  try {
    const user = await prisma.user.findUnique({
      where: { id: userData.id }
    })

    if (!user || !user.isActive) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic || undefined,
      communityId: user.communityId
    }
  } catch (error) {
    console.error('Error verifying admin:', error)
    return null
  }
}

export async function authenticateStudent(email: string, password: string): Promise<StudentUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return null
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any
    }
  } catch (error) {
    console.error('Student authentication error:', error)
    return null
  }
}

export async function getCurrentStudent(request: NextRequest): Promise<StudentUser | null> {
  const token = getTokenFromRequest(request)
  if (!token) {
    return null
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  const userData = (decoded as any)
  if (!userData.id || !userData.email) {
    return null
  }

  // Verify user still exists
  try {
    const user = await prisma.user.findUnique({
      where: { id: userData.id }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      profilePic: user.profilePic || undefined,
      batchId: user.batchId || undefined
    }
  } catch (error) {
    console.error('Error verifying student:', error)
    return null
  }
}

export async function getCurrentMentor(request: NextRequest): Promise<MentorUser | null> {
  const token = getTokenFromRequest(request)
  if (!token) {
    return null
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  const userData = (decoded as any)
  if (!userData.id || !userData.email) {
    return null
  }

  // Verify user still exists and is a mentor
  try {
    const user = await prisma.user.findUnique({
      where: { id: userData.id }
    })

    if (!user || user.role !== 'MENTOR') {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      profilePic: user.profilePic || undefined,
      communityId: user.communityId || undefined,
      subject: user.subject || undefined
    }
  } catch (error) {
    console.error('Error verifying mentor:', error)
    return null
  }
}

export async function getCurrentUser(request: NextRequest): Promise<StudentUser | null> {
  const token = getTokenFromRequest(request)
  if (!token) {
    return null
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return null
  }

  // Get user data from new JWT structure
  const userData = (decoded as any)
  if (!userData.id || !userData.email) {
    return null
  }

  // Verify user still exists
  try {
    const user = await prisma.user.findUnique({
      where: { id: userData.id }
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      profilePic: user.profilePic || undefined,
      batchId: user.batchId || undefined
    }
  } catch (error) {
    console.error('Error verifying user:', error)
    return null
  }
}

export function createActivityLog(userId: string, action: string, details?: any) {
  return prisma.activityLog.create({
    data: {
      userId,
      action,
      details
    }
  })
}

// Email verification functions
export async function generateEmailVerificationToken(email: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  await prisma.user.update({
    where: { email },
    data: {
      emailVerificationToken: token,
      emailVerificationExpires: expires
    } as any // Type assertion for fields that exist in schema but not in generated types
  })

  return token
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: {
        gt: new Date()
      }
    } as any // Type assertion for fields that exist in schema but not in generated types
  })

  if (!user) {
    return false
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null
    } as any // Type assertion for fields that exist in schema but not in generated types
  })

  return true
}

// Password reset functions
export async function generatePasswordResetToken(email: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email, status: 'ACTIVE' }
  })

  if (!user) {
    return null
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: token,
      passwordResetExpires: expires
    } as any // Type assertion for fields that exist in schema but not in generated types
  })

  return token
}

export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetExpires: {
        gt: new Date()
      }
    } as any // Type assertion for fields that exist in schema but not in generated types
  })

  return user?.id || null
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const userId = await verifyPasswordResetToken(token)
  
  if (!userId) {
    return false
  }

  const hashedPassword = await hashPassword(newPassword)
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null
    } as any // Type assertion for fields that exist in schema but not in generated types
  })

  return true
}

// Enhanced authentication with email verification check
export async function authenticateStudentWithVerification(email: string, password: string): Promise<StudentUser | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email, isActive: true }
    })

    if (!user) {
      return null
    }

    // Check if user is verified
    if (!user.isVerified) {
      throw new Error('USER_NOT_VERIFIED')
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic || undefined,
      batchId: user.batchId || undefined
    }
  } catch (error) {
    console.error('Student authentication error:', error)
    return null
  }
}

// OTP Helper Functions
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function saveOTP(email: string, otp: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  
  await prisma.user.update({
    where: { email },
    data: {
      otpCode: otp,
      otpExpiry: expiresAt
    }
  })
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !user.otpCode || !user.otpExpiry) {
    return false
  }

  // Check if OTP matches and hasn't expired
  if (user.otpCode !== otp) {
    return false
  }

  if (new Date() > user.otpExpiry) {
    return false
  }

  // Clear OTP and mark as verified
  await prisma.user.update({
    where: { email },
    data: {
      otpCode: null,
      otpExpiry: null,
      isVerified: true,
      emailVerified: true
    }
  })

  return true
}

export function generateCommunityCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase()
}
