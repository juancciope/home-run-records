import { createClient, createAuthenticatedClient } from '@/utils/supabase/client';

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

// Goal Types - moved to /src/lib/services/goals-service.ts

export class PipelineService {
  // =================
  // PRODUCTION PIPELINE
  // =================

  static async addProductionRecord(record: Omit<ProductionRecord, 'id' | 'created_at' | 'updated_at'>): Promise<ProductionRecord | null> {
    try {
      const supabase = await createAuthenticatedClient();
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
      const supabase = await createAuthenticatedClient();
      const { data, error } = await supabase
        .from('production_records')
        .select('*')
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
      const supabase = await createAuthenticatedClient();
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
      const supabase = await createAuthenticatedClient();
      const { data, error } = await supabase
        .from('marketing_records')
        .select('*')
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
      const supabase = await createAuthenticatedClient();
      
      // Map record_type to correct engagement_level
      let mappedEngagementLevel = record.engagement_level;
      if (!mappedEngagementLevel && record.record_type) {
        switch (record.record_type) {
          case 'captured':
            mappedEngagementLevel = 'captured';
            break;
          case 'fans':
            mappedEngagementLevel = 'active';
            break;
          case 'super_fans':
            mappedEngagementLevel = 'super';
            break;
          default:
            mappedEngagementLevel = 'captured';
        }
      }

      // Ensure record has required fields and valid values
      const cleanRecord = {
        user_id: record.user_id,
        record_type: record.record_type || 'fans',
        contact_info: record.contact_info || {},
        engagement_level: mappedEngagementLevel || 'captured',
        source: record.source || 'manual',
        engagement_score: record.engagement_score || 0,
        last_interaction: record.last_interaction,
        metadata: record.metadata || {}
      };
      
      const { data, error } = await supabase
        .from('fan_engagement_records')
        .insert(cleanRecord)
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding fan engagement record:', error);
        console.error('Record that failed:', cleanRecord);
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
      const supabase = await createAuthenticatedClient();
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
      const supabase = await createAuthenticatedClient();
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
      const supabase = await createAuthenticatedClient();
      const { data, error } = await supabase
        .from('conversion_records')
        .select('*')
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
      const supabase = await createAuthenticatedClient();
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
      const supabase = await createAuthenticatedClient();
      const { data, error } = await supabase
        .from('agent_records')
        .select('*')
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
  // GOALS MANAGEMENT - MOVED TO SEPARATE GoalsService
  // =================
  // All goals functionality has been moved to /src/lib/services/goals-service.ts

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

  // =================
  // CSV TEMPLATES
  // =================

  static getCSVTemplate(type: 'production' | 'marketing' | 'fan_engagement' | 'conversion' | 'agent'): string {
    const templates = {
      production: [
        'record_type,title,artist_name,description,completion_percentage,release_date,platforms',
        'unfinished,My New Song,Artist Name,Work in progress track,75,2024-12-01,"spotify;apple_music;youtube"',
        'finished,Completed Track,Artist Name,Ready for release,100,2024-11-15,"spotify;apple_music"',
        'released,Live Song,Artist Name,Already published,100,2024-10-01,"spotify;apple_music;youtube;soundcloud"'
      ],
      marketing: [
        'record_type,platform,campaign_name,reach_count,engagement_count,follower_count,date_recorded',
        'reach,instagram,Summer Campaign,15000,0,0,2024-11-01',
        'engaged,facebook,Holiday Promotion,0,2500,0,2024-11-05',
        'followers,spotify,Monthly Growth,0,0,1200,2024-11-10'
      ],
      fan_engagement: [
        'record_type,contact_name,contact_email,phone,city,state,country,engagement_level,source,joined_on,rsvp_frequency,presaved',
        'imported_fans,John Doe,john@example.com,555-1234,Nashville,Tennessee,United States,captured,laylo,2024-11-01,0,FALSE',
        'imported_fans,Jane Smith,jane@example.com,555-5678,Los Angeles,California,United States,active,email_list,2024-10-15,2,TRUE',
        'imported_fans,Bob Johnson,bob@example.com,,Austin,Texas,United States,captured,social_media,2024-09-20,1,FALSE'
      ],
      conversion: [
        'record_type,contact_name,contact_email,contact_phone,deal_value,probability,stage,source,notes,close_date',
        'leads,Mike Wilson,mike@example.com,555-9999,0,25,Initial Contact,website,Interested in booking,2024-12-01',
        'opportunities,Sarah Davis,sarah@example.com,555-7777,5000,75,Negotiation,referral,Wedding gig discussion,2024-11-20',
        'sales,Tom Brown,tom@example.com,555-4444,3000,100,Closed Won,social_media,Concert booking confirmed,2024-10-30'
      ],
      agent: [
        'record_type,agent_name,agency_name,contact_email,contact_phone,specialization,meeting_date,commission_rate,contract_value,status,notes',
        'potential,Alex Johnson,Music Agency Pro,alex@musicagency.com,555-1111,"booking;promotion",2024-12-05,15,0,Initial Contact,Interested in representation',
        'meeting_booked,Maria Garcia,Star Talent,maria@startalent.com,555-2222,"booking;marketing;distribution",2024-11-25,20,0,Meeting Scheduled,Contract discussion planned',
        'signed,David Lee,Elite Artists,david@eliteartists.com,555-3333,"full_service",2024-10-15,25,50000,Active,2-year contract signed'
      ]
    };

    return templates[type].join('\n');
  }

  // =================
  // BATCH OPERATIONS
  // =================

  // Auto-detect CSV data type based on headers
  private static detectCSVType(headerLine: string): 'production' | 'marketing' | 'fan_engagement' | 'conversion' | 'agent' | null {
    // Fan engagement indicators
    if (headerLine.includes('contact_name') || 
        headerLine.includes('contact_email') ||
        headerLine.includes('engagement_level') ||
        headerLine.includes('city') ||
        headerLine.includes('state') ||
        headerLine.includes('country') ||
        headerLine.includes('phone') ||
        headerLine.includes('presaved') ||
        headerLine.includes('rsvp_frequency')) {
      return 'fan_engagement';
    }
    
    // Production indicators
    if (headerLine.includes('title') && 
        (headerLine.includes('completion_percentage') || 
         headerLine.includes('artist_name') ||
         headerLine.includes('release_date'))) {
      return 'production';
    }
    
    // Marketing indicators  
    if (headerLine.includes('platform') &&
        (headerLine.includes('reach_count') ||
         headerLine.includes('engagement_count') ||
         headerLine.includes('follower_count'))) {
      return 'marketing';
    }
    
    // Conversion indicators
    if (headerLine.includes('deal_value') ||
        headerLine.includes('probability') ||
        headerLine.includes('close_date')) {
      return 'conversion';
    }
    
    // Agent indicators
    if (headerLine.includes('agent_name') ||
        headerLine.includes('agency_name') ||
        headerLine.includes('commission_rate') ||
        headerLine.includes('contract_terms')) {
      return 'agent';
    }
    
    return null;
  }

  static async batchImportCSV(
    userId: string,
    csvData: string,
    type: 'production' | 'marketing' | 'fan_engagement' | 'conversion' | 'agent'
  ): Promise<{ success: number; errors: string[] }> {
    try {
      const lines = csvData.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        return { success: 0, errors: ['CSV must contain headers and at least one data row'] };
      }
      
      // Auto-detect data type based on CSV headers
      const headerLine = lines[0].toLowerCase();
      const detectedType = this.detectCSVType(headerLine);
      if (detectedType && detectedType !== type) {
        console.log(`Auto-detected CSV type: ${detectedType} (was ${type})`);
        type = detectedType;
      }
      console.log(`Final processing type: ${type} for headers: ${headerLine}`);
      
      // Parse CSV properly handling quoted fields
      const parseCSVLine = (line: string): string[] => {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          const nextChar = line[i + 1];
          
          if (char === '"' && inQuotes && nextChar === '"') {
            current += '"';
            i++; // Skip next quote
          } else if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };
      
      const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, ''));
      const results = { success: 0, errors: [] as string[] };
      
      for (let i = 1; i < lines.length; i++) {
        try {
          const values = parseCSVLine(lines[i]);
          let record: any = { user_id: userId };
          
          // Map CSV values to record fields
          headers.forEach((header, index) => {
            const value = values[index] || '';
            
            // Handle numeric fields
            if (['completion_percentage', 'reach_count', 'engagement_count', 'follower_count', 
                 'engagement_score', 'deal_value', 'probability', 'commission_rate', 'contract_value'].includes(header)) {
              record[header] = value ? parseFloat(value) : 0;
            }
            // Handle array fields
            else if (header === 'specialization') {
              record[header] = value ? value.split(';').map(s => s.trim()) : [];
            }
            // Handle JSON fields
            else if (header === 'platforms') {
              try {
                record[header] = value ? JSON.parse(value) : [];
              } catch {
                record[header] = value ? value.split(';').map(p => p.trim()) : [];
              }
            }
            // Handle contact_info for fan engagement (flexible field mapping)
            else if ((header === 'contact_name' || header === 'name') && type === 'fan_engagement') {
              record.contact_info = { ...(record.contact_info || {}), name: value };
            }
            else if ((header === 'contact_email' || header === 'email') && type === 'fan_engagement') {
              record.contact_info = { ...(record.contact_info || {}), email: value };
            }
            else if ((header === 'phone' || header === 'contact_phone') && type === 'fan_engagement') {
              record.contact_info = { ...(record.contact_info || {}), phone: value };
            }
            else if (header === 'city' && type === 'fan_engagement') {
              record.contact_info = { ...(record.contact_info || {}), city: value };
            }
            else if (header === 'state' && type === 'fan_engagement') {
              record.contact_info = { ...(record.contact_info || {}), state: value };
            }
            else if (header === 'country' && type === 'fan_engagement') {
              record.contact_info = { ...(record.contact_info || {}), country: value };
            }
            else if (header === 'messenger' && type === 'fan_engagement') {
              record.contact_info = { ...(record.contact_info || {}), messenger: value };
            }
            // Handle fan engagement specific fields
            else if (header === 'joined_on' && type === 'fan_engagement') {
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                record.last_interaction = date.toISOString().split('T')[0];
              }
            }
            else if (header === 'rsvp_frequency' && type === 'fan_engagement') {
              record.engagement_score = value ? parseInt(value) : 0;
            }
            else if (header === 'presaved' && type === 'fan_engagement') {
              record.metadata = { ...(record.metadata || {}), presaved: value.toLowerCase() === 'true' };
            }
            else if (header === 'source' && type === 'fan_engagement') {
              record.source = value || 'imported';
            }
            // Handle engagement_level for fan engagement (map to valid constraint values)
            else if (header === 'engagement_level' && type === 'fan_engagement') {
              // Map common values to valid constraint values
              const lowerValue = value.toLowerCase();
              if (lowerValue.includes('super') || lowerValue.includes('high')) {
                record.engagement_level = 'super';
              } else if (lowerValue.includes('active') || lowerValue.includes('engaged')) {
                record.engagement_level = 'active';
              } else if (lowerValue.includes('imported') || lowerValue.includes('captured')) {
                record.engagement_level = 'captured'; // imported fans default to captured status
              } else {
                record.engagement_level = 'captured'; // default
              }
            }
            // Handle date fields
            else if (header.includes('date') && value) {
              // Try to parse date
              const date = new Date(value);
              if (!isNaN(date.getTime())) {
                record[header] = header === 'meeting_date' ? date.toISOString() : value;
              } else {
                record[header] = value;
              }
            }
            // Default string handling
            else {
              record[header] = value;
            }
          });
          
          // Set default values for fan engagement records
          if (type === 'fan_engagement') {
            // Determine engagement_level from multiple sources (CSV column or record_type)
            let mappedEngagementLevel = record.engagement_level;
            console.log(`CSV Processing row ${i + 1}: record_type=${record.record_type}, original engagement_level=${record.engagement_level}`);
            
            // If no engagement_level, try to map from record_type
            if (!mappedEngagementLevel && record.record_type) {
              switch (record.record_type) {
                case 'captured':
                  mappedEngagementLevel = 'captured';
                  break;
                case 'fans':
                case 'imported_fans':
                  mappedEngagementLevel = 'active';
                  break;
                case 'super_fans':
                  mappedEngagementLevel = 'super';
                  break;
                default:
                  mappedEngagementLevel = 'captured';
              }
              console.log(`Mapped record_type ${record.record_type} to engagement_level ${mappedEngagementLevel}`);
            }
            
            // If still no engagement_level, default to 'captured'
            if (!mappedEngagementLevel) {
              mappedEngagementLevel = 'captured';
              console.log(`No engagement_level found, defaulting to 'captured'`);
            }

            // For imported fans from external sources like Laylo, default record_type should be 'fans'
            let finalRecordType = record.record_type;
            if (record.record_type === 'imported_fans' || !record.record_type) {
              finalRecordType = 'fans';
            }

            // Ensure we only pass valid fields for fan engagement
            const fanRecord: any = {
              user_id: userId,
              record_type: finalRecordType,
              engagement_level: mappedEngagementLevel,
              source: record.source || 'csv_import',
              contact_info: record.contact_info || {},
              engagement_score: record.engagement_score || 0,
              metadata: record.metadata || {}
            };
            console.log(`Final fanRecord for DB (record_type: ${finalRecordType}, engagement_level: ${mappedEngagementLevel}):`, fanRecord);
            
            // Only add last_interaction if it's a valid date
            if (record.last_interaction) {
              fanRecord.last_interaction = record.last_interaction;
            }
            
            record = fanRecord;
          }

          // Add the record using the appropriate service method
          let result = null;
          switch (type) {
            case 'production':
              result = await this.addProductionRecord(record);
              break;
            case 'marketing':
              result = await this.addMarketingRecord(record);
              break;
            case 'fan_engagement':
              result = await this.addFanEngagementRecord(record);
              break;
            case 'conversion':
              result = await this.addConversionRecord(record);
              break;
            case 'agent':
              result = await this.addAgentRecord(record);
              break;
          }
          
          if (result) {
            results.success++;
          } else {
            results.errors.push(`Row ${i + 1}: Failed to insert record`);
          }
        } catch (error) {
          results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error in batch CSV import:', error);
      return { success: 0, errors: [error instanceof Error ? error.message : 'Unknown error'] };
    }
  }
}