import { requireAuth } from '@/lib/auth/server-auth'

export const dynamic = 'force-dynamic'

export default async function ContentPage() {
  await requireAuth()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-3xl font-bold">Content Tools</h1>
          <p className="text-muted-foreground">
            Create, manage, and optimize your music content
          </p>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">
            Content tools coming soon
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            AI-powered content creation, social media management, and creative assets
          </p>
        </div>
      </div>
    </div>
  )
}