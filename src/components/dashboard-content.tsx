"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Music,
  TrendingUp,
  Users,
  Heart,
  Play,
  Radio,
  Instagram,
  Twitter,
  Youtube,
  Calendar,
  Target,
  Zap,
  Award,
  Eye,
  Share2,
} from "lucide-react"
import { motion } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useArtist } from "@/contexts/artist-context"
import { ArtistService, Release } from "@/lib/services/artist-service"

// Utility function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

const streamingData = [
  { month: "Jan", streams: 45000, followers: 12000 },
  { month: "Feb", streams: 52000, followers: 13500 },
  { month: "Mar", streams: 61000, followers: 15200 },
  { month: "Apr", streams: 58000, followers: 16800 },
  { month: "May", streams: 73000, followers: 18500 },
  { month: "Jun", streams: 89000, followers: 21200 },
]

const platformData = [
  { name: "Spotify", value: 45, color: "#1DB954" },
  { name: "Apple Music", value: 25, color: "#FA57C1" },
  { name: "YouTube", value: 20, color: "#FF0000" },
  { name: "SoundCloud", value: 10, color: "#FF5500" },
]

interface DisplayRelease {
  title: string;
  cover: string;
  streams: string;
  likes: string;
  releaseDate: string;
  trend: string;
}

const recentReleases: DisplayRelease[] = [
  {
    title: "Midnight Dreams",
    cover: "/api/placeholder/64/64",
    streams: "127K",
    likes: "2.1K",
    releaseDate: "2024-01-15",
    trend: "+15%"
  },
  {
    title: "City Lights",
    cover: "/api/placeholder/64/64",
    streams: "89K",
    likes: "1.8K",
    releaseDate: "2024-01-01",
    trend: "+8%"
  },
  {
    title: "Summer Vibes",
    cover: "/api/placeholder/64/64",
    streams: "156K",
    likes: "3.2K",
    releaseDate: "2023-12-20",
    trend: "+22%"
  },
]

const topFans = [
  { name: "Sarah M.", avatar: "/api/placeholder/32/32", engagement: "High", streams: "245" },
  { name: "Alex R.", avatar: "/api/placeholder/32/32", engagement: "High", streams: "198" },
  { name: "Jamie L.", avatar: "/api/placeholder/32/32", engagement: "Medium", streams: "156" },
  { name: "Chris P.", avatar: "/api/placeholder/32/32", engagement: "High", streams: "189" },
]

