"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
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

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [activeItem, setActiveItem] = React.useState("Dashboard")

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="relative flex min-h-screen w-full">
        <Sidebar 
          variant="sidebar" 
          collapsible="none"
          className="w-64 border-r border-border/40 bg-sidebar/30 backdrop-blur-xl"
        >
          <SidebarHeader className="border-b border-border/40 p-6">
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
                <p className="text-xs text-muted-foreground">Artist Dashboard</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-6 custom-scrollbar">
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SidebarMenuButton
                      onClick={() => setActiveItem(item.title)}
                      className={cn(
                        "w-full justify-start gap-3 rounded-xl p-3 transition-all duration-200 group hover:shadow-lg",
                        activeItem === item.title
                          ? "bg-primary text-primary-foreground shadow-md scale-[1.02]"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        activeItem === item.title
                          ? "bg-white/20"
                          : item.gradient ? `${item.gradient} opacity-80` : "bg-muted"
                      )}>
                        <item.icon className={cn(
                          "w-4 h-4",
                          activeItem === item.title ? "text-white" : "text-white"
                        )} />
                      </div>
                      <span className="font-medium">{item.title}</span>
                      {item.badge && (
                        <Badge variant={item.badge === "New" ? "default" : "secondary"} className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                      <ChevronRight className={cn(
                        "w-4 h-4 ml-auto transition-transform",
                        activeItem === item.title ? "rotate-90" : "group-hover:translate-x-1"
                      )} />
                    </SidebarMenuButton>
                  </motion.div>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            <Separator className="my-6" />

            {/* Quick Stats */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground px-3">Quick Stats</h3>
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
          </SidebarContent>

          <SidebarFooter className="border-t border-border/40 p-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
              <Avatar className="w-9 h-9">
                <AvatarImage src="/api/placeholder/36/36" />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
                  AR
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium">Artist Name</p>
                <p className="text-xs text-muted-foreground">Premium Plan</p>
              </div>
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 min-w-0">
          {/* Top Navigation */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b border-border/40 bg-background/80 backdrop-blur-xl px-6">
            <SidebarTrigger className="shrink-0" />
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search your music data..."
                  className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
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
          <main className="flex-1 overflow-auto bg-gradient-to-br from-background via-background/95 to-muted/20">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}