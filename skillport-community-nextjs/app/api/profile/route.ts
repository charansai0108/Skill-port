import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createResponse, createErrorResponse, getUserIdFromRequest, withErrorHandling, validateRequestBody } from '@/lib/api-utils'
import { ProfileData, UpdateProfileRequest, Achievement, SkillData, LinkedAccount } from '@/lib/types'
import { Platform, SkillLevel } from '@prisma/client'

async function getProfile(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  
  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      badges: {
        orderBy: { earnedAt: 'desc' }
      },
      skills: {
        orderBy: { completionPercentage: 'desc' }
      }
    }
  })

  if (!user) {
    return createErrorResponse('User not found', 404)
  }

  // Get achievements
  const achievements: Achievement[] = user.badges.map(badge => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    earnedAt: badge.earnedAt.toISOString(),
    icon: getAchievementIcon(badge.name)
  }))

  // Get skills with colors
  const skills: SkillData[] = user.skills.map(skill => ({
    id: skill.id,
    name: skill.name,
    level: skill.level,
    completionPercentage: skill.completionPercentage,
    color: getSkillColor(skill.name)
  }))

  // Get linked accounts (mock data for now)
  const linkedAccounts: LinkedAccount[] = [
    {
      platform: Platform.LEETCODE,
      username: 'user123',
      connected: true,
      lastSync: new Date().toISOString()
    },
    {
      platform: Platform.GEEKSFORGEEKS,
      username: 'user456',
      connected: true,
      lastSync: new Date().toISOString()
    },
    {
      platform: Platform.HACKERRANK,
      username: '',
      connected: false
    }
  ]

  const profileData: ProfileData = {
    id: user.id,
    name: user.name,
    email: user.email,
    profilePic: user.profilePic || undefined,
    bio: user.bio || undefined,
    theme: user.theme,
    notificationSettings: user.notificationSettings as any,
    achievements,
    skills,
    linkedAccounts
  }

  return createResponse(profileData)
}

async function updateProfile(request: NextRequest) {
  const userId = getUserIdFromRequest(request)
  
  if (!userId) {
    return createErrorResponse('User ID is required', 401)
  }

  const body: UpdateProfileRequest = await request.json()

  // Update the user
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.bio !== undefined && { bio: body.bio }),
      ...(body.profilePic !== undefined && { profilePic: body.profilePic }),
      ...(body.theme && { theme: body.theme }),
      ...(body.notificationSettings && { 
        notificationSettings: {
          ...body.notificationSettings
        }
      })
    }
  })

  return createResponse(user, 200, 'Profile updated successfully')
}

function getAchievementIcon(achievementName: string): string {
  const iconMap: Record<string, string> = {
    'First Problem Solved': '🎯',
    'Week Streak': '🔥',
    'Algorithm Master': '🧠',
    'Data Structure Expert': '📊',
    'Problem Solver': '💡',
    'Community Helper': '🤝',
    'Project Creator': '🚀',
    'Skill Builder': '⚡'
  }
  
  return iconMap[achievementName] || '🏆'
}

function getSkillColor(skillName: string): string {
  const colorMap: Record<string, string> = {
    'Algorithms': '#3b82f6',
    'Data Structures': '#10b981',
    'Web Development': '#f59e0b',
    'Database': '#8b5cf6',
    'Mobile Development': '#ef4444',
    'System Design': '#06b6d4',
    'Machine Learning': '#84cc16',
    'DevOps': '#f97316'
  }
  
  return colorMap[skillName] || '#6b7280'
}

export const GET = withErrorHandling(getProfile)
export const PATCH = withErrorHandling(updateProfile)
