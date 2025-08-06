import { Music } from 'lucide-react';
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
              <Music className="size-4" />
            </div>
            <span className="text-xl font-bold">Home Run Records</span>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}