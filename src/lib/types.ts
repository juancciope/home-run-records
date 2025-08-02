// Quiz-related types
export interface QuizAnswers {
  [key: string]: string | string[] | number | boolean;
}

// API response types
export interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string | null;
    };
  }>;
}

// Database types
export interface User {
  id: string;
  email: string;
  role: 'artist' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface QuizAnswersRecord {
  id: string;
  user_id: string;
  answers: QuizAnswers;
  created_at: string;
  updated_at: string;
}

export interface StrategyPlan {
  id: string;
  user_id: string;
  plan_text: string;
  created_at: string;
  updated_at: string;
}

// Component prop types
export interface QuestionComponentProps {
  question: {
    id: string;
    type: 'text' | 'textarea' | 'select' | 'multiselect' | 'radio';
    question: string;
    options?: string[];
    required: boolean;
    placeholder?: string;
  };
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
}

// Quiz progress type
export interface QuizProgress {
  completed: number;
  total: number;
  percentage: number;
}