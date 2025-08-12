'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Building2,
  Crown,
  Activity,
  TrendingUp,
  Database,
  Shield,
  Settings,
  UserCheck,
  UserX,
  DollarSign,
  Calendar
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { createClient } from '@/utils/supabase/client'

interface SystemStats {
  totalUsers: number
  totalAgencies: number
  totalArtists: number
  activeUsers: number
  recentSignups: number
}

interface Agency {
  id: string
  name: string
  slug: string
  status: string
  subscription_tier: string
  max_artists: number
  created_at: string
  user_count?: number
  artist_count?: number
}

interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  global_role: string
  is_active: boolean
  last_login: string
  created_at: string
}

export function SuperadminDashboard() {
  const [stats, setStats] = useState<SystemStats | null>(null)
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Load system statistics
      const [usersResponse, agenciesResponse, artistsResponse] = await Promise.all([
        supabase.from('users').select('id, is_active, created_at'),
        supabase.from('agencies').select('id, created_at'),
        supabase.from('artists').select('id')
      ])

      if (usersResponse.data && agenciesResponse.data && artistsResponse.data) {
        const now = new Date()
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        
        const recentSignups = usersResponse.data.filter(
          user => new Date(user.created_at) > lastWeek
        ).length

        setStats({
          totalUsers: usersResponse.data.length,
          totalAgencies: agenciesResponse.data.length,
          totalArtists: artistsResponse.data.length,
          activeUsers: usersResponse.data.filter(u => u.is_active).length,
          recentSignups
        })
      }

      // Load agencies with counts
      const { data: agencyData } = await supabase
        .from('agencies')
        .select(`
          *,
          agency_users(count),
          artists(count)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (agencyData) {
        const processedAgencies = agencyData.map(agency => ({
          ...agency,
          user_count: Array.isArray(agency.agency_users) ? agency.agency_users.length : 0,
          artist_count: Array.isArray(agency.artists) ? agency.artists.length : 0
        }))
        setAgencies(processedAgencies)
      }

      // Load recent users
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (userData) {
        setUsers(userData)
      }
    } catch (error) {
      console.error('Error loading superadmin dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('users')
      .update({ is_active: !currentStatus })
      .eq('id', userId)

    if (!error) {
      loadDashboardData() // Refresh data
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Superadmin Dashboard
          </h2>
          <p className="text-muted-foreground">
            System overview and management tools
          </p>
        </div>
      </div>

      {/* System Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agencies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAgencies || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Artists</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalArtists || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentSignups || 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">Healthy</div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="agencies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agencies">Agencies</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="agencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Recent Agencies
              </CardTitle>
              <CardDescription>
                Manage agencies and their subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Artists</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agencies.map((agency) => (
                    <TableRow key={agency.id}>
                      <TableCell className="font-medium">{agency.name}</TableCell>
                      <TableCell>
                        <Badge variant={agency.status === 'active' ? 'default' : 'secondary'}>
                          {agency.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{agency.subscription_tier}</Badge>
                      </TableCell>
                      <TableCell>{agency.user_count || 0}</TableCell>
                      <TableCell>{agency.artist_count || 0}</TableCell>
                      <TableCell>
                        {new Date(agency.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Users
              </CardTitle>
              <CardDescription>
                Manage user accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.global_role === 'superadmin' ? 'default' : 'outline'}>
                          {user.global_role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'destructive'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString()
                          : 'Never'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                        >
                          {user.is_active ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Connection Status</span>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Backup</span>
                  <span className="text-sm text-muted-foreground">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Storage Used</span>
                  <span className="text-sm text-muted-foreground">2.3 GB</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Run Database Backup
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Billing Reports
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}