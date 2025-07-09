// components/admin/CouponForm.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

// Define the form data type to match your database schema
interface CouponFormData {
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  value: number
  minimumAmount?: number
  maximumDiscount?: number
  usageLimit?: number
  isActive: boolean
  validFrom: string
  validUntil?: string
}

interface CouponFormProps {
  coupon?: any
}

export default function CouponForm({ coupon }: CouponFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    setError,
    clearErrors
  } = useForm<CouponFormData>({
    defaultValues: coupon ? {
      code: coupon.code || '',
      type: coupon.type || 'PERCENTAGE',
      value: coupon.value || 0,
      minimumAmount: coupon.minimumAmount || undefined,
      maximumDiscount: coupon.maximumDiscount || undefined,
      usageLimit: coupon.usageLimit || undefined,
      isActive: coupon.isActive !== false,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
    } : {
      code: '',
      type: 'PERCENTAGE',
      value: 10,
      isActive: true,
      validFrom: new Date().toISOString().split('T')[0],
    }
  })

  const couponType = watch('type')
  const currentValue = watch('value')

  // Handle value changes when type changes
  useEffect(() => {
    if (couponType === 'FREE_SHIPPING') {
      setValue('value', 0)
      clearErrors('value')
    } else if (couponType === 'PERCENTAGE' && (currentValue === 0 || currentValue > 100)) {
      setValue('value', 10) // Default 10%
    } else if (couponType === 'FIXED_AMOUNT' && currentValue === 0) {
      setValue('value', 5) // Default $5
    }
  }, [couponType, setValue, clearErrors, currentValue])

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue('code', result)
  }

  const validateForm = (data: CouponFormData): boolean => {
    let isValid = true

    // Clear all errors first
    clearErrors()

    // Code validation
    if (!data.code || data.code.trim() === '') {
      setError('code', { message: 'Code is required' })
      isValid = false
    }

    // Value validation
    if (data.type !== 'FREE_SHIPPING') {
      if (!data.value || data.value <= 0) {
        setError('value', { message: 'Value must be greater than 0' })
        isValid = false
      }
      
      if (data.type === 'PERCENTAGE' && data.value > 100) {
        setError('value', { message: 'Percentage cannot exceed 100' })
        isValid = false
      }
    }

    // Date validation
    if (!data.validFrom) {
      setError('validFrom', { message: 'Valid from date is required' })
      isValid = false
    }

    if (data.validFrom && data.validUntil) {
      const fromDate = new Date(data.validFrom)
      const untilDate = new Date(data.validUntil)
      if (fromDate >= untilDate) {
        setError('validUntil', { message: 'Valid until date must be after valid from date' })
        isValid = false
      }
    }

    return isValid
  }

  const onSubmit = async (data: CouponFormData) => {
    console.log('Form submitted with data:', data)

    if (!validateForm(data)) {
      console.log('Form validation failed')
      return
    }

    setIsLoading(true)
    try {
      // Prepare data for API
      const apiData = {
        ...data,
        code: data.code.toUpperCase(),
        value: data.type === 'FREE_SHIPPING' ? 0 : Number(data.value),
        minimumAmount: data.minimumAmount ? Number(data.minimumAmount) : undefined,
        maximumDiscount: (data.type === 'PERCENTAGE' && data.maximumDiscount) ? Number(data.maximumDiscount) : undefined,
        usageLimit: data.usageLimit ? Number(data.usageLimit) : undefined,
      }

      console.log('Sending API data:', apiData)

      const url = coupon ? `/api/admin/coupons/${coupon.id}` : '/api/admin/coupons'
      const method = coupon ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      })

      console.log('Response status:', response.status)
      
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Failed to save coupon')
      }

      toast.success(coupon ? 'Coupon updated successfully!' : 'Coupon created successfully!')
      router.push('/admin/coupons')
    } catch (error: any) {
      console.error('Coupon save error:', error)
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coupon Code *
            </label>
            <div className="flex space-x-2">
              <input
                {...register('code', { required: 'Code is required' })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase"
                placeholder="SAVE20"
              />
              <button
                type="button"
                onClick={generateRandomCode}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Generate
              </button>
            </div>
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Coupon Type *
            </label>
            <select
              {...register('type', { required: 'Type is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PERCENTAGE">Percentage Discount</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
              <option value="FREE_SHIPPING">Free Shipping</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {couponType === 'PERCENTAGE' && 'Discount Percentage *'}
              {couponType === 'FIXED_AMOUNT' && 'Discount Amount *'}
              {couponType === 'FREE_SHIPPING' && 'Value (Auto-set to 0)'}
            </label>
            <div className="relative">
              {couponType === 'PERCENTAGE' && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              )}
              {couponType === 'FIXED_AMOUNT' && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              )}
              <input
                {...register('value', { 
                  valueAsNumber: true,
                  required: couponType !== 'FREE_SHIPPING' ? 'Value is required' : false
                })}
                type="number"
                step={couponType === 'PERCENTAGE' ? '1' : '0.01'}
                min="0"
                max={couponType === 'PERCENTAGE' ? '100' : undefined}
                disabled={couponType === 'FREE_SHIPPING'}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  couponType === 'FIXED_AMOUNT' ? 'pl-8' : 'pr-8'
                } ${couponType === 'FREE_SHIPPING' ? 'bg-gray-100' : ''}`}
                placeholder={
                  couponType === 'PERCENTAGE' ? '20' : 
                  couponType === 'FIXED_AMOUNT' ? '10.00' : '0'
                }
              />
            </div>
            {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Order Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                {...register('minimumAmount', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="50.00"
              />
            </div>
            {errors.minimumAmount && <p className="text-red-500 text-sm mt-1">{errors.minimumAmount.message}</p>}
          </div>

          {couponType === 'PERCENTAGE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Discount Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  {...register('maximumDiscount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="100.00"
                />
              </div>
              {errors.maximumDiscount && <p className="text-red-500 text-sm mt-1">{errors.maximumDiscount.message}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usage Limit
            </label>
            <input
              {...register('usageLimit', { valueAsNumber: true })}
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="100"
            />
            <p className="text-sm text-gray-500 mt-1">Leave empty for unlimited usage</p>
            {errors.usageLimit && <p className="text-red-500 text-sm mt-1">{errors.usageLimit.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid From *
            </label>
            <input
              {...register('validFrom', { required: 'Valid from date is required' })}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.validFrom && <p className="text-red-500 text-sm mt-1">{errors.validFrom.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valid Until
            </label>
            <input
              {...register('validUntil')}
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-500 mt-1">Leave empty for no expiration</p>
            {errors.validUntil && <p className="text-red-500 text-sm mt-1">{errors.validUntil.message}</p>}
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              {...register('isActive')}
              type="checkbox"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Active</span>
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </div>
      </form>
    </div>
  )
}