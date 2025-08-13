import { requireAuth } from '@/lib/auth/server-auth'

export const dynamic = 'force-dynamic'

export default async function CatalogPage() {
  await requireAuth()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-3xl font-bold">Catalog Tools</h1>
          <p className="text-muted-foreground">
            Manage your music catalog and distribution
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">
            Catalog tools coming soon
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Track metadata, manage releases, monitor distribution, and optimize catalog performance
          </p>
        </div>
      </div>
    </div>
  )
}