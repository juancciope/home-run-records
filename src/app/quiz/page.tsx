'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { quizSections, QuizSection, QuizQuestion } from '@/lib/quizQuestions';
import { getQuizProgress } from '@/utils/formatQuizForAI';
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isComplete, setIsComplete] = useState(false);

  // Flatten all questions into one array for smoother progression
  const allQuestions = quizSections.flatMap(section => 
    section.questions.map(question => ({
      ...question,
      sectionTitle: section.title,
      sectionDescription: section.description
    }))
  );

  // Load saved answers from localStorage
  useEffect(() => {
    const savedAnswers = localStorage.getItem('quiz_answers');
    if (savedAnswers) {
      setAnswers(JSON.parse(savedAnswers));
    }
  }, []);

  // Save answers to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('quiz_answers', JSON.stringify(answers));
    
    // Check if quiz is complete
    const progress = getQuizProgress(answers);
    setIsComplete(progress.percentage === 100);
  }, [answers]);

  const currentQuestion = allQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;
  const progress = Math.round(((currentQuestionIndex + 1) / allQuestions.length) * 100);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      router.push('/signup');
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstQuestion) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isCurrentQuestionAnswered = () => {
    const answer = answers[currentQuestion.id];
    return answer !== undefined && answer !== null && answer !== '' && !(Array.isArray(answer) && answer.length === 0);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Artist Discovery</h1>
                <p className="text-sm text-gray-500">Question {currentQuestionIndex + 1} of {allQuestions.length}</p>
              </div>
            </div>
            <div className="text-sm font-medium text-gray-600">
              {progress}% complete
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            {/* Section Context */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-4">
                {currentQuestion.sectionTitle}
              </div>
              <p className="text-gray-600">
                {currentQuestion.sectionDescription}
              </p>
            </div>

            {/* Question */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg p-8 mb-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              <QuestionComponent
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              />
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={isFirstQuestion}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                  isFirstQuestion
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={!isCurrentQuestionAnswered()}
                className={`flex items-center px-8 py-4 rounded-xl font-semibold transition-all ${
                  isCurrentQuestionAnswered()
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLastQuestion ? (
                  <>
                    Complete Discovery
                    <Check className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>

            {/* Encouragement */}
            {isCurrentQuestionAnswered() && (
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  Great! Your answer helps us understand you better.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionComponent({ 
  question, 
  value, 
  onChange 
}: { 
  question: QuizQuestion; 
  value: string | string[] | undefined; 
  onChange: (value: string | string[]) => void; 
}) {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        );

      case 'textarea':
        return (
          <textarea
            rows={4}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="" disabled>
              Choose an option...
            </option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label 
                key={option} 
                className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  value === option 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="mr-4 w-5 h-5 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label 
                key={option} 
                className={`flex items-center p-4 rounded-xl cursor-pointer transition-all border-2 ${
                  selectedValues.includes(option)
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option]);
                    } else {
                      onChange(selectedValues.filter((v: string) => v !== option));
                    }
                  }}
                  className="mr-4 w-5 h-5 text-blue-500 focus:ring-blue-500 rounded"
                />
                <span className="text-gray-700 font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {renderInput()}
    </div>
  );
}