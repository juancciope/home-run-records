import { requireRole } from '@/lib/auth/server-auth'
import { SuperadminDashboard } from '@/components/superadmin-dashboard'

export default async function SuperadminPage() {
  // Server-side role validation - redirects automatically if not superadmin
  await requireRole('superadmin')

  return <SuperadminDashboard />
}