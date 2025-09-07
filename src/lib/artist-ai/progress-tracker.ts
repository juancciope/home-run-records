// Shared progress tracking for artist AI analysis
// In production, this should use Redis or a database

export interface AnalysisStatus {
  progress: number;
  message: string;
  estimatedTime: number;
  complete: boolean;
  success?: boolean;
  error?: string;
  artistSlug?: string;
}

// In-memory storage for analysis progress
export const analysisProgress = new Map<string, AnalysisStatus>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  const oldEntries: string[] = [];
  
  analysisProgress.forEach((status, id) => {
    // Remove entries older than 30 minutes
    const timestamp = parseInt(id.split('-')[1] || '0');
    if (now - timestamp > 1800000) {
      oldEntries.push(id);
    }
  });
  
  oldEntries.forEach(id => analysisProgress.delete(id));
}, 600000);