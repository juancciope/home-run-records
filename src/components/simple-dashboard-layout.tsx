"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Plug,
  Music,
  Users,
  Heart,
  Sparkles,
  Settings,
  Bell,
  Search,
  ChevronRight,
  TrendingUp,
  Activity,
  Radio,
  Menu,
} from "lucide-react"
import { motion } from "framer-motion"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    badge: null,
    gradient: "gradient-brand",
  },
  {
    title: "Connect Sources",
    url: "/dashboard/connect",
    icon: Plug,
    badge: "New",
    gradient: "gradient-music",
  },
  {
    title: "Releases",
    url: "/dashboard/releases",
    icon: Music,
    badge: null,
    gradient: "gradient-music",
  },
  {
    title: "Reach",
    url: "/dashboard/reach",
    icon: Radio,
    badge: null,
    gradient: "gradient-reach",
  },
  {
    title: "Fan Engagement",
    url: "/dashboard/engagement",
    icon: Heart,
    badge: "3",
    gradient: "gradient-engagement",
  },
  {
    title: "My Brand",
    url: "/dashboard/brand",
    icon: Sparkles,
    badge: null,
    gradient: "gradient-brand",
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    badge: null,
    gradient: "",
  },
]

export function SimpleDashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeItem, setActiveItem] = React.useState("Dashboard")
  const [sidebarOpen, setSidebarOpen] = React.useState(true)

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Home Run Records
              </h1>
              <p className="text-xs text-gray-500">Artist Dashboard</p>
            </div>
          </div>
        </div>
        
        {/* Sidebar Content */}
        <div className="px-4 py-6 h-full overflow-y-auto">
          <nav className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => setActiveItem(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between gap-3 rounded-xl p-3 transition-all duration-200 group hover:shadow-md",
                    activeItem === item.title
                      ? "bg-purple-500 text-white shadow-md scale-[1.02]"
                      : "hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                      activeItem === item.title
                        ? "bg-white/20"
                        : "bg-gray-100"
                    )}>
                      <item.icon className={cn(
                        "w-4 h-4",
                        activeItem === item.title ? "text-white" : "text-gray-600"
                      )} />
                    </div>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge variant={item.badge === "New" ? "default" : "secondary"} className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight className={cn(
                      "w-4 h-4 transition-transform",
                      activeItem === item.title ? "rotate-90" : "group-hover:translate-x-1"
                    )} />
                  </div>
                </button>
              </motion.div>
            ))}
          </nav>

          <Separator className="my-6" />

          {/* Quick Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 px-3">Quick Stats</h3>
            <div className="space-y-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Total Streams</p>
                    <p className="text-lg font-bold text-blue-700">127.2K</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">+12.5%</span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-900">Followers</p>
                    <p className="text-lg font-bold text-purple-700">8.4K</p>
                  </div>
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Activity className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">+8.2%</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
              <Avatar className="w-9 h-9">
                <AvatarImage src="/api/placeholder/36/36" />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                  AR
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">Artist Name</p>
                <p className="text-xs text-gray-500">Premium Plan</p>
              </div>
              <Settings className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-xl px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search your music data..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
            
            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarImage src="/api/placeholder/32/32" />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold">
                AR
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 via-gray-50/95 to-gray-100/20">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}