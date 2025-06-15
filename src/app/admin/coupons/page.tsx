// app/admin/coupons/page.tsx
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { prisma } from '@/lib/db'
import CouponsTable from '@/components/admin/CouponsTable'

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Coupon
        </Link>
      </div>
      
      <CouponsTable coupons={coupons} />
    </div>
  )
}
