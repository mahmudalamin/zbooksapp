// app/admin/coupons/[id]/edit/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import CouponForm from '@/components/admin/CouponForm'

export default async function EditCouponPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const coupon = await prisma.coupon.findUnique({
    where: { id }
  })

  if (!coupon) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Edit Coupon</h1>
      <CouponForm coupon={coupon} />
    </div>
  )
}