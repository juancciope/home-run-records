import { getUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { DashboardContent } from "@/components/dashboard-content"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const userWithProfile = await getUserWithProfile()
  
  if (!userWithProfile) {
    redirect('/login')
  }

  // Redirect superadmin users to their specific dashboard
  if (userWithProfile.profile?.global_role === 'superadmin') {
    redirect('/dashboard/superadmin')
  }

  return <DashboardContent />
}