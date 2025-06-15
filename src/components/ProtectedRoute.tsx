// components/ProtectedRoute.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingSpinner } from './LoadingSpinner' // Named import

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: string[]
  fallbackUrl?: string
}

export default function ProtectedRoute({
  children,
  requiredRole = [],
  fallbackUrl = '/auth/signin'
}: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push(fallbackUrl)
      return
    }

    if (requiredRole.length > 0 && !requiredRole.includes(session.user.role)) {
      router.push('/unauthorized')
      return
    }
  }, [session, status, router, requiredRole, fallbackUrl])

  if (status === 'loading') {
    return <LoadingSpinner />
  }

  if (!session) {
    return null
  }

  if (requiredRole.length > 0 && !requiredRole.includes(session.user.role)) {
    return null
  }

  return <>{children}</>
}