
// app/admin/coupons/new/page.tsx
import CouponForm from '@/components/admin/CouponForm'

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Create New Coupon</h1>
      <CouponForm />
    </div>
  )
}

