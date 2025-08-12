import Link from 'next/link';
import { Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic'

export default function ErrorPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-slate-950">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 font-medium text-white">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <Music className="size-4" />
            </div>
            <span className="text-xl font-bold">Artist OS</span>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">Authentication Error</h1>
            <p className="text-gray-400 mb-6">
              There was an error with your login. Please try again.
            </p>
            
            <Button asChild className="w-full">
              <Link href="/login">
                Back to Login
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}