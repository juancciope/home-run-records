import { getUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { SuperadminDashboard } from '@/components/superadmin-dashboard'

export default async function SuperadminPage() {
  const userWithProfile = await getUserWithProfile()
  
  if (!userWithProfile || !userWithProfile.profile) {
    redirect('/login')
  }

  // Only allow superadmin users
  if (userWithProfile.profile.global_role !== 'superadmin') {
    redirect('/dashboard')
  }

  return <SuperadminDashboard />
}