export function DashboardContent() {
  const { user, dashboardSummary, isDashboardLoading } = useArtist();
  const [trendingData, setTrendingData] = React.useState<Record<string, Array<{ date: string; value: number; platform?: string }>>>({});
  const [releases, setReleases] = React.useState<Release[]>([]);
  const [isLoadingData, setIsLoadingData] = React.useState(true);

  const loadAdditionalData = React.useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoadingData(true);
      const [trending, userReleases] = await Promise.all([
        ArtistService.getTrendingData(user.id, 180), // 6 months of data
        ArtistService.getReleases(user.id, 'released')
      ]);

      setTrendingData(trending);
      setReleases(userReleases.slice(0, 3)); // Show top 3 releases
    } catch (error) {
      console.error('Error loading additional data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    if (user?.id) {
      loadAdditionalData();
    }
  }, [user?.id, loadAdditionalData]);

  // Convert trending data to chart format
  const chartData = React.useMemo(() => {
    if (!trendingData.streams) return streamingData; // fallback to dummy data

    return trendingData.streams
      .slice(-6) // last 6 data points
      .map((item, index: number) => ({
        month: new Date(item.date).toLocaleDateString('en', { month: 'short' }),
        streams: item.value,
        followers: trendingData.followers?.[index]?.value || 0
      }));
  }, [trendingData]);

  const displayName = user?.stage_name || user?.artist_name || 'Artist';

  if (isDashboardLoading || isLoadingData) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 bg-clip-text text-transparent">
          Welcome back, {displayName}! 🎵
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your music today.
        </p>
        {dashboardSummary?.artist_score && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              Artist Score: {dashboardSummary.artist_score}
            </Badge>
          </div>
        )}
      </motion.div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            key: 'streams', 
            title: 'Total Streams', 
            icon: Play, 
            gradient: 'from-blue-50 to-indigo-100',
            textColor: 'text-blue-700',
            valueColor: 'text-blue-900',
            iconBg: 'bg-blue-500'
          },
          { 
            key: 'followers', 
            title: 'Followers', 
            icon: Users, 
            gradient: 'from-purple-50 to-pink-100',
            textColor: 'text-purple-700',
            valueColor: 'text-purple-900',
            iconBg: 'bg-purple-500'
          },
          { 
            key: 'engagement', 
            title: 'Engagement', 
            icon: Heart, 
            gradient: 'from-green-50 to-emerald-100',
            textColor: 'text-green-700',
            valueColor: 'text-green-900',
            iconBg: 'bg-green-500'
          },
          { 
            key: 'reach', 
            title: 'Reach', 
            icon: Radio, 
            gradient: 'from-orange-50 to-red-100',
            textColor: 'text-orange-700',
            valueColor: 'text-orange-900',
            iconBg: 'bg-orange-500'
          },
        ].map((metric, index) => {
          const metricData = dashboardSummary?.metrics?.[metric.key];
          const value = metricData?.current || 0;
          const changePercent = metricData?.change_percent;
          
          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className={`border-0 bg-gradient-to-br ${metric.gradient} hover:shadow-lg transition-all duration-300`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-medium ${metric.textColor}`}>{metric.title}</p>
                      <p className={`text-3xl font-bold ${metric.valueColor}`}>
                        {formatNumber(value)}
                      </p>
                      {changePercent !== undefined && (
                        <div className="flex items-center gap-1 mt-1">
                          <TrendingUp className={`w-4 h-4 ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                          <span className={`text-sm font-medium ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                          </span>
                          <span className="text-sm text-gray-500">vs last month</span>
                        </div>
                      )}
                    </div>
                    <div className={`w-12 h-12 rounded-full ${metric.iconBg} flex items-center justify-center`}>
                      <metric.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Performance Trends
              </CardTitle>
              <CardDescription>Streams and followers over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="streams"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="followers"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Platform Distribution
              </CardTitle>
              <CardDescription>Where your audience discovers your music</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={platformData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {platformData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity & Top Fans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="w-5 h-5 text-pink-600" />
                Recent Releases
              </CardTitle>
              <CardDescription>Your latest tracks performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(releases.length > 0 ? releases : recentReleases).map((release, index) => {
                  const isRealData = releases.length > 0;
                  const displayRelease: DisplayRelease = isRealData ? {
                    title: (release as Release).title,
                    cover: (release as Release).cover_image_url || "/api/placeholder/64/64",
                    streams: formatNumber(Math.floor(Math.random() * 200000) + 50000), // Mock streams for now
                    likes: formatNumber(Math.floor(Math.random() * 5000) + 1000), // Mock likes for now
                    trend: `+${Math.floor(Math.random() * 20) + 5}%`, // Mock trend for now
                    releaseDate: (release as Release).release_date || ''
                  } : (release as DisplayRelease);

                  return (
                    <motion.div
                      key={displayRelease.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <Avatar className="w-12 h-12 rounded-lg">
                        <AvatarImage src={displayRelease.cover} className="rounded-lg" />
                        <AvatarFallback className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                          <Music className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{displayRelease.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {displayRelease.streams}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {displayRelease.likes}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-green-700 bg-green-50">
                        {displayRelease.trend}
                      </Badge>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Top Fans
              </CardTitle>
              <CardDescription>Your most engaged listeners</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topFans.map((fan, index) => (
                  <motion.div
                    key={fan.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={fan.avatar} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                        {fan.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{fan.name}</h4>
                      <p className="text-sm text-muted-foreground">{fan.streams} streams</p>
                    </div>
                    <Badge
                      variant={fan.engagement === "High" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {fan.engagement}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Social Media & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="lg:col-span-2"
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                Social Media Performance
              </CardTitle>
              <CardDescription>Track your social presence across platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100">
                  <Instagram className="w-8 h-8 text-pink-600 mb-2" />
                  <p className="text-2xl font-bold text-pink-900">
                    {dashboardSummary?.metrics?.followers?.current ? 
                      formatNumber(Math.floor(dashboardSummary.metrics.followers.current * 0.6)) : 
                      '12.5K'
                    }
                  </p>
                  <p className="text-sm text-pink-700">Followers</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                  <Twitter className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">
                    {dashboardSummary?.metrics?.followers?.current ? 
                      formatNumber(Math.floor(dashboardSummary.metrics.followers.current * 0.4)) : 
                      '8.2K'
                    }
                  </p>
                  <p className="text-sm text-blue-700">Followers</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100">
                  <Youtube className="w-8 h-8 text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-red-900">
                    {dashboardSummary?.metrics?.followers?.current ? 
                      formatNumber(Math.floor(dashboardSummary.metrics.followers.current * 0.8)) : 
                      '15.7K'
                    }
                  </p>
                  <p className="text-sm text-red-700">Subscribers</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                  <Music className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-900">
                    {dashboardSummary?.metrics?.followers?.current ? 
                      formatNumber(dashboardSummary.metrics.followers.current) : 
                      '21.2K'
                    }
                  </p>
                  <p className="text-sm text-green-700">Spotify</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Music className="w-4 h-4" />
                  Upload New Track
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Calendar className="w-4 h-4" />
                  Schedule Post
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Eye className="w-4 h-4" />
                  View Analytics
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Target className="w-4 h-4" />
                  Run Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}