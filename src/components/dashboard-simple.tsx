"use client"

import * as React from "react"
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
  Share2,
  Settings,
  Bell,
  Search,
  LayoutDashboard,
  Plug,
  Sparkles
} from "lucide-react"

const dashboardStyles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  sidebar: {
    width: '280px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column' as const
  },
  sidebarHeader: {
    padding: '24px',
    borderBottom: '1px solid #e2e8f0'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  brandText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b'
  },
  subtitle: {
    fontSize: '12px',
    color: '#64748b'
  },
  sidebarContent: {
    flex: 1,
    padding: '24px 16px',
    overflowY: 'auto' as const
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569'
  },
  menuItemActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    transform: 'scale(1.02)',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
  },
  menuItemHover: {
    backgroundColor: '#f1f5f9'
  },
  iconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const
  },
  topBar: {
    height: '64px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    gap: '16px'
  },
  searchBox: {
    flex: 1,
    maxWidth: '400px',
    position: 'relative' as const
  },
  searchInput: {
    width: '100%',
    padding: '8px 16px 8px 40px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    fontSize: '14px',
    outline: 'none'
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#64748b'
  },
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto' as const,
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
  },
  welcomeSection: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '8px'
  },
  subtitle2: {
    fontSize: '16px',
    color: '#64748b'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease'
  },
  metricCardHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)'
  },
  metricHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px'
  },
  metricTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b'
  },
  metricValue: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px'
  },
  metricChange: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '14px',
    fontWeight: '500'
  },
  positive: {
    color: '#10b981'
  },
  gradientBlue: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  },
  gradientPurple: {
    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
  },
  gradientGreen: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  gradientOrange: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  }
}

const menuItems = [
  { title: "Dashboard", icon: LayoutDashboard, active: true },
  { title: "Connect Sources", icon: Plug, badge: "New" },
  { title: "Releases", icon: Music },
  { title: "Reach", icon: Radio },
  { title: "Fan Engagement", icon: Heart, badge: "3" },
  { title: "My Brand", icon: Sparkles },
  { title: "Settings", icon: Settings },
]

