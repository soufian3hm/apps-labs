import { useAuth } from '../contexts/AuthContext'

export function useUserRole() {
  const { user, profile } = useAuth()
  
  // For early access: All authenticated users with profiles are admins
  const isAdmin = !!(user && profile)
  const loading = false

  return { isAdmin, loading }
}
