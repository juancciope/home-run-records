"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
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
  PanelLeft,
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
    <div className="flex min-h-screen bg-background">
      {/* Fixed Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border shadow-sm transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-card animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Home Run Records
              </h1>
              <p className="text-xs text-muted-foreground">Artist Dashboard</p>
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
                <Button
                  variant={activeItem === item.title ? "default" : "ghost"}
                  onClick={() => setActiveItem(item.title)}
                  className={cn(
                    "w-full justify-start gap-3 h-11 px-3 transition-all duration-200",
                    activeItem === item.title
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                    activeItem === item.title
                      ? "bg-white/20"
                      : "bg-muted"
                  )}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium flex-1 text-left">{item.title}</span>
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
                </Button>
              </motion.div>
            ))}
          </nav>

          <Separator className="my-6" />

          {/* Quick Stats */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground px-3">Quick Stats</h3>
            <div className="space-y-3">
              <motion.div whileHover={{ scale: 1.02 }}>
                <Card className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Total Streams</p>
                        <p className="text-lg font-bold text-foreground">127.2K</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Activity className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500 font-medium">+12.5%</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <Card className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">Followers</p>
                        <p className="text-lg font-bold text-foreground">8.4K</p>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-500" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Activity className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-green-500 font-medium">+8.2%</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card">
            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-9 h-9">
                    <AvatarImage src="/api/placeholder/36/36" />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                      AR
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Artist Name</p>
                    <p className="text-xs text-muted-foreground">Premium Plan</p>
                  </div>
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0 lg:hidden"
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
          <Separator orientation="vertical" className="h-6 lg:hidden" />
          
          <div className="flex-1 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search your music data..."
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            
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
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background/95 to-muted/20">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}