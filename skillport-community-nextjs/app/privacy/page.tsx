'use client'

import { Shield, Eye, Database, User, Lock, Mail, Phone, MapPin } from 'lucide-react'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              At SkillPort, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
              learning platform and services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Information</h3>
                <p className="text-gray-700 mb-3">
                  We collect information you provide directly to us, such as when you create an account, 
                  participate in contests, or contact us for support.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Name and email address</li>
                  <li>Profile information and preferences</li>
                  <li>Payment and billing information</li>
                  <li>Communication preferences</li>
                  <li>Contest participation and submissions</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Usage Information</h3>
                <p className="text-gray-700 mb-3">
                  We automatically collect certain information about your use of our services.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Device information and IP address</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent</li>
                  <li>Learning progress and achievements</li>
                  <li>Error logs and performance data</li>
                </ul>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Cookies and Tracking</h3>
                <p className="text-gray-700 mb-3">
                  We use cookies and similar technologies to enhance your experience and analyze usage.
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Essential cookies for functionality</li>
                  <li>Analytics cookies for performance monitoring</li>
                  <li>Preference cookies for personalization</li>
                  <li>Marketing cookies for relevant content</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Service Delivery</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Provide learning content and contests</li>
                  <li>• Process payments and subscriptions</li>
                  <li>• Send notifications and updates</li>
                  <li>• Provide customer support</li>
                </ul>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Personalization</h3>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Customize learning experience</li>
                  <li>• Recommend relevant content</li>
                  <li>• Track progress and achievements</li>
                  <li>• Improve platform features</li>
                </ul>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Analytics & Improvement</h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Analyze usage patterns</li>
                  <li>• Monitor performance</li>
                  <li>• Identify and fix issues</li>
                  <li>• Develop new features</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Communication</h3>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Send important updates</li>
                  <li>• Share educational content</li>
                  <li>• Provide contest notifications</li>
                  <li>• Send marketing communications</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li><strong>Service Providers:</strong> Trusted third parties who assist in operating our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>Consent:</strong> When you have given explicit consent to share information</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">Encryption</h3>
                  <p className="text-sm text-gray-600">All data is encrypted in transit and at rest</p>
                </div>
                <div className="text-center">
                  <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">Access Control</h3>
                  <p className="text-sm text-gray-600">Strict access controls and authentication</p>
                </div>
                <div className="text-center">
                  <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900 mb-1">Secure Storage</h3>
                  <p className="text-sm text-gray-600">Data stored in secure, monitored environments</p>
                </div>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights (GDPR)</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Access</h3>
                <p className="text-gray-700 text-sm">You can request a copy of all personal data we hold about you.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Rectification</h3>
                <p className="text-gray-700 text-sm">You can request correction of inaccurate or incomplete data.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Erasure</h3>
                <p className="text-gray-700 text-sm">You can request deletion of your personal data in certain circumstances.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Portability</h3>
                <p className="text-gray-700 text-sm">You can request your data in a structured, machine-readable format.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Right to Object</h3>
                <p className="text-gray-700 text-sm">You can object to processing of your data for certain purposes.</p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700 mb-4">
              We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Account information: Until account deletion or 3 years of inactivity</li>
              <li>Contest data: 2 years after contest completion</li>
              <li>Learning progress: 5 years for analytics and improvement</li>
              <li>Payment records: 7 years for legal and tax purposes</li>
              <li>Communication logs: 2 years for support purposes</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">privacy@skillport.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">123 Learning Street, Tech City, TC 12345</span>
                </div>
              </div>
            </div>
          </section>

          {/* Updates */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Policy Updates</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review 
              this Privacy Policy periodically for any changes.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
