'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getQuizAnswers, getStrategyPlan, saveStrategyPlan } from '@/lib/supabaseClient';
import { generateStrategyPlan } from '@/lib/openai';
import { Music, Loader2, Download, ArrowRight, CheckCircle } from 'lucide-react';

export default function PlanPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [strategyPlan, setStrategyPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserAndPlan();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadUserAndPlan = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/signup');
        return;
      }
      setUser(currentUser);

      // Check if strategy plan already exists
      const { data: existingPlan } = await getStrategyPlan(currentUser.id);
      
      if (existingPlan) {
        setStrategyPlan(existingPlan.plan_text);
      } else {
        // Generate new plan
        await generateNewPlan(currentUser.id);
      }
    } catch (err) {
      console.error('Error loading plan:', err);
      setError('Failed to load your strategy plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewPlan = async (userId: string) => {
    try {
      setIsGenerating(true);
      setError('');

      // Get quiz answers
      const { data: quizData, error: quizError } = await getQuizAnswers(userId);
      if (quizError || !quizData) {
        setError('Quiz answers not found. Please complete the quiz first.');
        router.push('/quiz');
        return;
      }

      // Generate AI strategy plan
      const aiPlan = await generateStrategyPlan(quizData.answers);
      
      // Save to database
      await saveStrategyPlan(userId, aiPlan);
      
      setStrategyPlan(aiPlan);
    } catch (err) {
      console.error('Error generating plan:', err);
      setError('Failed to generate your strategy plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPlan = () => {
    const element = document.createElement('a');
    const file = new Blob([strategyPlan], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'my-artist-strategy-plan.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Loading your strategy plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full mr-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Your AI Strategy Plan</h1>
          </div>
          <p className="text-xl text-gray-300">
            Personalized career roadmap based on your assessment
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center text-green-300 mb-2">
              <CheckCircle className="w-6 h-6 mr-3" />
              <h3 className="text-lg font-semibold">Assessment Complete!</h3>
            </div>
            <p className="text-green-200">
              Your personalized strategy plan has been generated based on your quiz responses. 
              This plan is tailored specifically to your artistic goals and current situation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <button
              onClick={handleDownloadPlan}
              className="flex items-center px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Plan
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all"
            >
              View Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>

          {/* Strategy Plan Content */}
          {isGenerating ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-pink-400" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Generating Your Strategy Plan...
              </h3>
              <p className="text-gray-300">
                Our AI is analyzing your responses and creating a personalized career roadmap.
                This may take a moment.
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-semibold text-red-300 mb-4">Something went wrong</h3>
              <p className="text-red-200 mb-6">{error}</p>
              <button
                onClick={() => user?.id && generateNewPlan(user.id)}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Try Again
              </button>
            </div>
          ) : strategyPlan ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-gray-100 leading-relaxed">
                  {strategyPlan}
                </div>
              </div>
            </div>
          ) : null}

          {/* Next Steps */}
          <div className="mt-8 text-center">
            <p className="text-gray-300 mb-4">
              Ready to start implementing your strategy?
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}