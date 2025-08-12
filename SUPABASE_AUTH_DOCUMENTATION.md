# Supabase Authentication Documentation for Multi-Tenant Applications

## Table of Contents
1. [Official Supabase SSR Patterns](#official-supabase-ssr-patterns)
2. [Multi-Tenant Architecture with RLS](#multi-tenant-architecture-with-rls)
3. [Common Anti-Patterns and Issues](#common-anti-patterns-and-issues)
4. [Best Practices for Next.js + Supabase](#best-practices)
5. [Production-Ready Implementation Guide](#implementation-guide)

---

## Official Supabase SSR Patterns

### Core Requirements
1. **Two Types of Clients Required:**
   - Client Component client (browser)
   - Server Component client (server-side)

2. **Essential Files Structure:**
   ```
   utils/supabase/
   ├── client.ts      # Browser client
   ├── server.ts      # Server client  
   ├── middleware.ts  # Session refresh
   middleware.ts      # App middleware
   ```

3. **Middleware is Mandatory:**
   - Must refresh auth tokens
   - Pass tokens to Server Components
   - Handle cookie management properly

### Client Implementation (utils/supabase/client.ts)
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Server Implementation (utils/supabase/server.ts)
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component can't set cookies
          }
        },
      },
    }
  )
}
```

### Middleware Implementation (utils/supabase/middleware.ts)
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Refresh token by calling getUser
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect routes if needed
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

### App Middleware (middleware.ts)
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Multi-Tenant Architecture with RLS

### Database Schema Pattern
```sql
-- User roles enum
CREATE TYPE user_role AS ENUM ('superadmin', 'artist_manager', 'artist');

-- Agencies table (tenants)
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    status TEXT DEFAULT 'active',
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    max_artists INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table with global roles
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    global_role user_role DEFAULT 'artist',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Agency-User relationships (multi-tenant access)
CREATE TABLE agency_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    UNIQUE(agency_id, user_id)
);
```

### RLS Policies Best Practices

#### 1. Enable RLS on all tables
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_users ENABLE ROW LEVEL SECURITY;
```

#### 2. Performance-Optimized Policies
```sql
-- Good: Uses subquery with select for better performance
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
TO authenticated
USING (
  id = (SELECT auth.uid())
);

-- Good: Tenant isolation with indexed tenant_id
CREATE POLICY "Agency users can access agency data"
ON agencies FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT agency_id 
    FROM agency_users 
    WHERE user_id = (SELECT auth.uid())
  )
);

-- Bad: Direct function call in policy (slower)
CREATE POLICY "Bad policy example"
ON users FOR SELECT
USING (id = auth.uid()); -- Don't do this
```

#### 3. Superadmin Access
```sql
-- Superadmin bypass for system management
CREATE POLICY "Superadmin full access"
ON agencies FOR ALL
TO authenticated
USING (
  (SELECT global_role FROM users WHERE id = auth.uid()) = 'superadmin'
);
```

---

## Common Anti-Patterns and Issues

### 1. Multiple GoTrueClient Instances
❌ **Problem:**
- Creating new Supabase client on every function call
- Mixing old `@supabase/auth-helpers` with new `@supabase/ssr`
- React StrictMode causing double initialization

✅ **Solution:**
- Use singleton pattern for browser clients
- Only use `@supabase/ssr` package
- Proper client caching

### 2. Session Synchronization Issues
❌ **Problem:**
- Server actions create session but client can't detect it
- Using `getUser()` instead of `getSession()` in client
- Middleware not running properly

✅ **Solution:**
- Use `getSession()` for client-side session detection
- Ensure middleware runs on all routes
- Proper cookie management

### 3. Auth Context Deadlocks
❌ **Problem:**
- Making async Supabase calls in `onAuthStateChange` callback
- Complex state management in auth context
- Race conditions in user loading

✅ **Solution:**
- Minimal auth context with server-side initial state
- No async calls in auth state change callbacks
- Use Server Components for auth-dependent data

---

## Best Practices for Next.js + Supabase

### 1. Authentication Flow
1. **Login:** Use Server Actions
2. **Session Management:** Use middleware
3. **Auth State:** Minimal client context + server-side data
4. **Protected Routes:** Server-side validation

### 2. Client Usage Pattern
```typescript
// Browser client - singleton pattern
let clientInstance: SupabaseClient | null = null

export function createClient() {
  if (clientInstance) return clientInstance
  
  clientInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  return clientInstance
}
```

### 3. Auth Context Pattern
```typescript
// Minimal auth context
interface AuthContextType {
  user: User | null
  isLoading: boolean
}

export function AuthProvider({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode
  initialUser: User | null 
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Only listen for auth changes, no async calls
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 4. Server Actions Pattern
```typescript
// login action
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
```

---

## Production-Ready Implementation Guide

### 1. Authentication Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Login Form    │───▶│  Server Action   │───▶│   Middleware    │
│ (Client Comp)   │    │ (Server-side)    │    │ (Session Mgmt)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐             ▼
│  Auth Context   │◄───│ Server Component │    ┌─────────────────┐
│ (Minimal State) │    │ (Initial Data)   │    │   Supabase      │
└─────────────────┘    └──────────────────┘    │   Database      │
                                               └─────────────────┘
```

### 2. File Structure
```
src/
├── utils/supabase/
│   ├── client.ts          # Browser client (singleton)
│   ├── server.ts          # Server client  
│   └── middleware.ts      # Session refresh
├── lib/auth/
│   ├── server-auth.ts     # Server-side auth utilities
│   └── validation.ts      # Auth validation helpers
├── contexts/
│   └── auth-provider.tsx  # Minimal auth context
├── app/
│   ├── login/
│   │   ├── page.tsx       # Login form
│   │   └── actions.ts     # Login server actions
│   └── dashboard/
│       ├── page.tsx       # Protected route
│       └── superadmin/
│           └── page.tsx   # Role-based route
└── middleware.ts          # App middleware
```

### 3. Critical Rules
1. **Never trust `getSession()` on server-side** - Always use `getUser()`
2. **Always use middleware** - Token refresh is mandatory
3. **Minimize client auth context** - Use Server Components for auth state
4. **Use singleton pattern** - Prevent multiple client instances
5. **Follow RLS performance patterns** - Index policies, use subqueries
6. **Separate client/server utilities** - Different patterns for each environment

### 4. Testing Checklist
- [ ] No "Multiple GoTrueClient instances" warnings
- [ ] Login works without hanging
- [ ] Session persists across refreshes
- [ ] Protected routes work properly  
- [ ] Role-based access functions
- [ ] RLS policies enforced correctly
- [ ] Multi-tenant isolation working
- [ ] Performance acceptable with large datasets

---

This documentation serves as the authoritative reference for implementing Supabase authentication in our multi-tenant application following official best practices.