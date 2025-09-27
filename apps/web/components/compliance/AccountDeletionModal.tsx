'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react'

interface AccountDeletionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AccountDeletionModal({ isOpen, onClose }: AccountDeletionModalProps) {
  const [step, setStep] = useState<'warning' | 'confirmation' | 'processing' | 'success' | 'error'>('warning')
  const [confirmationText, setConfirmationText] = useState('')
  const [reason, setReason] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      setStep('processing')

      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmationText,
          reason,
          feedback
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStep('success')
      } else {
        setStep('error')
      }
    } catch (error) {
      console.error('Delete account error:', error)
      setStep('error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setStep('warning')
    setConfirmationText('')
    setReason('')
    setFeedback('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Account</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          {step === 'warning' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-red-900 mb-2">Warning: Permanent Deletion</h3>
                    <p className="text-sm text-red-800">
                      Deleting your account will permanently remove all your data, including:
                    </p>
                    <ul className="text-sm text-red-800 mt-2 list-disc list-inside space-y-1">
                      <li>All learning progress and achievements</li>
                      <li>Contest participation history</li>
                      <li>Submitted code and solutions</li>
                      <li>Community posts and comments</li>
                      <li>Subscription and payment history</li>
                      <li>All personal information</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-2">30-Day Grace Period</h3>
                    <p className="text-sm text-yellow-800">
                      Your account will be scheduled for deletion in 30 days. You can cancel this request 
                      at any time during this period by contacting support.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => setStep('confirmation')}
                  className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  I Understand, Continue
                </button>
              </div>
            </div>
          )}

          {step === 'confirmation' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Confirm Account Deletion</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for leaving (optional)
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">Select a reason</option>
                      <option value="found_alternative">Found a better alternative</option>
                      <option value="not_useful">Platform not useful for my needs</option>
                      <option value="too_expensive">Too expensive</option>
                      <option value="privacy_concerns">Privacy concerns</option>
                      <option value="technical_issues">Technical issues</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional feedback (optional)
                    </label>
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Help us improve by sharing your feedback..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type "DELETE MY ACCOUNT" to confirm
                    </label>
                    <input
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="DELETE MY ACCOUNT"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDelete}
                  disabled={confirmationText !== 'DELETE MY ACCOUNT' || isDeleting}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Processing...' : 'Delete My Account'}
                </button>
                <button
                  onClick={() => setStep('warning')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Deletion Request</h3>
              <p className="text-gray-600">Please wait while we process your request...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deletion Request Submitted</h3>
              <p className="text-gray-600 mb-4">
                Your account will be deleted in 30 days. You can cancel this request by contacting support.
              </p>
              <button
                onClick={handleClose}
                className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deletion Failed</h3>
              <p className="text-gray-600 mb-4">
                There was an error processing your deletion request. Please try again or contact support.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setStep('confirmation')}
                  className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
