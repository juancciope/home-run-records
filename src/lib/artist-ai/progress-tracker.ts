// Shared progress tracking for artist AI analysis using Supabase
// Replaces in-memory Map to work in serverless environments

import { createClient } from '@supabase/supabase-js';

export interface AnalysisStatus {
  progress: number;
  message: string;
  estimatedTime: number;
  complete: boolean;
  success?: boolean;
  error?: string;
  artistSlug?: string;
}

// Initialize Supabase client for progress tracking
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Progress tracking operations using Supabase
export const analysisProgress = {
  async set(id: string, status: AnalysisStatus) {
    const { error } = await supabase
      .from('analysis_progress')
      .upsert({
        id,
        progress: status.progress,
        message: status.message,
        estimated_time: status.estimatedTime,
        complete: status.complete,
        success: status.success,
        error: status.error,
        artist_slug: status.artistSlug,
      });

    if (error) {
      console.error('❌ Error setting analysis progress:', error);
    } else {
      console.log(`✅ Progress saved to DB: ${id} - ${status.progress}% - ${status.message}`);
    }
  },

  async get(id: string): Promise<AnalysisStatus | null> {
    const { data, error } = await supabase
      .from('analysis_progress')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      progress: data.progress,
      message: data.message,
      estimatedTime: data.estimated_time,
      complete: data.complete,
      success: data.success,
      error: data.error,
      artistSlug: data.artist_slug,
    };
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('analysis_progress')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting analysis progress:', error);
    } else {
      console.log(`🧹 Deleted progress entry: ${id}`);
    }
  },

  // Get all progress IDs for debugging
  async keys(): Promise<string[]> {
    const { data, error } = await supabase
      .from('analysis_progress')
      .select('id');

    if (error || !data) {
      return [];
    }

    return data.map(row => row.id);
  }
};

// Clean up old entries periodically via API endpoint or cron
export async function cleanupOldProgress() {
  const { data, error } = await supabase
    .rpc('cleanup_old_analysis_progress');

  if (error) {
    console.error('❌ Error cleaning up old progress:', error);
  } else {
    console.log(`🧹 Cleaned up ${data} old progress entries`);
  }

  return data;
}