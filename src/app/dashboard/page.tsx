import { requireAuth, getUserProfile } from '@/lib/auth/server-auth'
import { redirect } from 'next/navigation'
import { DashboardContentUnified } from "@/components/dashboard-content-unified"

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await requireAuth()
  const profile = await getUserProfile(user.id)

  // Redirect superadmin users to their specific dashboard
  if (profile?.global_role === 'superadmin') {
    redirect('/dashboard/superadmin')
  }

  return <DashboardContentUnified />
}