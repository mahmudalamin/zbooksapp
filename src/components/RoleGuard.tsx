
// components/RoleGuard.tsx
'use client'

import { useSession } from 'next-auth/react'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
}

export default function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { data: session } = useSession()

  if (!session || !allowedRoles.includes(session.user.role)) {
    return fallback || (
      <div className="text-center py-8">
        <p className="text-red-600">You dont have permission to view this content.</p>
      </div>
    )
  }

  return <>{children}</>
}