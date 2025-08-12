import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music2, TrendingUp, Users, BarChart3, Sparkles, ArrowRight, Mic2, Radio, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0e27' }}>
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Music2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-white">Artist OS</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button className="bg-violet-600 hover:bg-violet-700 text-white border-0" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-violet-300 text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Powered by Viberate Analytics
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Your Complete Artist Management Platform
          </h1>
          
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Track your music production, measure your reach, and engage with your audience - all in one powerful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white border-0 text-base" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white text-base" asChild>
              <Link href="/login">
                Sign In to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">Everything You Need to Grow Your Music Career</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Professional tools and insights designed specifically for independent artists and music agencies.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-white/5 backdrop-blur border-white/10 hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center mb-4">
                <Mic2 className="h-6 w-6 text-violet-400" />
              </div>
              <CardTitle className="text-white">Track Production</CardTitle>
              <CardDescription className="text-gray-400">
                Monitor your releases, streams, and production metrics in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">•</span>
                  Release calendar management
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Stream analytics across platforms
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Production milestone tracking
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur border-white/10 hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-violet-400" />
              </div>
              <CardTitle className="text-white">Measure Reach</CardTitle>
              <CardDescription className="text-gray-400">
                Analyze your growth across all social and streaming platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">•</span>
                  Multi-platform analytics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Follower growth tracking
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Engagement rate insights
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur border-white/10 hover:bg-white/10 transition-all">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-violet-400" />
              </div>
              <CardTitle className="text-white">Fan Engagement</CardTitle>
              <CardDescription className="text-gray-400">
                Understand and connect with your audience effectively
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">•</span>
                  Audience demographics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Fan interaction metrics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Engagement optimization
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-black/10 py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2">500K+</div>
              <div className="text-sm text-gray-400">Artists Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2">15+</div>
              <div className="text-sm text-gray-400">Platform Integrations</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2">Real-time</div>
              <div className="text-sm text-gray-400">Data Updates</div>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent mb-2">24/7</div>
              <div className="text-sm text-gray-400">Analytics Access</div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-white">
                Comprehensive Analytics Dashboard
              </h2>
              <p className="text-gray-400 mb-6">
                Get deep insights into your music career with our professional analytics suite. Track performance across Spotify, YouTube, Instagram, TikTok, and more.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-5 w-5 text-violet-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">Performance Metrics</div>
                    <div className="text-sm text-gray-400">
                      Track streams, views, and engagement rates
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Radio className="h-5 w-5 text-violet-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">Platform Rankings</div>
                    <div className="text-sm text-gray-400">
                      Monitor your position across genres and regions
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-violet-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">Global Reach</div>
                    <div className="text-sm text-gray-400">
                      Understand your international audience distribution
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-8 h-96 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 text-violet-400/20" />
                <p>Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-violet-900/20 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Ready to Take Control of Your Music Career?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of artists who are already using Artist OS to grow their fanbase and optimize their strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white border-0" asChild>
              <Link href="/signup">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 hover:text-white" asChild>
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Music2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-white">Artist OS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-violet-400 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-violet-400 transition-colors">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-violet-400 transition-colors">
                Contact
              </Link>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 Artist OS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}