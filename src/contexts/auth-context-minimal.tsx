"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCurrentUser, supabase } from '@/lib/supabaseClient';

// Minimal types
export type UserRole = 'superadmin' | 'artist_manager' | 'artist';

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  global_role: UserRole;
  is_active: boolean;
}

export interface Agency {
  id: string;
  name: string;
  slug: string;
  status: string;
  subscription_tier: string;
  max_artists: number;
}

export interface Artist {
  id: string;
  agency_id: string;
  stage_name: string;
  real_name?: string;
  status: string;
  total_followers: number;
  total_monthly_listeners: number;
}

export interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  currentAgency: Agency | null;
  userAgencies: any[];
  availableArtists: Artist[];
  canManageAgencies: boolean;
  canManageCurrentAgency: boolean;
  canSwitchAgencies: boolean;
  switchAgency: (agencyId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshAgencyData: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAgencyRole: (agencyId: string, role: UserRole) => boolean;
  canAccessAgency: (agencyId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAgency, setCurrentAgency] = useState<Agency | null>(null);
  const [availableArtists, setAvailableArtists] = useState<Artist[]>([]);

  // ULTRA-MINIMAL AUTH - Just get user logged in
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔥 ULTRA-MINIMAL: Checking auth...');
      
      try {
        const authUser = await getCurrentUser();
        console.log('🔥 Auth user:', authUser?.email);
        
        if (authUser) {
          // Create minimal user profile without database queries
          const minimalUser: UserProfile = {
            id: authUser.id,
            email: authUser.email || '',
            global_role: 'superadmin', // Force superadmin for emergency
            is_active: true,
          };
          
          console.log('🔥 Setting minimal user:', minimalUser.email);
          setUser(minimalUser);
          
          // Set minimal agency data
          const minimalAgency: Agency = {
            id: 'emergency-agency',
            name: 'Home Run Records',
            slug: 'home-run-records',
            status: 'active',
            subscription_tier: 'premium',
            max_artists: 100,
          };
          
          setCurrentAgency(minimalAgency);
          
          // Set minimal artist data
          const minimalArtists: Artist[] = [
            {
              id: 'emergency-artist-1',
              agency_id: 'emergency-agency',
              stage_name: 'Alex Rivera',
              real_name: 'Alexander Rivera',
              status: 'active',
              total_followers: 45000,
              total_monthly_listeners: 25000,
            }
          ];
          
          setAvailableArtists(minimalArtists);
          
          console.log('🔥 ULTRA-MINIMAL: User setup complete');
        } else {
          console.log('🔥 No auth user found');
          setUser(null);
        }
      } catch (error) {
        console.error('🔥 ULTRA-MINIMAL ERROR:', error);
        setUser(null);
      } finally {
        console.log('🔥 ULTRA-MINIMAL: Loading complete');
        setIsLoading(false);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔥 Auth state change:', event);
      
      if (event === 'SIGNED_IN' && session) {
        await checkAuth();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setCurrentAgency(null);
        setAvailableArtists([]);
        setIsLoading(false);
      }
    });

    // Initial check
    checkAuth();

    return () => subscription.unsubscribe();
  }, []);

  // Minimal implementations
  const hasRole = (role: UserRole) => user?.global_role === role;
  const hasAgencyRole = () => false;
  const canAccessAgency = () => true;
  const switchAgency = async () => console.log('Switch agency not implemented');
  const refreshUser = async () => console.log('Refresh user not implemented');
  const refreshAgencyData = async () => console.log('Refresh agency not implemented');
  const logout = async () => {
    console.log('🔥 Logging out...');
    await supabase.auth.signOut();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    currentAgency,
    userAgencies: [],
    availableArtists,
    canManageAgencies: true, // Force true for emergency
    canManageCurrentAgency: true, // Force true for emergency
    canSwitchAgencies: false,
    switchAgency,
    refreshUser,
    refreshAgencyData,
    logout,
    hasRole,
    hasAgencyRole,
    canAccessAgency,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}