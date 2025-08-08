"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getCurrentUser, supabase } from '@/lib/supabaseClient';
import { ArtistService, DashboardSummary } from '@/lib/services/artist-service';

interface ArtistProfile {
  id: string;
  email: string;
  artist_name?: string;
  stage_name?: string;
  genre?: string;
  bio?: string;
  profile_image_url?: string;
  website_url?: string;
  social_links?: Record<string, string>;
  subscription_tier?: string;
  onboarding_completed?: boolean;
}

interface ArtistContextType {
  // User state
  user: ArtistProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Dashboard data
  dashboardSummary: DashboardSummary | null;
  isDashboardLoading: boolean;

  // Actions
  refreshUser: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  updateProfile: (updates: Partial<ArtistProfile>) => Promise<boolean>;
  logout: () => Promise<void>;
}

const ArtistContext = createContext<ArtistContextType | undefined>(undefined);

interface ArtistProviderProps {
  children: ReactNode;
}

export function ArtistProvider({ children }: ArtistProviderProps) {
  const [user, setUser] = useState<ArtistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);

  const isAuthenticated = !!user;

  // Load user on mount and listen to auth changes
  useEffect(() => {
    loadUser();

    // Subscribe to auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Reload user data when signed in or token refreshed
        loadUser();
      } else if (event === 'SIGNED_OUT') {
        // Clear user data when signed out
        setUser(null);
        setDashboardSummary(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const loadDashboardSummary = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsDashboardLoading(true);
      const summary = await ArtistService.getDashboardSummary(user.id);
      setDashboardSummary(summary);
    } catch (error) {
      console.error('Error loading dashboard summary:', error);
    } finally {
      setIsDashboardLoading(false);
    }
  }, [user?.id]);

  // Load dashboard data when user changes
  useEffect(() => {
    if (user?.id) {
      loadDashboardSummary();
    }
  }, [user?.id, loadDashboardSummary]);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        console.log('Loading artist profile for user:', currentUser.id);
        
        // Get full artist profile, passing the actual user email from auth
        const profile = await ArtistService.getArtistProfile(currentUser.id, currentUser.email);
        
        if (profile) {
          console.log('Loaded artist profile:', profile);
          setUser({
            id: profile.id,
            email: profile.email || currentUser.email || '',
            artist_name: profile.artist_name,
            stage_name: profile.stage_name,
            genre: profile.genre,
            bio: profile.bio,
            profile_image_url: profile.profile_image_url,
            website_url: profile.website_url,
            social_links: profile.social_links,
            subscription_tier: profile.subscription_tier,
            onboarding_completed: profile.onboarding_completed,
          });
        } else {
          console.log('No profile found, creating basic user data');
          // Fallback to basic user data
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
            onboarding_completed: false,
          });
        }
      } else {
        // This is expected on public pages like login/signup
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  const refreshDashboard = async () => {
    await loadDashboardSummary();
  };

  const updateProfile = async (updates: Partial<ArtistProfile>): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const updatedProfile = await ArtistService.updateProfile(user.id, updates);
      if (updatedProfile) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Import signOut function
      const { signOut } = await import('@/lib/supabaseClient');
      
      // Sign out from Supabase
      const { error } = await signOut();
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setDashboardSummary(null);
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value: ArtistContextType = {
    user,
    isLoading,
    isAuthenticated,
    dashboardSummary,
    isDashboardLoading,
    refreshUser,
    refreshDashboard,
    updateProfile,
    logout,
  };

  return (
    <ArtistContext.Provider value={value}>
      {children}
    </ArtistContext.Provider>
  );
}

// Custom hook to use the artist context
export function useArtist() {
  const context = useContext(ArtistContext);
  if (context === undefined) {
    throw new Error('useArtist must be used within an ArtistProvider');
  }
  return context;
}

// HOC for protecting routes that require authentication
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, isLoading } = useArtist();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      // Redirect to login - in a real app, you'd use Next.js router
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground">Please log in to access this page.</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}