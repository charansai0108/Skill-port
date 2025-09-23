// Extension data integration for SkillPort
export interface ExtensionSubmission {
  id: string
  platform: 'leetcode' | 'geeksforgeeks' | 'hackerrank' | 'interviewbit'
  problemTitle: string
  problemUrl: string
  difficulty: 'easy' | 'medium' | 'hard'
  language: string
  status: 'accepted' | 'wrong_answer' | 'time_limit_exceeded' | 'runtime_error'
  executionTime?: number
  memoryUsage?: number
  submittedAt: string
  code?: string
  score?: number
}

export interface ExtensionSyncData {
  platform: string
  submissions: ExtensionSubmission[]
  lastSync: string
  totalSubmissions: number
  acceptedSubmissions: number
  averageTime: number
}

class ExtensionIntegration {
  private isExtensionInstalled: boolean = false
  private syncInterval: NodeJS.Timeout | null = null
  private lastSyncTime: string | null = null

  constructor() {
    this.checkExtensionAvailability()
    this.setupMessageListener()
  }

  private checkExtensionAvailability() {
    if (typeof window !== 'undefined') {
      // Check if extension is available
      this.isExtensionInstalled = !!(window as any).chrome?.runtime?.id
    }
  }

  private setupMessageListener() {
    if (typeof window === 'undefined') return

    // Listen for messages from the extension
    window.addEventListener('message', (event) => {
      if (event.source !== window) return

      if (event.data.type === 'SKILLPORT_EXTENSION_DATA') {
        this.handleExtensionData(event.data.payload)
      }
    })
  }

  private async handleExtensionData(data: ExtensionSyncData) {
    try {
      console.log('Received extension data:', data)
      
      // Sync data with backend
      await this.syncWithBackend(data)
      
      // Update last sync time
      this.lastSyncTime = new Date().toISOString()
      localStorage.setItem('extension_last_sync', this.lastSyncTime)
      
      // Show success notification
      this.showSyncNotification('Data synced successfully!', 'success')
      
    } catch (error) {
      console.error('Failed to sync extension data:', error)
      this.showSyncNotification('Failed to sync data. Please try again.', 'error')
    }
  }

  private async syncWithBackend(data: ExtensionSyncData) {
    const response = await fetch('/api/extension/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error('Failed to sync data with backend')
    }

    return response.json()
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  private showSyncNotification(message: string, type: 'success' | 'error') {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`
    notification.textContent = message

    document.body.appendChild(notification)

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }

  // Public methods
  public async requestExtensionData() {
    if (!this.isExtensionInstalled) {
      this.showSyncNotification('Extension not installed. Please install the SkillPort extension.', 'error')
      return
    }

    try {
      // Send message to extension to request data
      window.postMessage({
        type: 'SKILLPORT_REQUEST_DATA',
        source: 'skillport-web'
      }, '*')

    } catch (error) {
      console.error('Failed to request extension data:', error)
      this.showSyncNotification('Failed to request data from extension.', 'error')
    }
  }

  public async getExtensionData() {
    try {
      const response = await fetch('/api/extension/data', {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch extension data')
      }

      return response.json()
    } catch (error) {
      console.error('Failed to get extension data:', error)
      throw error
    }
  }

  public startAutoSync(intervalMinutes: number = 5) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(() => {
      this.requestExtensionData()
    }, intervalMinutes * 60 * 1000)
  }

  public stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  public isExtensionAvailable(): boolean {
    return this.isExtensionInstalled
  }

  public getLastSyncTime(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('extension_last_sync')
  }

  public async getSubmissionStats() {
    try {
      const data = await this.getExtensionData()
      return {
        totalSubmissions: data.totalSubmissions || 0,
        acceptedSubmissions: data.acceptedSubmissions || 0,
        accuracy: data.totalSubmissions > 0 
          ? ((data.acceptedSubmissions / data.totalSubmissions) * 100).toFixed(2)
          : 0,
        averageTime: data.averageTime || 0,
        lastSync: this.getLastSyncTime()
      }
    } catch (error) {
      console.error('Failed to get submission stats:', error)
      return {
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        accuracy: 0,
        averageTime: 0,
        lastSync: null
      }
    }
  }

  public async getRecentSubmissions(limit: number = 10) {
    try {
      const data = await this.getExtensionData()
      return data.recentSubmissions?.slice(0, limit) || []
    } catch (error) {
      console.error('Failed to get recent submissions:', error)
      return []
    }
  }

  public async getPlatformStats() {
    try {
      const data = await this.getExtensionData()
      return data.platformStats || {}
    } catch (error) {
      console.error('Failed to get platform stats:', error)
      return {}
    }
  }
}

// Create singleton instance
export const extensionIntegration = new ExtensionIntegration()

// Export types
export type { ExtensionSubmission, ExtensionSyncData }
