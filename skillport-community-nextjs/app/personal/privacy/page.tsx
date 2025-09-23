'use client'

import { useState, useEffect } from 'react'
import { Shield, Download, Trash2, Settings, Bell, Mail, Smartphone, BarChart3, Target } from 'lucide-react'
import { DataExportModal } from '@/components/compliance/DataExportModal'
import { AccountDeletionModal } from '@/components/compliance/AccountDeletionModal'

interface ConsentStatus {
  [key: string]: {
    granted: boolean
    grantedAt: string
    revokedAt?: string
  }
}

export default function PrivacySettingsPage() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>({})
  const [showExportModal, setShowExportModal] = useState(false)
  const [showDeletionModal, setShowDeletionModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConsentStatus()
  }, [])

  const fetchConsentStatus = async () => {
    try {
      const response = await fetch('/api/user/consent')
      const data = await response.json()
      
      if (response.ok) {
        setConsentStatus(data.consentStatus)
      }
    } catch (error) {
      console.error('Failed to fetch consent status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConsentChange = async (consentType: string, granted: boolean) => {
    try {
      const response = await fetch('/api/user/consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consentType,
          granted
        }),
      })

      if (response.ok) {
        await fetchConsentStatus()
      }
    } catch (error) {
      console.error('Failed to update consent:', error)
    }
  }

  const getConsentStatus = (consentType: string) => {
    return consentStatus[consentType]?.granted || false
  }

  const consentTypes = [
    {
      key: 'COOKIES_ANALYTICS',
      name: 'Analytics Cookies',
      description: 'Help us understand how you use our platform to improve performance and user experience.',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'blue'
    },
    {
      key: 'COOKIES_MARKETING',
      name: 'Marketing Cookies',
      description: 'Used to display relevant advertisements and track marketing campaign effectiveness.',
      icon: <Target className="w-5 h-5" />,
      color: 'purple'
    },
    {
      key: 'EMAIL_NOTIFICATIONS',
      name: 'Email Notifications',
      description: 'Receive important updates, contest notifications, and educational content via email.',
      icon: <Mail className="w-5 h-5" />,
      color: 'green'
    },
    {
      key: 'SMS_NOTIFICATIONS',
      name: 'SMS Notifications',
      description: 'Receive urgent updates and contest reminders via text message.',
      icon: <Smartphone className="w-5 h-5" />,
      color: 'yellow'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'purple':
        return 'bg-purple-50 border-purple-200 text-purple-700'
      case 'green':
        return 'bg-green-50 border-green-200 text-green-700'
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading privacy settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Privacy Settings</h1>
              <p className="text-gray-600">Manage your privacy preferences and data</p>
            </div>
          </div>
        </div>

        {/* Consent Management */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Consent Management</h2>
          
          <div className="space-y-4">
            {consentTypes.map((consent) => (
              <div key={consent.key} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getColorClasses(consent.color)}`}>
                        {consent.icon}
                      </div>
                      <h3 className="font-semibold text-gray-900">{consent.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{consent.description}</p>
                    <div className="text-xs text-gray-500">
                      Status: {getConsentStatus(consent.key) ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={getConsentStatus(consent.key)}
                      onChange={(e) => handleConsentChange(consent.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Data Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Data Export */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Export Your Data</h3>
                  <p className="text-sm text-gray-600">Download all your data in JSON format</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Get a complete copy of all your data including learning progress, 
                contest participation, and personal information.
              </p>
              <button
                onClick={() => setShowExportModal(true)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Export Data
              </button>
            </div>

            {/* Account Deletion */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-600">Permanently delete your account</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                This will permanently delete all your data. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeletionModal(true)}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Privacy Rights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">GDPR Rights</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Right to access your personal data</li>
                <li>• Right to rectify inaccurate data</li>
                <li>• Right to erasure (right to be forgotten)</li>
                <li>• Right to data portability</li>
                <li>• Right to object to processing</li>
                <li>• Right to restrict processing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Data Protection</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• All data is encrypted in transit and at rest</li>
                <li>• Regular security audits and updates</li>
                <li>• Limited access to personal data</li>
                <li>• Secure data storage and backup</li>
                <li>• Compliance with privacy regulations</li>
                <li>• Transparent data processing practices</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Need Help?</h4>
            <p className="text-sm text-blue-800 mb-3">
              If you have questions about your privacy or want to exercise your rights, 
              please contact our privacy team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="mailto:privacy@skillport.com"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                privacy@skillport.com
              </a>
              <a
                href="/privacy"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DataExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
      
      <AccountDeletionModal
        isOpen={showDeletionModal}
        onClose={() => setShowDeletionModal(false)}
      />
    </div>
  )
}