export function SimpleDashboard() {
  const [hoveredCard, setHoveredCard] = React.useState<number | null>(null)

  return (
    <div style={dashboardStyles.container}>
      {/* Sidebar */}
      <div style={dashboardStyles.sidebar}>
        <div style={dashboardStyles.sidebarHeader}>
          <div style={dashboardStyles.logo}>
            <div style={dashboardStyles.logoIcon}>
              <Music size={20} />
            </div>
            <div>
              <div style={dashboardStyles.brandText}>Home Run Records</div>
              <div style={dashboardStyles.subtitle}>Artist Dashboard</div>
            </div>
          </div>
        </div>

        <div style={dashboardStyles.sidebarContent}>
          {menuItems.map((item, index) => (
            <div
              key={item.title}
              style={{
                ...dashboardStyles.menuItem,
                ...(item.active ? dashboardStyles.menuItemActive : {})
              }}
            >
              <div style={{
                ...dashboardStyles.iconBox,
                backgroundColor: item.active ? 'rgba(255,255,255,0.2)' : '#f1f5f9'
              }}>
                <item.icon size={16} />
              </div>
              <span>{item.title}</span>
              {item.badge && (
                <span style={{
                  marginLeft: 'auto',
                  backgroundColor: item.badge === 'New' ? '#3b82f6' : '#64748b',
                  color: 'white',
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {item.badge}
                </span>
              )}
            </div>
          ))}

          {/* Quick Stats */}
          <div style={{ marginTop: '32px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: '16px' }}>
              Quick Stats
            </div>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '500' }}>Total Streams</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e3a8a' }}>127.2K</div>
                </div>
                <TrendingUp size={20} style={{ color: '#3b82f6' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>+12.5% ↗</div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#7c2d12', fontWeight: '500' }}>Followers</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#581c87' }}>21.2K</div>
                </div>
                <Users size={20} style={{ color: '#8b5cf6' }} />
              </div>
              <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px' }}>+8.2% ↗</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={dashboardStyles.mainContent}>
        {/* Top Bar */}
        <div style={dashboardStyles.topBar}>
          <div style={dashboardStyles.searchBox}>
            <div style={dashboardStyles.searchIcon}>
              <Search size={16} />
            </div>
            <input
              type="search"
              placeholder="Search your music data..."
              style={dashboardStyles.searchInput}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="#64748b" />
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '10px',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>3</div>
            </div>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              AR
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={dashboardStyles.content}>
          {/* Welcome Section */}
          <div style={dashboardStyles.welcomeSection}>
            <h1 style={dashboardStyles.title}>Welcome back, Artist! 🎵</h1>
            <p style={dashboardStyles.subtitle2}>Here&apos;s what&apos;s happening with your music today.</p>
          </div>

          {/* Metrics Grid */}
          <div style={dashboardStyles.metricsGrid}>
            {[
              { 
                title: "Total Streams", 
                value: "127.2K", 
                change: "+12.5%", 
                icon: Play, 
                gradient: dashboardStyles.gradientBlue 
              },
              { 
                title: "Followers", 
                value: "21.2K", 
                change: "+8.2%", 
                icon: Users, 
                gradient: dashboardStyles.gradientPurple 
              },
              { 
                title: "Engagement", 
                value: "4.8K", 
                change: "+15.3%", 
                icon: Heart, 
                gradient: dashboardStyles.gradientGreen 
              },
              { 
                title: "Reach", 
                value: "342K", 
                change: "+9.7%", 
                icon: Radio, 
                gradient: dashboardStyles.gradientOrange 
              },
            ].map((metric, index) => (
              <div
                key={metric.title}
                style={{
                  ...dashboardStyles.metricCard,
                  ...(hoveredCard === index ? dashboardStyles.metricCardHover : {})
                }}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div style={dashboardStyles.metricHeader}>
                  <div style={dashboardStyles.metricTitle}>{metric.title}</div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    ...metric.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <metric.icon size={24} />
                  </div>
                </div>
                <div style={dashboardStyles.metricValue}>{metric.value}</div>
                <div style={{ ...dashboardStyles.metricChange, ...dashboardStyles.positive }}>
                  <TrendingUp size={16} />
                  <span>{metric.change} vs last month</span>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Content */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px'
          }}>
            {/* Recent Activity */}
            <div style={{
              ...dashboardStyles.metricCard,
              height: 'fit-content'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Music size={20} color="#ec4899" />
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Recent Releases</h3>
              </div>
              {[
                { title: "Midnight Dreams", streams: "127K", likes: "2.1K" },
                { title: "City Lights", streams: "89K", likes: "1.8K" },
                { title: "Summer Vibes", streams: "156K", likes: "3.2K" }
              ].map((release, index) => (
                <div key={release.title} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  transition: 'background-color 0.2s ease'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <Music size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{release.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '16px' }}>
                      <span>🎵 {release.streams}</span>
                      <span>❤️ {release.likes}</span>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}>
                    +{15 - index * 3}%
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div style={{
              ...dashboardStyles.metricCard,
              height: 'fit-content'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Share2 size={20} color="#3b82f6" />
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Social Media</h3>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px'
              }}>
                {[
                  { platform: "Instagram", followers: "12.5K", icon: Instagram, color: "#e91e63" },
                  { platform: "Twitter", followers: "8.2K", icon: Twitter, color: "#1da1f2" },
                  { platform: "YouTube", followers: "15.7K", icon: Youtube, color: "#ff0000" },
                  { platform: "Spotify", followers: "21.2K", icon: Music, color: "#1db954" }
                ].map((social, index) => (
                  <div key={social.platform} style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0'
                  }}>
                    <social.icon size={24} color={social.color} style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{social.followers}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{social.platform}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}