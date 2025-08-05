import Link from 'next/link';
import { Music, Users, LogIn, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center text-white">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full mr-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Home Run Records</h1>
          </div>
          
          <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Artist Intelligence Platform
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Empowering artists with data-driven insights and strategic guidance
          </p>
        </div>

        {/* Two Main CTAs */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12">
          {/* Login Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white border border-white/20 hover:border-pink-500/50 transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-full w-fit mx-auto mb-6">
              <LogIn className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Artist Login</h3>
            <p className="text-gray-300 mb-8">
              Access your dashboard to track your music production, reach, and fan engagement metrics
            </p>
            <Link 
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-full hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
            >
              Login to Dashboard
            </Link>
          </div>

          {/* Find Your Audience Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white border border-white/20 hover:border-purple-500/50 transition-all duration-300">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-4 rounded-full w-fit mx-auto mb-6">
              <Users className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Find Your Audience</h3>
            <p className="text-gray-300 mb-8">
              Discover your ideal fan profile with our quick 6-question assessment tool
            </p>
            <Link 
              href="/find-your-audience"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Start Free Assessment
              <Sparkles className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 text-center text-white">
          <h3 className="text-3xl font-bold mb-12">Platform Features</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h4 className="font-semibold mb-2">Track Production</h4>
              <p className="text-gray-400 text-sm">Monitor releases, streams, and production metrics</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h4 className="font-semibold mb-2">Measure Reach</h4>
              <p className="text-gray-400 text-sm">Analyze your social media and streaming platform growth</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6">
              <h4 className="font-semibold mb-2">Fan Engagement</h4>
              <p className="text-gray-400 text-sm">Understand and connect with your audience</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-20 text-gray-400">
          <p className="text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-pink-400 hover:text-pink-300">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}