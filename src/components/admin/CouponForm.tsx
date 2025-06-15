
// components/admin/CouponForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const couponSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  value: z.number().min(0, 'Value must be positive'),
  minimumAmount: z.number().min(0).optional(),
  maximumDiscount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  validFrom: z.string().min(1, 'Valid from date is required'),
  validUntil: z.string().optional(),
  isActive: z.boolean().default(true),
})

type CouponFormData = z.infer<typeof couponSchema>

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
    setValue
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: coupon ? {
      ...coupon,
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      validUntil: coupon.validUntil ? new Date(coupon.validUntil).toISOString().split('T')[0] : '',
    } : {
      isActive: true,
      type: 'PERCENTAGE',
      validFrom: new Date().toISOString().split('T')[0],
    }
  })

  const couponType = watch('type')

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue('code', result)
  }

  const onSubmit = async (data: CouponFormData) => {
    setIsLoading(true)
    try {
      const url = coupon ? `/api/admin/coupons/${coupon.id}` : '/api/admin/coupons'
      const method = coupon ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          validFrom: new Date(data.validFrom),
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save coupon')
      }

      toast.success(coupon ? 'Coupon updated!' : 'Coupon created!')
      router.push('/admin/coupons')
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coupon Code *
          </label>
          <div className="flex space-x-2">
            <input
              {...register('code')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="SAVE20"
              style={{ textTransform: 'uppercase' }}
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
            {...register('type')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PERCENTAGE">Percentage Discount</option>
            <option value="FIXED_AMOUNT">Fixed Amount</option>
            <option value="FREE_SHIPPING">Free Shipping</option>
          </select>
          {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
        </div>

        {couponType !== 'FREE_SHIPPING' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {couponType === 'PERCENTAGE' ? 'Discount Percentage *' : 'Discount Amount *'}
            </label>
            <div className="relative">
              {couponType === 'PERCENTAGE' && (
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
              )}
              {couponType === 'FIXED_AMOUNT' && (
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              )}
              <input
                {...register('value', { valueAsNumber: true })}
                type="number"
                step={couponType === 'PERCENTAGE' ? '1' : '0.01'}
                min="0"
                max={couponType === 'PERCENTAGE' ? '100' : undefined}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  couponType === 'FIXED_AMOUNT' ? 'pl-8' : 'pr-8'
                }`}
                placeholder={couponType === 'PERCENTAGE' ? '20' : '10.00'}
              />
            </div>
            {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value.message}</p>}
          </div>
        )}

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
            {...register('validFrom')}
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
  )
}