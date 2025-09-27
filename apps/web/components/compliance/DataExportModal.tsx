'use client'

import { useState } from 'react'
import { Download, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface DataExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DataExportModal({ isOpen, onClose }: DataExportModalProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      setExportStatus('exporting')

      const response = await fetch('/api/user/data-export')
      const data = await response.json()

      if (response.ok) {
        // Create download link
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)
        setExportStatus('success')
      } else {
        setExportStatus('error')
      }
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus('error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `skillport-data-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Export Your Data</h2>
                <p className="text-sm text-gray-600">Download all your data in JSON format</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* What's included */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">What's included in your export:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Personal Information</h4>
                    <p className="text-sm text-gray-600">Profile, settings, preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Learning Data</h4>
                    <p className="text-sm text-gray-600">Tasks, projects, submissions</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Social Data</h4>
                    <p className="text-sm text-gray-600">Posts, comments, badges</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Activity Data</h4>
                    <p className="text-sm text-gray-600">Logs, notifications, history</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            {exportStatus === 'exporting' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <div>
                    <h4 className="font-medium text-blue-900">Exporting your data...</h4>
                    <p className="text-sm text-blue-800">This may take a few moments</p>
                  </div>
                </div>
              </div>
            )}

            {exportStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Export completed!</h4>
                    <p className="text-sm text-green-800">Your data is ready for download</p>
                  </div>
                </div>
              </div>
            )}

            {exportStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <h4 className="font-medium text-red-900">Export failed</h4>
                    <p className="text-sm text-red-800">Please try again or contact support</p>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Privacy Notice</h4>
              <p className="text-sm text-gray-700">
                Your exported data contains personal information. Please keep it secure and don't share it with unauthorized parties. 
                The data is provided in JSON format and can be imported into other compatible platforms.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            {exportStatus === 'idle' && (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {isExporting ? 'Exporting...' : 'Export My Data'}
              </button>
            )}

            {exportStatus === 'success' && (
              <button
                onClick={handleDownload}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Data
              </button>
            )}

            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {exportStatus === 'success' ? 'Done' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
