'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { quizSections, QuizSection, QuizQuestion } from '@/lib/quizQuestions';
import { getQuizProgress } from '@/utils/formatQuizForAI';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function QuizPage() {
  const router = useRouter();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isComplete, setIsComplete] = useState(false);

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

  const currentSection = quizSections[currentSectionIndex];
  const isLastSection = currentSectionIndex === quizSections.length - 1;
  const isFirstSection = currentSectionIndex === 0;

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (isLastSection) {
      if (isComplete) {
        router.push('/signup');
      }
    } else {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstSection) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  const getSectionProgress = (section: QuizSection) => {
    const sectionQuestions = section.questions;
    const answeredQuestions = sectionQuestions.filter(q => {
      const answer = answers[q.id];
      return answer !== undefined && answer !== null && answer !== '' && !(Array.isArray(answer) && answer.length === 0);
    });
    return {
      answered: answeredQuestions.length,
      total: sectionQuestions.length,
      percentage: Math.round((answeredQuestions.length / sectionQuestions.length) * 100)
    };
  };

  const overallProgress = getQuizProgress(answers);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">Artist Brand Discovery</h1>
          <p className="text-xl text-gray-300">Help us understand your unique artistic journey</p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-medium">Overall Progress</span>
            <span className="text-white font-medium">{overallProgress.percentage}% Complete</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress.percentage}%` }}
            />
          </div>
        </div>

        {/* Section Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-4 gap-4">
            {quizSections.map((section, index) => {
              const sectionProgress = getSectionProgress(section);
              const isCurrentSection = index === currentSectionIndex;
              const isCompleted = sectionProgress.percentage === 100;
              const isAccessible = index <= currentSectionIndex;

              return (
                <button
                  key={section.id}
                  onClick={() => isAccessible && setCurrentSectionIndex(index)}
                  disabled={!isAccessible}
                  className={`p-4 rounded-lg text-left transition-all ${
                    isCurrentSection
                      ? 'bg-white/20 border-2 border-pink-400'
                      : isCompleted
                      ? 'bg-green-500/20 border-2 border-green-400'
                      : isAccessible
                      ? 'bg-white/10 border-2 border-transparent hover:bg-white/15'
                      : 'bg-white/5 border-2 border-transparent opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium text-sm">{section.title}</h3>
                    {isCompleted && <Check className="w-4 h-4 text-green-400" />}
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${sectionProgress.percentage}%` }}
                    />
                  </div>
                  <span className="text-gray-300 text-xs">{sectionProgress.answered}/{sectionProgress.total}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quiz Content */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">{currentSection.title}</h2>
              <p className="text-gray-300">{currentSection.description}</p>
            </div>

            <div className="space-y-8">
              {currentSection.questions.map((question) => (
                <QuestionComponent
                  key={question.id}
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => handleAnswerChange(question.id, value)}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/20">
              <button
                onClick={handlePrevious}
                disabled={isFirstSection}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                  isFirstSection
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </button>

              <span className="text-white font-medium">
                Section {currentSectionIndex + 1} of {quizSections.length}
              </span>

              <button
                onClick={handleNext}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
              >
                {isLastSection ? (
                  isComplete ? (
                    <>
                      Complete Quiz
                      <Check className="w-5 h-5 ml-2" />
                    </>
                  ) : (
                    <>
                      Finish Later
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </>
                  )
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>
            </div>
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
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        );

      case 'textarea':
        return (
          <textarea
            rows={4}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="" disabled className="text-gray-900">
              Select an option...
            </option>
            {question.options?.map((option) => (
              <option key={option} value={option} className="text-gray-900">
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  className="mr-3 w-4 h-4 text-pink-500 focus:ring-pink-500 focus:ring-2"
                />
                <span className="text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center cursor-pointer">
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
                  className="mr-3 w-4 h-4 text-pink-500 focus:ring-pink-500 focus:ring-2"
                />
                <span className="text-white">{option}</span>
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
      <label className="block text-white font-medium mb-3">
        {question.question}
        {question.required && <span className="text-pink-400 ml-1">*</span>}
      </label>
      {renderInput()}
    </div>
  );
}