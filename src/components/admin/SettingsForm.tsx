// components/admin/SettingsForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  taxRate: z.number().min(0).max(1),
  shippingRate: z.number().min(0),
  freeShippingThreshold: z.number().min(0),
  emailNotifications: z.boolean().default(true),
  lowStockThreshold: z.number().min(0).default(5),
  allowGuestCheckout: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
})

type SettingsFormData = z.infer<typeof settingsSchema>

interface SettingsFormProps {
  settings: Partial<SettingsFormData>
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      emailNotifications: true,
      lowStockThreshold: 5,
      allowGuestCheckout: true,
      maintenanceMode: false,
      ...settings,
    }
  })

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save settings')

      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* General Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">General Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Name *
            </label>
            <input
              {...register('siteName')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Ecommerce Store"
            />
            {errors.siteName && (
              <p className="text-red-500 text-sm mt-1">{errors.siteName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
            </label>
            <select
              {...register('currency')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
            {errors.currency && (
              <p className="text-red-500 text-sm mt-1">{errors.currency.message}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site Description
            </label>
            <textarea
              {...register('siteDescription')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of your store"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Shipping */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Pricing & Shipping</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tax Rate (%)
            </label>
            <input
              {...register('taxRate', { 
                valueAsNumber: true,
                setValueAs: (value) => parseFloat(value) / 100 
              })}
              type="number"
              step="0.01"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="8.25"
            />
            {errors.taxRate && (
              <p className="text-red-500 text-sm mt-1">{errors.taxRate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shipping Rate
            </label>
            <input
              {...register('shippingRate', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="9.99"
            />
            {errors.shippingRate && (
              <p className="text-red-500 text-sm mt-1">{errors.shippingRate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Free Shipping Threshold
            </label>
            <input
              {...register('freeShippingThreshold', { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50.00"
            />
            {errors.freeShippingThreshold && (
              <p className="text-red-500 text-sm mt-1">{errors.freeShippingThreshold.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Inventory */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Inventory Settings</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Low Stock Threshold
          </label>
          <input
            {...register('lowStockThreshold', { valueAsNumber: true })}
            type="number"
            min="0"
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="5"
          />
          <p className="text-sm text-gray-500 mt-1">
            Products with stock at or below this number will trigger low stock alerts
          </p>
          {errors.lowStockThreshold && (
            <p className="text-red-500 text-sm mt-1">{errors.lowStockThreshold.message}</p>
          )}
        </div>
      </div>

      {/* Store Preferences */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">Store Preferences</h3>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              {...register('emailNotifications')}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Send email notifications for new orders
            </span>
          </label>

          <label className="flex items-center">
            <input
              {...register('allowGuestCheckout')}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Allow guest checkout (customers can order without creating an account)
            </span>
          </label>

          <label className="flex items-center">
            <input
              {...register('maintenanceMode')}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Maintenance mode (temporarily disable the store for customers)
            </span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}