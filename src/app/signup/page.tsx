'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, saveQuizAnswers } from '@/lib/supabaseClient';
import { getQuizProgress } from '@/utils/formatQuizForAI';
import { Music, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string | string[]>>({});
  const [quizProgress, setQuizProgress] = useState({ percentage: 0, completed: 0, total: 0 });

  useEffect(() => {
    // Load quiz answers from localStorage
    const savedAnswers = localStorage.getItem('quiz_answers');
    if (savedAnswers) {
      const answers = JSON.parse(savedAnswers);
      setQuizAnswers(answers);
      setQuizProgress(getQuizProgress(answers));
    } else {
      // No quiz answers found, redirect to quiz
      router.push('/quiz');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (quizProgress.percentage < 100) {
      setError('Please complete the quiz before creating your account');
      return;
    }

    setIsLoading(true);

    try {
      // Sign up user
      const { data, error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.user) {
        // Save quiz answers to database
        await saveQuizAnswers(data.user.id, quizAnswers);
        
        // Clear localStorage
        localStorage.removeItem('quiz_answers');
        
        // Redirect to plan page
        router.push('/plan');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-3 rounded-full mr-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold">Home Run Records</h1>
          </div>
          <h2 className="text-2xl font-bold mb-2">Create Your Artist Account</h2>
          <p className="text-xl text-gray-300">Get your personalized AI strategy plan</p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Quiz Progress Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-medium">Quiz Progress</span>
              <CheckCircle className={`w-5 h-5 ${quizProgress.percentage === 100 ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${quizProgress.percentage}%` }}
              />
            </div>
            <span className="text-gray-300 text-sm">
              {quizProgress.completed} of {quizProgress.total} questions completed ({quizProgress.percentage}%)
            </span>
            
            {quizProgress.percentage < 100 && (
              <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="text-yellow-200 text-sm">
                    Complete the quiz to unlock your AI strategy plan
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Signup Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-white font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-white font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-12"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength */}
                {password && (
                  <div className="mt-2">
                    <div className="flex space-x-1 mb-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 w-full rounded ${
                            level <= passwordStrength 
                              ? strengthColors[passwordStrength - 1] || 'bg-gray-500'
                              : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-300 text-sm">
                      Password strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-white font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-12"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-300 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="mt-2">
                    {password === confirmPassword ? (
                      <div className="flex items-center text-green-400 text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Passwords match
                      </div>
                    ) : (
                      <div className="flex items-center text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Passwords do not match
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-red-400 mr-2" />
                    <span className="text-red-200 text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || quizProgress.percentage < 100}
                className={`w-full py-3 rounded-lg font-medium transition-all ${
                  isLoading || quizProgress.percentage < 100
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700'
                }`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account & Get My Plan'}
              </button>

              {/* Terms */}
              <p className="text-center text-gray-300 text-sm">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </div>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-300">
              Already have an account?{' '}
              <button 
                onClick={() => router.push('/login')}
                className="text-pink-400 hover:text-pink-300 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}