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
    return userAgencies.some(ua => ua.agency_id === agencyId && ua.role === role);
  }, [userAgencies]);

  const canAccessAgency = useCallback((agencyId: string): boolean => {
    return user?.global_role === 'superadmin' || 
           userAgencies.some(ua => ua.agency_id === agencyId);
  }, [user, userAgencies]);

  // Derived permissions
  const canManageAgencies = user?.global_role === 'superadmin';
  const canManageCurrentAgency = user?.global_role === 'superadmin' || 
    (currentAgency && userAgencies.some(ua => 
      ua.agency_id === currentAgency.id && ua.role === 'artist_manager'
    ));
  const canSwitchAgencies = user?.global_role === 'superadmin' || userAgencies.length > 1;

  // EMERGENCY SIMPLIFIED LOADING
  const loadUser = async () => {
    try {
      setIsLoading(true);
      console.log('🚨 EMERGENCY AUTH: Starting simple auth check...');
      
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        console.log('🚨 No authenticated user found');
        setUser(null);
        setCurrentAgency(null);
        setUserAgencies([]);
        setAvailableArtists([]);
        return;
      }

      console.log('🚨 Found authenticated user:', currentUser.email);

      // Get or create user profile with minimal error handling
      let userProfile: UserProfile | null = null;
      
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();
        userProfile = data;
      } catch (error) {
        console.log('🚨 User profile not found, creating...');
        try {
          const { data } = await supabase
            .from('users')
            .insert([{
              id: currentUser.id,
              email: currentUser.email || '',
              global_role: 'artist' as UserRole,
              is_active: true,
            }])
            .select()
            .single();
          userProfile = data;
        } catch (createError) {
          console.error('🚨 Failed to create user profile:', createError);
        }
      }

      if (!userProfile) {
        throw new Error('Could not load or create user profile');
      }

      console.log('🚨 User profile loaded:', userProfile.email, userProfile.global_role);
      setUser(userProfile);

      // Load basic agency data with error handling
      try {
        const { data: agencies } = await supabase
          .from('agencies')
          .select('*')
          .limit(5);

        if (agencies && agencies.length > 0) {
          setCurrentAgency(agencies[0]);
          
          // Load artists from first agency
          const { data: artists } = await supabase
            .from('artists')
            .select('*')
            .eq('agency_id', agencies[0].id)
            .limit(10);
          
          setAvailableArtists(artists || []);
          
          console.log('🚨 Basic agency data loaded:', agencies[0].name);
        }
      } catch (agencyError) {
        console.log('🚨 Agency loading failed, continuing without agencies');
        setCurrentAgency(null);
        setAvailableArtists([]);
      }

    } catch (error) {
      console.error('🚨 EMERGENCY AUTH ERROR:', error);
      setUser(null);
      setCurrentAgency(null);
      setUserAgencies([]);
      setAvailableArtists([]);
    } finally {
      console.log('🚨 EMERGENCY AUTH: Loading completed');
      setIsLoading(false);
    }
  };

  // Auth state listener
  useEffect(() => {
    console.log('🚨 EMERGENCY AUTH: Setting up auth listener...');
    
    const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🚨 Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await loadUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentAgency(null);
        setUserAgencies([]);
        setAvailableArtists([]);
        setIsLoading(false);
      }
    });

    // Initial load
    loadUser();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Simplified action implementations
  const switchAgency = async (agencyId: string) => {
    console.log('🚨 Switch agency not fully implemented in emergency mode');
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const refreshAgencyData = async () => {
    console.log('🚨 Refresh agency data not fully implemented in emergency mode');
  };

  const logout = async () => {
    console.log('🚨 Logging out...');
    await supabase.auth.signOut();
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}