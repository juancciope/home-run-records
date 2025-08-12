import { Music } from 'lucide-react';
import { LoginForm } from "@/components/login-form"

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10" style={{ backgroundColor: '#0a0e27' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 font-medium text-white">
            <div className="bg-violet-600 text-white flex size-8 items-center justify-center rounded-md">
              <Music className="size-4" />
            </div>
            <span className="text-xl font-bold">Artist OS</span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}