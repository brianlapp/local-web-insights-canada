import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '@/providers/AdminAuthProvider'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!session) {
    // Save the attempted url to redirect back after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <>{children}</>
} 