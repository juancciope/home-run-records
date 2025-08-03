'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/supabaseClient';
import { Music, TrendingUp, Users, Disc, Play, Heart, Share2, LogOut, Settings } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('production');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/signup');
        return;
      }
      setUser(currentUser);
    } catch (err) {
      console.error('Error loading user:', err);
      router.push('/signup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Music className="w-12 h-12 animate-pulse mx-auto mb-4" />
          <p className="text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const dummyData = {
    production: {
      totalReleases: 8,
      finishedUnreleased: 3,
      unfinished: 5,
      inProgress: 2
    },
    reach: {
      spotifyStreams: 125000,
      appleMusic: 45000,
      youtubeViews: 89000,
      socialFollowers: 15600
    },
    engagement: {
      superFans: 1200,
      regularFans: 8500,
      coldFans: 5900,
      totalFans: 15600
    }
  };

  const tabs = [
    { id: 'production', label: 'Music Production', icon: Disc },
    { id: 'reach', label: 'Reach', icon: TrendingUp },
    { id: 'engagement', label: 'Fan Engagement', icon: Users }
  ];

  const renderProductionTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Total Releases</h3>
          <Disc className="w-6 h-6 text-green-400" />
        </div>
        <p className="text-3xl font-bold text-white mb-2">{dummyData.production.totalReleases}</p>
        <p className="text-green-400 text-sm">+2 this month</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Finished Unreleased</h3>
          <Play className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-3xl font-bold text-white mb-2">{dummyData.production.finishedUnreleased}</p>
        <p className="text-blue-400 text-sm">Ready to go</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Unfinished</h3>
          <Music className="w-6 h-6 text-yellow-400" />
        </div>
        <p className="text-3xl font-bold text-white mb-2">{dummyData.production.unfinished}</p>
        <p className="text-yellow-400 text-sm">In various stages</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">In Progress</h3>
          <TrendingUp className="w-6 h-6 text-purple-400" />
        </div>
        <p className="text-3xl font-bold text-white mb-2">{dummyData.production.inProgress}</p>
        <p className="text-purple-400 text-sm">Active projects</p>
      </div>
    </div>
  );

  const renderReachTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Spotify Streams</h3>
          <Music className="w-6 h-6 text-green-400" />
        </div>
        <p className="text-3xl font-bold text-white mb-2">{dummyData.reach.spotifyStreams.toLocaleString()}</p>
        <p className="text-green-400 text-sm">+15% this month</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Apple Music</h3>
          <Music className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-3xl font-bold text-white mb-2">{dummyData.reach.appleMusic.toLocaleString()}</p>
        <p className="text-gray-400 text-sm">+8% this month</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">YouTube Views</h3>
          <Play className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-3xl font-bold text-white mb-2">{dummyData.reach.youtubeViews.toLocaleString()}</p>
        <p className="text-red-400 text-sm">+22% this month</p>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Social Followers</h3>
          <Share2 className="w-6 h-6 text-pink-400" />
        </div>
        <p className="text-3xl font-bold text-white mb-2">{dummyData.reach.socialFollowers.toLocaleString()}</p>
        <p className="text-pink-400 text-sm">+5% this month</p>
      </div>
    </div>
  );

  const renderEngagementTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Super Fans</h3>
          <Heart className="w-6 h-6 text-red-400" />
        </div>
        <p className="text-3xl font-bold text-white mb-2">{dummyData.engagement.superFans.toLocaleString()}</p>
        <p className="text-red-400 text-sm">Highly engaged</p>
        <div className="mt-4 w-full bg-white/20 rounded-full h-2">
          <div className="bg-red-400 h-2 rounded-full" style={{ width: '85%' }}></div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Regular Fans</h3>
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <p className="text-3xl font-bold text-white mb-2">{dummyData.engagement.regularFans.toLocaleString()}</p>
        <p className="text-blue-400 text-sm">Active listeners</p>
        <div className="mt-4 w-full bg-white/20 rounded-full h-2">
          <div className="bg-blue-400 h-2 rounded-full" style={{ width: '65%' }}></div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Cold Fans</h3>
          <Users className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-3xl font-bold text-white mb-2">{dummyData.engagement.coldFans.toLocaleString()}</p>
        <p className="text-gray-400 text-sm">Potential growth</p>
        <div className="mt-4 w-full bg-white/20 rounded-full h-2">
          <div className="bg-gray-400 h-2 rounded-full" style={{ width: '35%' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-2 rounded-full mr-4">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Home Run Records</h1>
                <p className="text-sm text-gray-300">Artist Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/plan')}
                className="flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"
              >
                <Settings className="w-4 h-4 mr-2" />
                View Plan
              </button>
              <button
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-xl text-gray-300">Track your progress across all key metrics</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-full p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-3 rounded-full transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-6xl mx-auto">
          {activeTab === 'production' && renderProductionTab()}
          {activeTab === 'reach' && renderReachTab()}
          {activeTab === 'engagement' && renderEngagementTab()}
        </div>

        {/* Note about dummy data */}
        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-2">Demo Data</h3>
            <p className="text-gray-300">
              This dashboard currently shows sample data. Connect your streaming platforms, 
              social media accounts, and project management tools to see your real metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}