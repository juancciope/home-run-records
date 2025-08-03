import Link from 'next/link';
import { Music, Target, TrendingUp, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white">
          {/* Logo/Brand */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full mr-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Home Run Records</h1>
          </div>
          
          {/* Tagline */}
          <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Artist Intelligence System
          </h2>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Discover who you are as an artist through guided questions that help you 
            understand your unique sound, find your audience, and create a personalized 
            roadmap for your music journey.
          </p>

          {/* CTA Button */}
          <Link 
            href="/quiz"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Begin Artist Discovery
            <TrendingUp className="ml-2 w-5 h-5" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-full w-fit mx-auto mb-4">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Artist Discovery</h3>
            <p className="text-gray-300">
              Thoughtful questions that help you discover your unique sound, understand 
              your audience, and clarify your artistic vision.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-full w-fit mx-auto mb-4">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">AI Strategy Plans</h3>
            <p className="text-gray-300">
              Get personalized, actionable career strategies powered by AI and 
              industry expertise tailored to your goals.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center text-white">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-full w-fit mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Progress Dashboard</h3>
            <p className="text-gray-300">
              Track your music production, reach, and fan engagement with 
              our comprehensive artist dashboard.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 text-center text-white">
          <h3 className="text-3xl font-bold mb-12">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h4 className="font-semibold mb-2">Take the Quiz</h4>
              <p className="text-gray-300 text-sm">Answer questions about your identity, audience, vision, and projects</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h4 className="font-semibold mb-2">Create Account</h4>
              <p className="text-gray-300 text-sm">Sign up to save your results and access your personalized plan</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h4 className="font-semibold mb-2">Get AI Strategy</h4>
              <p className="text-gray-300 text-sm">Receive your custom career roadmap and actionable recommendations</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mb-4">4</div>
              <h4 className="font-semibold mb-2">Track Progress</h4>
              <p className="text-gray-300 text-sm">Monitor your growth with our comprehensive dashboard</p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center mt-20">
          <p className="text-xl text-gray-300 mb-6">Ready to transform your music career?</p>
          <Link 
            href="/quiz"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Start Free Assessment
          </Link>
        </div>
      </div>
    </div>
  );
}
