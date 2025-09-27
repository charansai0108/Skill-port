import { trackApiCall, trackError } from './analytics'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
}

class ApiClient {
  private baseUrl: string
  private defaultTimeout: number = 10000
  private defaultRetries: number = 3

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl
  }

  private async makeRequest<T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
      retries = this.defaultRetries
    } = options

    const url = `${this.baseUrl}${endpoint}`
    const startTime = performance.now()

    // Default headers
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers
    }

    // Add auth token if available
    const token = this.getAuthToken()
    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`
    }

    const requestOptions: RequestInit = {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeout)
    }

    let lastError: Error | null = null

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions)
        const duration = performance.now() - startTime

        // Track API call
        await trackApiCall(endpoint, method, response.status, duration)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        return {
          success: true,
          data: data.data || data,
          message: data.message
        }
      } catch (error) {
        lastError = error as Error
        const duration = performance.now() - startTime

        // Track API error
        await trackApiCall(endpoint, method, 500, duration)
        await trackError(lastError, { endpoint, method, attempt })

        // Don't retry on certain errors
        if (error instanceof Error && (
          error.name === 'AbortError' ||
          error.message.includes('401') ||
          error.message.includes('403') ||
          error.message.includes('404')
        )) {
          break
        }

        // Wait before retry (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Request failed after retries'
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  // Generic methods
  async get<T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'PUT', body })
  }

  async patch<T>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'PATCH', body })
  }

  async delete<T>(endpoint: string, options?: Omit<ApiOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // Specific API methods
  async getDashboardData() {
    return this.get('/dashboard')
  }

  async getAnalytics(period: string = '30d') {
    return this.get(`/analytics/overview?period=${period}`)
  }

  async getContests(status?: string) {
    const params = status ? `?status=${status}` : ''
    return this.get(`/contests${params}`)
  }

  async getContestDetails(contestId: string) {
    return this.get(`/contests/${contestId}`)
  }

  async joinContest(contestId: string) {
    return this.post(`/contests/${contestId}/register`)
  }

  async getFeedbacks(filters?: {
    type?: string
    mentorId?: string
    rating?: number
    sortBy?: string
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    const queryString = params.toString()
    return this.get(`/feedbacks${queryString ? `?${queryString}` : ''}`)
  }

  async requestFeedback(data: {
    mentorId?: string
    type: string
    message?: string
  }) {
    return this.post('/feedbacks/request', data)
  }

  async getSubscription() {
    return this.get('/subscription')
  }

  async cancelSubscription(cancelAtPeriodEnd: boolean = true) {
    return this.post('/subscription/cancel', { cancelAtPeriodEnd })
  }

  async createPaymentOrder(planId: string, type: string = 'subscription') {
    return this.post('/payment/create-order', { planId, type })
  }

  async verifyPayment(data: {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
    planId: string
  }) {
    return this.post('/payment/verify-order', data)
  }

  async exportData() {
    return this.get('/user/data-export')
  }

  async deleteAccount(data: {
    confirmationText: string
    reason?: string
    feedback?: string
  }) {
    return this.post('/user/delete-account', data)
  }

  async updateConsent(consentType: string, granted: boolean) {
    return this.post('/user/consent', { consentType, granted })
  }

  async getConsentStatus() {
    return this.get('/user/consent')
  }

  // Extension data methods
  async syncExtensionData(data: {
    platform: string
    submissions: any[]
    lastSync: string
  }) {
    return this.post('/extension/sync', data)
  }

  async getExtensionData() {
    return this.get('/extension/data')
  }
}

// Create singleton instance
export const apiClient = new ApiClient()

// Export types
export type { ApiResponse, ApiOptions }
