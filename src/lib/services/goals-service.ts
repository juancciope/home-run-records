import { createAuthenticatedClient } from '@/utils/supabase/client';

// Separate, simplified goals service
export interface Goal {
  id?: string;
  user_id: string;
  section: 'production' | 'marketing' | 'fan_engagement' | 'conversion' | 'agent';
  record_type: string;
  goal_type: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  target_date?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export class GoalsService {
  private static async getSupabaseClient() {
    // Use the SAME authentication method as working track saving
    return await createAuthenticatedClient();
  }

  static async addGoal(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<Goal | null> {
    try {
      console.log('🎯 [GOALS-SERVICE] Adding goal (USING SAME AUTH AS TRACKS):', { goal, timestamp: new Date().toISOString() });
      
      // Use EXACT same pattern as working addProductionRecord
      const supabase = await this.getSupabaseClient();
      
      const { data, error } = await supabase
        .from('goals')
        .insert(goal)
        .select()
        .single();

      if (error) {
        console.error('❌ [GOALS-SERVICE] Supabase error:', error);
        throw error;
      }
      
      console.log('✅ [GOALS-SERVICE] Goal added successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ [GOALS-SERVICE] Error adding goal:', error);
      return null;
    }
  }

  static async getGoals(userId: string, section?: string, recordType?: string): Promise<Goal[]> {
    try {
      console.log('📋 [GOALS-SERVICE] Fetching goals:', { userId, section, recordType });
      
      const supabase = await this.getSupabaseClient();
      
      // Get current session directly
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('❌ [GOALS-SERVICE] No valid session for fetch:', sessionError);
        throw new Error('User must be authenticated to fetch goals');
      }
      
      // Verify the requested userId matches the authenticated user
      if (userId !== session.user.id) {
        console.error('❌ [GOALS-SERVICE] User ID mismatch for fetch:', { 
          requestedUserId: userId, 
          sessionUserId: session.user.id 
        });
        return [];
      }
      
      let query = supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId) // Explicit filter for performance
        .order('created_at', { ascending: false });

      if (section) {
        query = query.eq('section', section);
      }
      if (recordType) {
        query = query.eq('record_type', recordType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [GOALS-SERVICE] Supabase error fetching goals:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          queryParams: { userId, section, recordType }
        });
        throw error;
      }
      
      console.log('✅ [GOALS-SERVICE] Goals fetched successfully:', { count: data?.length || 0 });
      return data || [];
    } catch (error) {
      console.error('❌ [GOALS-SERVICE] Error fetching goals:', error);
      return [];
    }
  }

  static async updateGoal(goalId: string, updates: Partial<Goal>): Promise<Goal | null> {
    try {
      const supabase = await this.getSupabaseClient();
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('User must be authenticated to update goals');
      }
      
      const { data, error } = await supabase
        .from('goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', goalId)
        .eq('user_id', session.user.id) // Additional security filter
        .select()
        .single();

      if (error) {
        console.error('❌ [GOALS-SERVICE] Error updating goal:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('❌ [GOALS-SERVICE] Error updating goal:', error);
      return null;
    }
  }

  static async deleteGoal(goalId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabaseClient();
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('User must be authenticated to delete goals');
      }
      
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', session.user.id); // Additional security filter

      if (error) {
        console.error('❌ [GOALS-SERVICE] Error deleting goal:', error);
        throw error;
      }
      return true;
    } catch (error) {
      console.error('❌ [GOALS-SERVICE] Error deleting goal:', error);
      return false;
    }
  }

  static async getActiveGoalsForCard(userId: string, section: string, recordType: string): Promise<Goal[]> {
    try {
      const goals = await this.getGoals(userId, section, recordType);
      return goals.filter(goal => goal.status === 'active');
    } catch (error) {
      console.error('❌ [GOALS-SERVICE] Error fetching active goals for card:', error);
      return [];
    }
  }
}