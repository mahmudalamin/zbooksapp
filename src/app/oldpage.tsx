// app/page.tsx
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
    redirect('/admin')
  }
  
  // Redirect to store front or login
  redirect('/auth/signin')
}