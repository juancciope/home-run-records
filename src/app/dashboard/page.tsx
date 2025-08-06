"use client"

import { SimpleDashboardLayout } from "@/components/simple-dashboard-layout"
import { DashboardContent } from "@/components/dashboard-content"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  return (
    <SimpleDashboardLayout>
      <DashboardContent />
    </SimpleDashboardLayout>
  )
}