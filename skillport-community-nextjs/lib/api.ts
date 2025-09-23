import { 
  DashboardSummary, 
  StatsSummary, 
  CommunityData, 
  PostData, 
  TaskData, 
  CreateTaskRequest, 
  UpdateTaskRequest,
  ProjectData,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProfileData,
  UpdateProfileRequest,
  BulkTaskUpdate,
  StatsFilters,
  TaskFilters,
  CommunityFilters
} from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Helper function to get headers with user ID
function getHeaders(): HeadersInit {
  // In a real app, you'd get the user ID from auth context or JWT token
  const userId = 'test-user-id' // This should come from authentication
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId
  }
}

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API request failed')
  }
  
  const data = await response.json()
  if (!data.success) {
    throw new Error(data.error || 'API request failed')
  }
  
  return data.data
}

// Dashboard API
export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      headers: getHeaders()
    })
    return handleResponse<DashboardSummary>(response)
  }
}

// Stats API
export const statsApi = {
  async getSummary(filters?: StatsFilters): Promise<StatsSummary> {
    const params = new URLSearchParams()
    if (filters?.platform) params.append('platform', filters.platform)
    if (filters?.difficulty) params.append('difficulty', filters.difficulty)
    if (filters?.dateRange) params.append('dateRange', filters.dateRange)
    
    const response = await fetch(`${API_BASE_URL}/stats/summary?${params}`, {
      headers: getHeaders()
    })
    return handleResponse<StatsSummary>(response)
  }
}

// Communities API
export const communitiesApi = {
  async getCommunities(filters?: CommunityFilters): Promise<CommunityData[]> {
    const params = new URLSearchParams()
    if (filters?.category) params.append('category', filters.category)
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.showJoined !== undefined) params.append('showJoined', filters.showJoined.toString())
    
    const response = await fetch(`${API_BASE_URL}/communities?${params}`, {
      headers: getHeaders()
    })
    return handleResponse<CommunityData[]>(response)
  },

  async getCommunityPosts(communityId: string): Promise<PostData[]> {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/posts`, {
      headers: getHeaders()
    })
    return handleResponse<PostData[]>(response)
  },

  async createPost(communityId: string, postData: { title: string; description: string; platform?: string; difficulty?: string }): Promise<PostData> {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/posts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(postData)
    })
    return handleResponse<PostData>(response)
  },

  async joinCommunity(communityId: string): Promise<{ communityId: string; joined: boolean }> {
    const response = await fetch(`${API_BASE_URL}/communities/${communityId}/join`, {
      method: 'POST',
      headers: getHeaders()
    })
    return handleResponse<{ communityId: string; joined: boolean }>(response)
  }
}

// Tasks API
export const tasksApi = {
  async getTasks(filters?: TaskFilters): Promise<TaskData[]> {
    const params = new URLSearchParams()
    if (filters?.platform) params.append('platform', filters.platform)
    if (filters?.difficulty) params.append('difficulty', filters.difficulty)
    if (filters?.priority) params.append('priority', filters.priority)
    if (filters?.completed !== undefined) params.append('completed', filters.completed.toString())
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.append('dateTo', filters.dateTo)
    if (filters?.projectId) params.append('projectId', filters.projectId)
    
    const response = await fetch(`${API_BASE_URL}/tasks?${params}`, {
      headers: getHeaders()
    })
    return handleResponse<TaskData[]>(response)
  },

  async createTask(taskData: CreateTaskRequest): Promise<TaskData> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData)
    })
    return handleResponse<TaskData>(response)
  },

  async updateTask(taskId: string, updates: UpdateTaskRequest): Promise<TaskData> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    })
    return handleResponse<TaskData>(response)
  },

  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    await handleResponse<void>(response)
  },

  async bulkUpdateTasks(updates: BulkTaskUpdate): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/tasks/bulk`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    })
    return handleResponse<any>(response)
  },

  async getTodayTasks(): Promise<TaskData[]> {
    const response = await fetch(`${API_BASE_URL}/tasks/today`, {
      headers: getHeaders()
    })
    return handleResponse<TaskData[]>(response)
  }
}

// Projects API
export const projectsApi = {
  async getProjects(): Promise<ProjectData[]> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: getHeaders()
    })
    return handleResponse<ProjectData[]>(response)
  },

  async createProject(projectData: CreateProjectRequest): Promise<ProjectData> {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(projectData)
    })
    return handleResponse<ProjectData>(response)
  },

  async updateProject(projectId: string, updates: UpdateProjectRequest): Promise<ProjectData> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    })
    return handleResponse<ProjectData>(response)
  },

  async deleteProject(projectId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: getHeaders()
    })
    await handleResponse<void>(response)
  }
}

// Profile API
export const profileApi = {
  async getProfile(): Promise<ProfileData> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: getHeaders()
    })
    return handleResponse<ProfileData>(response)
  },

  async updateProfile(updates: UpdateProfileRequest): Promise<ProfileData> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    })
    return handleResponse<ProfileData>(response)
  }
}

// Export all APIs
export const api = {
  dashboard: dashboardApi,
  stats: statsApi,
  communities: communitiesApi,
  tasks: tasksApi,
  projects: projectsApi,
  profile: profileApi
}
