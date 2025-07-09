// components/profile/AccountSettings.tsx
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Trash2, Shield, Eye, EyeOff, User, Mail, Calendar, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type PasswordFormData = z.infer<typeof passwordSchema>

interface AccountSettingsProps {
  user: {
    id: string
    name: string | null
    email: string
    createdAt: Date
  }
}

export default function AccountSettings({ user }: AccountSettingsProps) {
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Fix hydration issue by only rendering dates on client side
  useEffect(() => {
    setMounted(true)
  }, [])

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  const changePassword = async (data: PasswordFormData) => {
    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to change password')
      }

      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const deleteAccount = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete account')

      toast.success('Account deleted successfully')
      window.location.href = '/'
    } catch (error) {
      toast.error('Failed to delete account')
    }
  }

  // Format date consistently to avoid hydration issues
  const formatDate = (date: Date) => {
    if (!mounted) return '' // Return empty during SSR
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long', 
      year: 'numeric'
    }).format(new Date(date))
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="space-y-8">
      {/* Change Password */}
      <div className="bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
            <p className="text-gray-600 text-sm">Keep your account secure with a strong password</p>
          </div>
        </div>
        
        <form onSubmit={passwordForm.handleSubmit(changePassword)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                {...passwordForm.register('currentPassword')}
                type={showPasswords.current ? 'text' : 'password'}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility('current')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2">!</span>
                {passwordForm.formState.errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  {...passwordForm.register('newPassword')}
                  type={showPasswords.new ? 'text' : 'password'}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2">!</span>
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  {...passwordForm.register('confirmPassword')}
                  type={showPasswords.confirm ? 'text' : 'password'}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <span className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center mr-2">!</span>
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isChangingPassword ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Changing...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Change Password
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account Information */}
      <div className="bg-gradient-to-br from-white to-green-50/30 border-2 border-green-100 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Account Information</h3>
            <p className="text-gray-600 text-sm">Your account details and member status</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-3">
              <User className="w-5 h-5 text-blue-600 mr-2" />
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">USER ID</dt>
            </div>
            <dd className="text-lg font-mono text-gray-900 bg-gray-100 px-3 py-2 rounded-lg break-all">
              {user.id}
            </dd>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-3">
              <Mail className="w-5 h-5 text-blue-600 mr-2" />
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">EMAIL</dt>
            </div>
            <dd className="text-lg text-gray-900 font-medium">{user.email}</dd>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center mb-3">
              <Calendar className="w-5 h-5 text-blue-600 mr-2" />
              <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wide">MEMBER SINCE</dt>
            </div>
            <dd className="text-lg text-gray-900 font-medium">
              {formatDate(user.createdAt)}
            </dd>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gradient-to-br from-red-50 to-rose-100/50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center mr-4">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-red-900">Danger Zone</h3>
            <p className="text-red-700 text-sm">Irreversible and destructive actions</p>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-red-200">
          <div className="mb-6">
            <h4 className="font-bold text-red-900 text-lg mb-2">Delete Account</h4>
            <p className="text-red-700">
              Once you delete your account, there is no going back. Please be certain. All your data, orders, and personal information will be permanently removed.
            </p>
          </div>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-rose-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-red-900 font-semibold mb-2">
                  ⚠️ Are you absolutely sure?
                </p>
                <p className="text-red-800 text-sm">
                  This action cannot be undone. This will permanently delete your account and remove all associated data from our servers.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={deleteAccount}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-semibold rounded-xl hover:from-red-700 hover:to-rose-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Yes, Delete My Account Forever
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold rounded-xl hover:from-gray-500 hover:to-gray-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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