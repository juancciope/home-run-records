"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getCurrentUser } from '@/lib/supabaseClient';
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

  // Load user on mount and auth changes
  useEffect(() => {
    loadUser();
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
        // Get full artist profile
        const profile = await ArtistService.getArtistProfile(currentUser.id);
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
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
          // Fallback to basic user data
          setUser({
            id: currentUser.id,
            email: currentUser.email || '',
          });
        }
      } else {
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
      // Clear local state
      setUser(null);
      setDashboardSummary(null);
      
      // Note: Actual logout should be handled by the auth system
      // This is just for context cleanup
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