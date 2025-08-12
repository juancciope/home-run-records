import { createClient } from '@/utils/supabase/client';

// Production Pipeline Types
export interface ProductionRecord {
  id?: string;
  user_id: string;
  record_type: 'unfinished' | 'finished' | 'released';
  title: string;
  artist_name?: string;
  description?: string;
  completion_percentage?: number;
  release_date?: string;
  platforms?: string[];
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// Marketing Reach Types
export interface MarketingRecord {
  id?: string;
  user_id: string;
  record_type: 'reach' | 'engaged' | 'followers';
  platform?: string;
  campaign_name?: string;
  reach_count?: number;
  engagement_count?: number;
  follower_count?: number;
  date_recorded?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// Fan Engagement Types
export interface FanEngagementRecord {
  id?: string;
  user_id: string;
  record_type: 'captured' | 'fans' | 'super_fans';
  contact_info?: {
    name?: string;
    email?: string;
    phone?: string;
    [key: string]: unknown;
  };
  engagement_level?: 'captured' | 'active' | 'super';
  source?: string;
  engagement_score?: number;
  last_interaction?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// Conversion Pipeline Types
export interface ConversionRecord {
  id?: string;
  user_id: string;
  record_type: 'leads' | 'opportunities' | 'sales';
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  deal_value?: number;
  probability?: number;
  stage?: string;
  source?: string;
  notes?: string;
  close_date?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// Agent Pipeline Types
export interface AgentRecord {
  id?: string;
  user_id: string;
  record_type: 'potential' | 'meeting_booked' | 'signed';
  agent_name: string;
  agency_name?: string;
  contact_email?: string;
  contact_phone?: string;
  specialization?: string[];
  meeting_date?: string;
  contract_terms?: string;
  commission_rate?: number;
  contract_value?: number;
  status?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export class PipelineService {
  // =================
  // PRODUCTION PIPELINE
  // =================

  static async addProductionRecord(record: Omit<ProductionRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ProductionRecord | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('production_records')
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error adding production record:', error);
      return null;
    }
  }

  static async getProductionRecords(userId: string): Promise<ProductionRecord[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('production_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching production records:', error);
      return [];
    }
  }

  static async getProductionMetrics(userId: string): Promise<{
    unfinished: number;
    finished: number;
    released: number;
  }> {
    try {
      const records = await this.getProductionRecords(userId);
      
      return {
        unfinished: records.filter(r => r.record_type === 'unfinished').length,
        finished: records.filter(r => r.record_type === 'finished').length,
        released: records.filter(r => r.record_type === 'released').length,
      };
    } catch (error) {
      console.error('Error calculating production metrics:', error);
      return { unfinished: 0, finished: 0, released: 0 };
    }
  }

  // =================
  // MARKETING REACH
  // =================

  static async addMarketingRecord(record: Omit<MarketingRecord, 'id' | 'created_at' | 'updated_at'>): Promise<MarketingRecord | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('marketing_records')
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error adding marketing record:', error);
      return null;
    }
  }

  static async getMarketingRecords(userId: string): Promise<MarketingRecord[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('marketing_records')
        .select('*')
        .eq('user_id', userId)
        .order('date_recorded', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching marketing records:', error);
      return [];
    }
  }

  static async getMarketingMetrics(userId: string): Promise<{
    totalReach: number;
    engagedAudience: number;
    totalFollowers: number;
  }> {
    try {
      const records = await this.getMarketingRecords(userId);
      
      return {
        totalReach: records
          .filter(r => r.record_type === 'reach')
          .reduce((sum, r) => sum + (r.reach_count || 0), 0),
        engagedAudience: records
          .filter(r => r.record_type === 'engaged')
          .reduce((sum, r) => sum + (r.engagement_count || 0), 0),
        totalFollowers: records
          .filter(r => r.record_type === 'followers')
          .reduce((sum, r) => sum + (r.follower_count || 0), 0),
      };
    } catch (error) {
      console.error('Error calculating marketing metrics:', error);
      return { totalReach: 0, engagedAudience: 0, totalFollowers: 0 };
    }
  }

  // =================
  // FAN ENGAGEMENT
  // =================

