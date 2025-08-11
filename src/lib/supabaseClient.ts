import { createClient } from '@supabase/supabase-js';
import { QuizAnswers } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDI0NTI5MjEsImV4cCI6MTk1ODAyODkyMX0.placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
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

// Auth helpers
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  console.log('🔑 === STARTING getCurrentUser function ===');
  try {
    console.log('🔑 Step 1: Calling supabase.auth.getUser()');
    const { data: { user }, error } = await supabase.auth.getUser();
    
    console.log('🔑 Step 2: getUser result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: error ? {
        message: error.message,
        name: error.name
      } : null
    });
    
    if (error) {
      console.error('💥 getCurrentUser error:', error);
      throw error;
    }
    
    console.log('🔑 === COMPLETED getCurrentUser function ===');
    return user;
  } catch (error) {
    console.error('💥 FATAL ERROR in getCurrentUser:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw error;
  }
};

// Database helpers
export const saveQuizAnswers = async (userId: string, answers: QuizAnswers) => {
  const { data, error } = await supabase
    .from('quiz_answers')
    .upsert({ user_id: userId, answers }, { onConflict: 'user_id' })
    .select()
    .single();
  
  return { data, error };
};

export const getQuizAnswers = async (userId: string) => {
  const { data, error } = await supabase
    .from('quiz_answers')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
};

export const saveStrategyPlan = async (userId: string, planText: string) => {
  const { data, error } = await supabase
    .from('strategy_plans')
    .upsert({ user_id: userId, plan_text: planText }, { onConflict: 'user_id' })
    .select()
    .single();
  
  return { data, error };
};

export const getStrategyPlan = async (userId: string) => {
  const { data, error } = await supabase
    .from('strategy_plans')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return { data, error };
};

export const getAllUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      quiz_answers(*),
      strategy_plans(*)
    `)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const updateUserRole = async (userId: string, role: 'artist' | 'admin') => {
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();
  
  return { data, error };
};