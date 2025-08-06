"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Music,
  TrendingUp,
  Users,
  Heart,
  DollarSign,
  Package,
  Megaphone,
  UserCheck,
  ShoppingCart,
  AlertCircle,
  Plus,
  ArrowRight,
  Target,
  Zap,
  Star,
} from "lucide-react"
import { motion } from "framer-motion"
import { useArtist } from "@/contexts/artist-context"

// Pipeline stage component
interface PipelineStageProps {
  title: string
  value: number
  icon: React.ElementType
  color: string
  isLast?: boolean
  percentage?: number
  description?: string
}

const PipelineStage: React.FC<PipelineStageProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  isLast = false,
  percentage,
  description 
}) => {
  return (
    <div className="relative flex items-center">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative z-10 w-full"
      >
        <Card className={`border-2 ${color} bg-gradient-to-br ${color.replace('border', 'from')}/5 to-white hover:shadow-lg transition-all duration-300 w-full`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${color.replace('border', 'bg')}/10 flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${color.replace('border', 'text')}`} />
              </div>
              {percentage !== undefined && (
                <Badge variant="secondary" className="text-xs">
                  {percentage}%
                </Badge>
              )}
            </div>
            <h3 className="text-2xl font-bold mb-1">{value.toLocaleString()}</h3>
            <p className="text-sm font-medium text-gray-700">{title}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {!isLast && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 z-0 w-16 flex items-center">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="w-full"
          >
            <ArrowRight className="w-8 h-8 text-gray-300" />
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Conversion rate indicator
const ConversionIndicator: React.FC<{ rate: number; label: string }> = ({ rate, label }) => {
  return (
    <div className="flex items-center gap-2">
      <Progress value={rate} className="w-24 h-2" />
      <span className="text-sm font-medium">{rate}% {label}</span>
    </div>
  )
}

export function DashboardContent() {
  const { user, isDashboardLoading } = useArtist();
  const [pipelineMetrics, setPipelineMetrics] = React.useState<{
    production: { unfinished: number; finished: number; released: number };
    marketing: { totalReach: number; engagedAudience: number; totalFollowers: number; youtubeSubscribers: number };
    fanEngagement: { capturedData: number; fans: number; superFans: number };
    conversion: { leads: number; opportunities: number; sales: number; revenue: number };
  } | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = React.useState(true);

  const loadPipelineMetrics = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoadingMetrics(true);
      const { ArtistService } = await import('@/lib/services/artist-service');
      const metrics = await ArtistService.getPipelineMetrics(user.id);
      setPipelineMetrics(metrics);
    } catch (error) {
      console.error('Error loading pipeline metrics:', error);
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [user?.id]);

  React.useEffect(() => {
    if (user?.id) {
      loadPipelineMetrics();
    }
  }, [user?.id, loadPipelineMetrics]);

  // Use real data if available, otherwise fall back to mock data
  const productionData = pipelineMetrics?.production || {
    unfinished: 12,
    finished: 5,
    released: 28,
  };

  const marketingData = {
    totalReach: pipelineMetrics?.marketing?.totalReach || 342000,
    engaged: pipelineMetrics?.marketing?.engagedAudience || 45600,
    followers: pipelineMetrics?.marketing?.totalFollowers || 21200,
  };

  const fanEngagementData = pipelineMetrics?.fanEngagement || {
    capturedData: 8500,
    fans: 3200,
    superFans: 150,
  };

  const conversionData = pipelineMetrics?.conversion || {
    leads: 450,
    opportunities: 120,
    sales: 45,
  };

  if (isDashboardLoading || isLoadingMetrics) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 bg-clip-text text-transparent">
          Business Intelligence Dashboard
        </h1>
        <p className="text-muted-foreground">
          Track your music business across 4 key realms: Production, Marketing, Fan Engagement, and Conversion
        </p>
      </motion.div>

      {/* 1. Production Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Production Pipeline</CardTitle>
                  <CardDescription>Your creative output journey</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                New Release
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 overflow-x-auto">
              <PipelineStage
                title="Unfinished"
                value={productionData.unfinished}
                icon={AlertCircle}
                color="border-yellow-500"
                percentage={27}
                description="Ideas & demos"
              />
              <PipelineStage
                title="Finished"
                value={productionData.finished}
                icon={Target}
                color="border-blue-500"
                percentage={11}
                description="Ready to release"
              />
              <PipelineStage
                title="Released"
                value={productionData.released}
                icon={Zap}
                color="border-green-500"
                isLast
                percentage={62}
                description="Live tracks"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <ConversionIndicator rate={42} label="completion rate" />
              <span className="text-muted-foreground">Goal: 50 releases this year</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. Marketing Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50/50 to-pink-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
                  <Megaphone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Marketing Funnel</CardTitle>
                  <CardDescription>Audience reach and growth metrics</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Boost Reach
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 overflow-x-auto">
              <PipelineStage
                title="Total Reach"
                value={marketingData.totalReach}
                icon={Users}
                color="border-purple-500"
                description="Aggregate audience"
              />
              <PipelineStage
                title="Engaged"
                value={marketingData.engaged}
                icon={UserCheck}
                color="border-pink-500"
                percentage={13}
                description="Active listeners"
              />
              <PipelineStage
                title="Followers"
                value={marketingData.followers}
                icon={Heart}
                color="border-red-500"
                isLast
                percentage={6}
                description="Loyal fans"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <ConversionIndicator rate={13} label="engagement rate" />
              <span className="text-muted-foreground">Target: 50K followers by year end</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3. Fan Engagement Pipeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Fan Engagement Pipeline</CardTitle>
                  <CardDescription>Building deeper connections</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <Star className="w-4 h-4" />
                Engage Fans
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 overflow-x-auto">
              <PipelineStage
                title="Captured Data"
                value={fanEngagementData.capturedData}
                icon={Users}
                color="border-green-500"
                description="Email list"
              />
              <PipelineStage
                title="Fans"
                value={fanEngagementData.fans}
                icon={Heart}
                color="border-emerald-500"
                percentage={38}
                description="Regular supporters"
              />
              <PipelineStage
                title="Super Fans"
                value={fanEngagementData.superFans}
                icon={Star}
                color="border-teal-500"
                isLast
                percentage={5}
                description="VIP community"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <ConversionIndicator rate={38} label="fan conversion" />
              <span className="text-muted-foreground">Goal: 500 super fans</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 4. Conversion Funnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50/50 to-red-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Conversion Funnel</CardTitle>
                  <CardDescription>Revenue generation pipeline</CardDescription>
                </div>
              </div>
              <Button size="sm" variant="outline" className="gap-2">
                <ShoppingCart className="w-4 h-4" />
                View Sales
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 overflow-x-auto">
              <PipelineStage
                title="Leads"
                value={conversionData.leads}
                icon={Users}
                color="border-orange-500"
                description="Interested buyers"
              />
              <PipelineStage
                title="Opportunities"
                value={conversionData.opportunities}
                icon={Target}
                color="border-red-500"
                percentage={27}
                description="Active deals"
              />
              <PipelineStage
                title="Sales"
                value={conversionData.sales}
                icon={DollarSign}
                color="border-rose-500"
                isLast
                percentage={38}
                description="Closed won"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <ConversionIndicator rate={10} label="close rate" />
              <span className="text-muted-foreground">
                Revenue: ${(pipelineMetrics?.conversion?.revenue || 12450).toLocaleString()} this month
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pipeline Health</p>
                <p className="text-2xl font-bold text-green-600">Good</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">
                  ${(pipelineMetrics?.conversion?.revenue || 12450).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">17</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Music className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Growth Rate</p>
                <p className="text-2xl font-bold text-green-600">+24%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}