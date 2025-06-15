// app/profile/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import ProfileTabs from '@/components/profile/ProfileTabs'


export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  
  if (!session) {
    redirect('/')
  }

  const [user, addresses, orders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true
      }
    }),
    prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: 'desc' }
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        orderItems: {
          include: {
            product: {
              select: { name: true, images: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
  ])

  if (!user) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
                  </div>
        
        <ProfileTabs user={user} addresses={addresses} orders={orders} />
      </div>
    </div>
  )
}

