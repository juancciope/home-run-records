"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';

// Types for the multi-tenant architecture
export type UserRole = 'superadmin' | 'artist_manager' | 'artist';

export interface Agency {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  subscription_tier: string;
  max_artists: number;
}

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  global_role: UserRole;
  is_active: boolean;
  last_login?: string;
}

export interface AgencyUser {
  agency_id: string;
  role: UserRole;
  is_primary: boolean;
  agency: Agency;
}

export interface Artist {
  id: string;
  agency_id: string;
  user_id?: string;
  stage_name: string;
  real_name?: string;
  bio?: string;
  genres?: string[];
  avatar_url?: string;
  status: 'active' | 'inactive' | 'pending';
  total_followers: number;
  total_monthly_listeners: number;
  viberate_artist_id?: string;
}

export interface AuthContextType {
  // User state
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Agency context
  currentAgency: Agency | null;
  userAgencies: AgencyUser[];
  availableArtists: Artist[];

  // Role-based permissions
  canManageAgencies: boolean;
  canManageCurrentAgency: boolean;
  canSwitchAgencies: boolean;

  // Actions
  switchAgency: (agencyId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshAgencyData: () => Promise<void>;
  logout: () => Promise<void>;

  // Permission helpers
  hasRole: (role: UserRole) => boolean;
  hasAgencyRole: (agencyId: string, role: UserRole) => boolean;
  canAccessAgency: (agencyId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAgency, setCurrentAgency] = useState<Agency | null>(null);
  const [userAgencies, setUserAgencies] = useState<AgencyUser[]>([]);
  const [availableArtists, setAvailableArtists] = useState<Artist[]>([]);

  const isAuthenticated = !!user;

  // Permission helpers
  const hasRole = useCallback((role: UserRole): boolean => {
    return user?.global_role === role;
  }, [user]);

  const hasAgencyRole = useCallback((agencyId: string, role: UserRole): boolean => {
    if (user?.global_role === 'superadmin') return true;
    return userAgencies.some(ua => ua.agency_id === agencyId && ua.role === role);
  }, [user, userAgencies]);

  const canAccessAgency = useCallback((agencyId: string): boolean => {
    if (user?.global_role === 'superadmin') return true;
    return userAgencies.some(ua => ua.agency_id === agencyId);
  }, [user, userAgencies]);

  // Computed permissions
  const canManageAgencies = user?.global_role === 'superadmin';
  const canManageCurrentAgency = currentAgency ? 
    (user?.global_role === 'superadmin' || hasAgencyRole(currentAgency.id, 'artist_manager')) : false;
  const canSwitchAgencies = user?.global_role === 'superadmin' || userAgencies.length > 1;

  // Load user and initial agency context
  useEffect(() => {
    console.log('🎯 === STARTING useEffect for loadUser and auth listener ===');
    console.log('🎯 About to call initial loadUser');
    loadUser();

    // Subscribe to auth state changes
    console.log('🎯 Setting up auth state change listener');
    const supabase = createClient();
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', {
        event,
        hasSession: !!session,
        userEmail: session?.user?.email,
        timestamp: new Date().toISOString()
      });
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('🔄 Auth event requires user reload, calling loadUser');
        await loadUser();
        console.log('🔄 loadUser completed for auth event:', event);
      } else if (event === 'SIGNED_OUT') {
        console.log('🔄 User signed out, clearing all state');
        setUser(null);
        setCurrentAgency(null);
        setUserAgencies([]);
        setAvailableArtists([]);
      }
    });

    console.log('🎯 Auth listener setup completed');
    
    return () => {
      console.log('🎯 Cleaning up auth listener');
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Load agency data when user or currentAgency changes
  useEffect(() => {
    if (user && currentAgency) {
      loadAgencyData();
    }
  }, [user?.id, currentAgency?.id]);

  const loadUser = async () => {
    console.log('🚀 === STARTING loadUser function (new client) ===');
    try {
      console.log('🔄 Step 1: Setting isLoading to true');
      setIsLoading(true);
      
      const supabase = createClient();
      console.log('🔄 Step 2: Getting current user with new client');
      
      // Try to get session first, then user - this is more reliable after server login
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔄 Step 2a: Session check:', {
        hasSession: !!session,
        sessionError: sessionError
      });
      
      const currentUser = session?.user;
      const userError = sessionError;
      
      console.log('🔄 Step 3: getUser result:', {
        id: currentUser?.id,
        email: currentUser?.email,
        hasUser: !!currentUser,
        error: userError
      });
      
      if (currentUser) {
        console.log('🔄 Step 4: User exists, querying users table');
        console.log('🔄 Step 4a: About to query with ID:', currentUser.id);
        
        // Get user profile from our users table
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        console.log('📊 Step 5: User profile query completed:', { 
          userProfile: userProfile ? {
            id: userProfile.id,
            email: userProfile.email,
            global_role: userProfile.global_role,
            is_active: userProfile.is_active
          } : null, 
          error: error ? {
            code: error.code,
            message: error.message,
            details: error.details
          } : null 
        });

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error('💥 Step 5a: Query error that is NOT "not found":', error);
          throw error;
        }

        if (userProfile) {
          console.log('✅ Step 6: User profile found, setting user state');
          console.log('✅ Step 6a: Profile details:', {
            email: userProfile.email, 
            role: userProfile.global_role,
            active: userProfile.is_active
          });
          
          setUser(userProfile);
          
          console.log('🔄 Step 7: About to call loadUserAgencies');
          // Load user's agencies
          await loadUserAgencies(userProfile.id, userProfile);
          console.log('✅ Step 8: loadUserAgencies completed');
        } else {
          console.log('⚠️ Step 6b: No user profile found, creating new one...');
          // Create user profile if it doesn't exist
          const newUserProfile: Partial<UserProfile> = {
            id: currentUser.id,
            email: currentUser.email || '',
            global_role: 'artist', // Default role
            is_active: true,
          };

          console.log('🔄 Step 6c: About to insert new profile:', newUserProfile);
          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert([newUserProfile])
            .select()
            .single();

          console.log('📊 Step 6d: Profile creation result:', {
            createdProfile: createdProfile ? {
              id: createdProfile.id,
              email: createdProfile.email,
              global_role: createdProfile.global_role
            } : null,
            createError: createError ? {
              code: createError.code,
              message: createError.message
            } : null
          });

          if (createError) {
            console.error('💥 Step 6e: Profile creation failed:', createError);
            throw createError;
          }
          
          console.log('✅ Step 6f: Setting new user profile');
          setUser(createdProfile);
          console.log('🔄 Step 6g: About to call loadUserAgencies for new user');
          await loadUserAgencies(createdProfile.id, createdProfile);
          console.log('✅ Step 6h: loadUserAgencies completed for new user');
        }
      } else {
        console.log('❌ Step 4b: No current user, clearing all state');
        setUser(null);
        setCurrentAgency(null);
        setUserAgencies([]);
        setAvailableArtists([]);
      }
    } catch (error) {
      console.error('❌ FATAL ERROR in loadUser:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      setUser(null);
    } finally {
      console.log('🏁 Step FINAL: User loading completed, setting isLoading to false');
      setIsLoading(false);
      console.log('🚀 === COMPLETED loadUser function ===');
    }
  };

  const loadUserAgencies = async (userId: string, userProfile?: UserProfile) => {
    console.log('🏢 === STARTING loadUserAgencies function ===');
    console.log('🏢 Input params:', {
      userId,
      userProfile: userProfile ? {
        id: userProfile.id,
        email: userProfile.email,
        global_role: userProfile.global_role
      } : null
    });
    
    try {
      const supabase = createClient();
      console.log('🏢 Step 1: Querying agency_users table');
      const { data: agencyUsers, error } = await supabase
        .from('agency_users')
        .select(`
          agency_id,
          role,
          is_primary,
          agency:agencies(*)
        `)
        .eq('user_id', userId);

      console.log('🏢 Step 2: agency_users query result:', {
        agencyUsers: agencyUsers ? agencyUsers.map(au => ({
          agency_id: au.agency_id,
          role: au.role,
          is_primary: au.is_primary,
          agency_name: Array.isArray(au.agency) ? (au.agency[0] as any)?.name : (au.agency as any)?.name
        })) : null,
        error: error ? {
          code: error.code,
          message: error.message,
          details: error.details
        } : null
      });

      if (error) {
        console.error('💥 Step 2a: agency_users query failed:', error);
        throw error;
      }

      console.log('🏢 Step 3: Processing agency data');
      const agencies = agencyUsers?.map(au => ({
        agency_id: au.agency_id,
        role: au.role as UserRole,
        is_primary: au.is_primary,
        agency: Array.isArray(au.agency) ? au.agency[0] : au.agency
      })) || [];

      console.log('🏢 Step 4: Processed agencies:', agencies.length, 'agencies found');
      console.log('🏢 Step 4a: Agency details:', agencies.map(a => ({
        name: a.agency?.name,
        role: a.role,
        is_primary: a.is_primary
      })));

      setUserAgencies(agencies);

      console.log('🏢 Step 5: Setting current agency');
      // Set current agency (primary first, or first available)
      const primaryAgency = agencies.find(ua => ua.is_primary);
      const firstAgency = agencies[0];
      
      console.log('🏢 Step 5a: Primary agency found:', !!primaryAgency, primaryAgency?.agency?.name);
      console.log('🏢 Step 5b: First agency found:', !!firstAgency, firstAgency?.agency?.name);
      
      if (primaryAgency) {
        console.log('🏢 Step 5c: Setting primary agency as current:', primaryAgency.agency?.name);
        setCurrentAgency(primaryAgency.agency);
      } else if (firstAgency) {
        console.log('🏢 Step 5d: Setting first agency as current:', firstAgency.agency?.name);
        setCurrentAgency(firstAgency.agency);
      } else {
        console.log('🏢 Step 5e: No agencies found, setting currentAgency to null');
        setCurrentAgency(null);
      }

      // For superadmin, if no agencies assigned, load all agencies
      const currentUserRole = userProfile?.global_role || user?.global_role;
      console.log('🏢 Step 6: Checking if superadmin needs all agencies');
      console.log('🏢 Step 6a: Current user role:', currentUserRole);
      console.log('🏢 Step 6b: Agencies length:', agencies.length);
      
      if (currentUserRole === 'superadmin' && agencies.length === 0) {
        console.log('🏢 Step 6c: Loading all agencies for superadmin');
        await loadAllAgencies();
        console.log('🏢 Step 6d: loadAllAgencies completed');
      }
      
      console.log('🏢 === COMPLETED loadUserAgencies function ===');
    } catch (error) {
      console.error('💥 FATAL ERROR in loadUserAgencies:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
      setUserAgencies([]);
    }
  };

  const loadAllAgencies = async () => {
    console.log('🌐 === STARTING loadAllAgencies function ===');
    try {
      const supabase = createClient();
      console.log('🌐 Step 1: Querying all agencies');
      const { data: allAgencies, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('status', 'active')
        .order('name');

      console.log('🌐 Step 2: All agencies query result:', {
        allAgencies: allAgencies ? allAgencies.map(a => ({
          id: a.id,
          name: a.name,
          slug: a.slug,
          status: a.status
        })) : null,
        error: error ? {
          code: error.code,
          message: error.message
        } : null
      });

      if (error) {
        console.error('💥 Step 2a: All agencies query failed:', error);
        throw error;
      }

      if (allAgencies && allAgencies.length > 0) {
        console.log('🌐 Step 3: Creating virtual agency relationships for superadmin');
        // For superadmin, create virtual agency relationships
        const virtualAgencyUsers = allAgencies.map(agency => ({
          agency_id: agency.id,
          role: 'superadmin' as UserRole,
          is_primary: false,
          agency: agency as Agency
        }));

        console.log('🌐 Step 4: Setting virtual agencies:', virtualAgencyUsers.length, 'agencies');
        setUserAgencies(virtualAgencyUsers);
        console.log('🌐 Step 5: Setting first agency as current:', allAgencies[0].name);
        setCurrentAgency(allAgencies[0]);
      } else {
        console.log('🌐 Step 3b: No active agencies found');
      }
      
      console.log('🌐 === COMPLETED loadAllAgencies function ===');
    } catch (error) {
      console.error('💥 FATAL ERROR in loadAllAgencies:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      });
    }
  };

  const loadAgencyData = async () => {
    if (!currentAgency) return;

    try {
      const supabase = createClient();
      // Load artists for current agency
      const { data: artists, error } = await supabase
        .from('artists')
        .select('*')
        .eq('agency_id', currentAgency.id)
        .eq('status', 'active')
        .order('stage_name');

      if (error) throw error;
      setAvailableArtists(artists || []);
    } catch (error) {
      console.error('Error loading agency data:', error);
      setAvailableArtists([]);
    }
  };

  const switchAgency = async (agencyId: string) => {
    const targetAgencyUser = userAgencies.find(ua => ua.agency_id === agencyId);
    if (!targetAgencyUser) {
      console.error('User does not have access to agency:', agencyId);
      return;
    }

    setCurrentAgency(targetAgencyUser.agency);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const refreshAgencyData = async () => {
    if (user) {
      await loadUserAgencies(user.id);
    }
  };

  const logout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setCurrentAgency(null);
      setUserAgencies([]);
      setAvailableArtists([]);
      
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    currentAgency,
    userAgencies,
    availableArtists,
    canManageAgencies,
    canManageCurrentAgency,
    canSwitchAgencies,
    switchAgency,
    refreshUser,
    refreshAgencyData,
    logout,
    hasRole,
    hasAgencyRole,
    canAccessAgency,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protecting routes with role-based access
export function withAuth<T extends object>(
  Component: React.ComponentType<T>,
  requiredRole?: UserRole,
  requiredAgencyRole?: UserRole
) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, isLoading, user, currentAgency, hasRole, hasAgencyRole } = useAuth();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground">Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    // Check global role if required
    if (requiredRole && !hasRole(requiredRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have the required permissions to access this page.</p>
          </div>
        </div>
      );
    }

    // Check agency role if required
    if (requiredAgencyRole && currentAgency && !hasAgencyRole(currentAgency.id, requiredAgencyRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You don't have the required agency permissions to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Role-based route guards
export const withSuperadmin = <T extends object>(Component: React.ComponentType<T>) => 
  withAuth(Component, 'superadmin');

export const withArtistManager = <T extends object>(Component: React.ComponentType<T>) => 
  withAuth(Component, undefined, 'artist_manager');

export const withAnyRole = <T extends object>(Component: React.ComponentType<T>) => 
  withAuth(Component);