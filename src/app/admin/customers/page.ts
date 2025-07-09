import { prisma } from '@/lib/db'
import CustomersTable from '@/components/admin/CustomersTable'

export default async function CustomersPage() {
  const customers = await prisma.user.findMany({
    where: { role: 'USER' },
    include: {
      orders: {
        select: {
          id: true,
          total: true,
          status: true,
          createdAt: true,
        }
      },
      _count: {
        select: { orders: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
      <CustomersTable customers={customers} />
    </div>
  )
}
