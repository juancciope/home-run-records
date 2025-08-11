"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getCurrentUser, supabase } from '@/lib/supabaseClient';

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
    loadUser();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await loadUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentAgency(null);
        setUserAgencies([]);
        setAvailableArtists([]);
      }
    });

    return () => {
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
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      console.log('🔄 Loading user:', currentUser?.email);
      
      if (currentUser) {
        // Get user profile from our users table
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        console.log('📊 User profile query result:', { userProfile, error });

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          throw error;
        }

        if (userProfile) {
          console.log('✅ User profile found:', userProfile.email, userProfile.global_role);
          setUser(userProfile);
          
          // Load user's agencies
          await loadUserAgencies(userProfile.id, userProfile);
        } else {
          console.log('⚠️ No user profile found, creating new one...');
          // Create user profile if it doesn't exist
          const newUserProfile: Partial<UserProfile> = {
            id: currentUser.id,
            email: currentUser.email || '',
            global_role: 'artist', // Default role
            is_active: true,
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('users')
            .insert([newUserProfile])
            .select()
            .single();

          if (createError) throw createError;
          
          setUser(createdProfile);
        }
      } else {
        setUser(null);
        setCurrentAgency(null);
        setUserAgencies([]);
        setAvailableArtists([]);
      }
    } catch (error) {
      console.error('❌ Error loading user:', error);
      setUser(null);
    } finally {
      console.log('🏁 User loading completed');
      setIsLoading(false);
    }
  };

  const loadUserAgencies = async (userId: string, userProfile?: UserProfile) => {
    try {
      const { data: agencyUsers, error } = await supabase
        .from('agency_users')
        .select(`
          agency_id,
          role,
          is_primary,
          agency:agencies(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const agencies = agencyUsers?.map(au => ({
        agency_id: au.agency_id,
        role: au.role as UserRole,
        is_primary: au.is_primary,
        agency: Array.isArray(au.agency) ? au.agency[0] : au.agency
      })) || [];

      setUserAgencies(agencies);

      // Set current agency (primary first, or first available)
      const primaryAgency = agencies.find(ua => ua.is_primary);
      const firstAgency = agencies[0];
      
      if (primaryAgency) {
        setCurrentAgency(primaryAgency.agency);
      } else if (firstAgency) {
        setCurrentAgency(firstAgency.agency);
      } else {
        setCurrentAgency(null);
      }

      // For superadmin, if no agencies assigned, load all agencies
      const currentUserRole = userProfile?.global_role || user?.global_role;
      if (currentUserRole === 'superadmin' && agencies.length === 0) {
        await loadAllAgencies();
      }
    } catch (error) {
      console.error('Error loading user agencies:', error);
      setUserAgencies([]);
    }
  };

  const loadAllAgencies = async () => {
    try {
      const { data: allAgencies, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;

      if (allAgencies && allAgencies.length > 0) {
        // For superadmin, create virtual agency relationships
        const virtualAgencyUsers = allAgencies.map(agency => ({
          agency_id: agency.id,
          role: 'superadmin' as UserRole,
          is_primary: false,
          agency: agency as Agency
        }));

        setUserAgencies(virtualAgencyUsers);
        setCurrentAgency(allAgencies[0]);
      }
    } catch (error) {
      console.error('Error loading all agencies:', error);
    }
  };

  const loadAgencyData = async () => {
    if (!currentAgency) return;

    try {
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