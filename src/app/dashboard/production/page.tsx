import { requireAuth } from '@/lib/auth/server-auth'

export const dynamic = 'force-dynamic'

export default async function ProductionPage() {
  await requireAuth()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-3xl font-bold">Production Dashboard</h1>
          <p className="text-muted-foreground">
            Track your music production workflow and releases
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">
            Production tools coming soon
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Track your releases, manage your catalog, and monitor production metrics
          </p>
        </div>
      </div>
    </div>
  )
}