// components/admin/NotificationCenter.tsx
'use client'

import { useState } from 'react'
import { Bell, Mail, Settings, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NotificationCenter() {
  const [testEmail, setTestEmail] = useState('')
  const [testType, setTestType] = useState('welcome')
  const [isSending, setIsSending] = useState(false)

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter an email address')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch('/api/admin/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: testType,
          email: testEmail
        })
      })

      if (response.ok) {
        toast.success('Test email sent successfully')
        setTestEmail('')
      } else {
        throw new Error('Failed to send test email')
      }
    } catch (error) {
      toast.error('Failed to send test email')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Settings
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Email Settings */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">Email Notifications</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Send order confirmation emails</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Send order status update emails</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Send low stock alerts to admins</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="ml-2 text-sm text-gray-700">Send weekly sales reports</span>
              </label>
            </div>
          </div>

          {/* Test Email */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Test Email
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Type
                </label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="welcome">Welcome Email</option>
                  <option value="order_confirmation">Order Confirmation</option>
                  <option value="shipping">Shipping Notification</option>
                </select>
              </div>
              <button
                onClick={sendTestEmail}
                disabled={isSending}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}