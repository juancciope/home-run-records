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

const recentReleases = [
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
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 bg-clip-text text-transparent">
          Welcome back, Artist! 🎵
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your music today.
        </p>
      </motion.div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Streams</p>
                  <p className="text-3xl font-bold text-blue-900">127.2K</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">+12.5%</span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <Play className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Followers</p>
                  <p className="text-3xl font-bold text-purple-900">21.2K</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">+8.2%</span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Engagement</p>
                  <p className="text-3xl font-bold text-green-900">4.8K</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">+15.3%</span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-100 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Reach</p>
                  <p className="text-3xl font-bold text-orange-900">342K</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">+9.7%</span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
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
                <LineChart data={streamingData}>
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
                {recentReleases.map((release, index) => (
                  <motion.div
                    key={release.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="w-12 h-12 rounded-lg">
                      <AvatarImage src={release.cover} className="rounded-lg" />
                      <AvatarFallback className="rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                        <Music className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold">{release.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          {release.streams}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {release.likes}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-green-700 bg-green-50">
                      {release.trend}
                    </Badge>
                  </motion.div>
                ))}
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
                  <p className="text-2xl font-bold text-pink-900">12.5K</p>
                  <p className="text-sm text-pink-700">Followers</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                  <Twitter className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">8.2K</p>
                  <p className="text-sm text-blue-700">Followers</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100">
                  <Youtube className="w-8 h-8 text-red-600 mb-2" />
                  <p className="text-2xl font-bold text-red-900">15.7K</p>
                  <p className="text-sm text-red-700">Subscribers</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                  <Music className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-green-900">21.2K</p>
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