  static async addFanEngagementRecord(record: Omit<FanEngagementRecord, 'id' | 'created_at' | 'updated_at'>): Promise<FanEngagementRecord | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('fan_engagement_records')
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error adding fan engagement record:', error);
      return null;
    }
  }

  static async getFanEngagementRecords(userId: string): Promise<FanEngagementRecord[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('fan_engagement_records')
        .select('*')
        .eq('user_id', userId)
        .order('last_interaction', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching fan engagement records:', error);
      return [];
    }
  }

  static async getFanEngagementMetrics(userId: string): Promise<{
    capturedData: number;
    fans: number;
    superFans: number;
  }> {
    try {
      const records = await this.getFanEngagementRecords(userId);
      
      return {
        capturedData: records.filter(r => r.engagement_level === 'captured').length,
        fans: records.filter(r => r.engagement_level === 'active').length,
        superFans: records.filter(r => r.engagement_level === 'super').length,
      };
    } catch (error) {
      console.error('Error calculating fan engagement metrics:', error);
      return { capturedData: 0, fans: 0, superFans: 0 };
    }
  }

  // =================
  // CONVERSION PIPELINE
  // =================

  static async addConversionRecord(record: Omit<ConversionRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ConversionRecord | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('conversion_records')
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error adding conversion record:', error);
      return null;
    }
  }

  static async getConversionRecords(userId: string): Promise<ConversionRecord[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('conversion_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching conversion records:', error);
      return [];
    }
  }

  static async getConversionMetrics(userId: string): Promise<{
    leads: number;
    opportunities: number;
    sales: number;
    revenue: number;
  }> {
    try {
      const records = await this.getConversionRecords(userId);
      
      return {
        leads: records.filter(r => r.record_type === 'leads').length,
        opportunities: records.filter(r => r.record_type === 'opportunities').length,
        sales: records.filter(r => r.record_type === 'sales').length,
        revenue: records
          .filter(r => r.record_type === 'sales')
          .reduce((sum, r) => sum + (r.deal_value || 0), 0),
      };
    } catch (error) {
      console.error('Error calculating conversion metrics:', error);
      return { leads: 0, opportunities: 0, sales: 0, revenue: 0 };
    }
  }

  // =================
  // AGENT PIPELINE
  // =================

  static async addAgentRecord(record: Omit<AgentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<AgentRecord | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('agent_records')
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error adding agent record:', error);
      return null;
    }
  }

  static async getAgentRecords(userId: string): Promise<AgentRecord[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('agent_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching agent records:', error);
      return [];
    }
  }

  static async getAgentMetrics(userId: string): Promise<{
    potentialAgents: number;
    meetingsBooked: number;
    agentsSigned: number;
  }> {
    try {
      const records = await this.getAgentRecords(userId);
      
      return {
        potentialAgents: records.filter(r => r.record_type === 'potential').length,
        meetingsBooked: records.filter(r => r.record_type === 'meeting_booked').length,
        agentsSigned: records.filter(r => r.record_type === 'signed').length,
      };
    } catch (error) {
      console.error('Error calculating agent metrics:', error);
      return { potentialAgents: 0, meetingsBooked: 0, agentsSigned: 0 };
    }
  }

  // =================
  // BATCH OPERATIONS
  // =================

  static async batchImportCSV(
    userId: string,
    csvData: string,
    type: 'production' | 'marketing' | 'fan_engagement' | 'conversion' | 'agent'
  ): Promise<{ success: number; errors: string[] }> {
    try {
      const lines = csvData.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      const results = { success: 0, errors: [] as string[] };

      for (let i = 1; i < lines.length; i++) {
        try {
          const values = lines[i].split(',').map(v => v.trim());
          const record: Record<string, unknown> = { user_id: userId };
          
          headers.forEach((header, index) => {
            if (values[index]) {
              record[header] = values[index];
            }
          });

          // Add records based on type
          let result = null;
          switch (type) {
            case 'production':
              result = await this.addProductionRecord(record as any);
              break;
            case 'marketing':
              result = await this.addMarketingRecord(record as any);
              break;
            case 'fan_engagement':
              result = await this.addFanEngagementRecord(record as any);
              break;
            case 'conversion':
              result = await this.addConversionRecord(record as any);
              break;
            case 'agent':
              result = await this.addAgentRecord(record as any);
              break;
          }

          if (result) {
            results.success++;
          } else {
            results.errors.push(`Row ${i + 1}: Failed to import record`);
          }
        } catch (error) {
          results.errors.push(`Row ${i + 1}: ${error}`);
        }
      }

      return results;
    } catch (error) {
      console.error('Error batch importing CSV:', error);
      return { success: 0, errors: [`Failed to process CSV: ${error}`] };
    }
  }

  // =================
  // AGGREGATE METRICS
  // =================

  static async getAllPipelineMetrics(userId: string) {
    try {
      const [production, marketing, fanEngagement, conversion, agent] = await Promise.all([
        this.getProductionMetrics(userId),
        this.getMarketingMetrics(userId),
        this.getFanEngagementMetrics(userId),
        this.getConversionMetrics(userId),
        this.getAgentMetrics(userId),
      ]);

      return {
        production,
        marketing,
        fanEngagement,
        conversion,
        agent,
      };
    } catch (error) {
      console.error('Error fetching all pipeline metrics:', error);
      return null;
    }
  }
}