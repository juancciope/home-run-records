import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, count, operation = 'add' } = body;

    if (!userId || !type || count === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, type, count' 
      }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`📈 ${operation === 'add' ? 'Adding' : 'Setting'} ${count} to ${type} for user:`, userId);

    // Map upload types to database columns
    const columnMapping: { [key: string]: string } = {
      'production.unfinished': 'user_production_unfinished',
      'production.finished': 'user_production_finished', 
      'production.released': 'user_production_released',
      'fanEngagement.capturedData': 'user_fan_engagement',
      'fanEngagement.fans': 'user_fans',
      'fanEngagement.superFans': 'user_super_fans',
      'conversion.leads': 'user_conversion_leads',
      'conversion.opportunities': 'user_conversion_opportunities',
      'conversion.sales': 'user_conversion_sales',
      'conversion.revenue': 'user_conversion_revenue'
    };

    const column = columnMapping[type];
    if (!column) {
      return NextResponse.json({ 
        error: `Invalid type: ${type}. Valid types: ${Object.keys(columnMapping).join(', ')}` 
      }, { status: 400 });
    }

    // Ensure user has a metrics record
    const { data: existing } = await supabase
      .from('user_dashboard_metrics')
      .select('user_id, ' + column)
      .eq('user_id', userId)
      .single();

    if (!existing) {
      // Create new record if doesn't exist
      const { error: insertError } = await supabase
        .from('user_dashboard_metrics')
        .insert([{ user_id: userId, [column]: count }]);

      if (insertError) {
        console.error('Error creating metrics record:', insertError);
        return NextResponse.json({ error: 'Failed to create metrics record' }, { status: 500 });
      }

      console.log(`✅ Created new metrics record with ${type}: ${count}`);
    } else {
      // Update existing record
      const currentValue = (existing as any)[column] || 0;
      const newValue = operation === 'add' ? currentValue + count : count;

      const { error: updateError } = await supabase
        .from('user_dashboard_metrics')
        .update({ 
          [column]: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating metrics:', updateError);
        return NextResponse.json({ error: 'Failed to update metrics' }, { status: 500 });
      }

      console.log(`✅ Updated ${type}: ${currentValue} → ${newValue} (${operation === 'add' ? `+${count}` : `set to ${count}`})`);
    }

    // Get updated metrics to return
    const { data: updatedMetrics, error: fetchError } = await supabase
      .from('user_dashboard_metrics')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated metrics:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch updated metrics' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully ${operation === 'add' ? 'added' : 'set'} ${count} to ${type}`,
      data: {
        type,
        previousValue: operation === 'add' ? (existing?.[column] || 0) : null,
        newValue: updatedMetrics[column],
        operation,
        timestamp: updatedMetrics.updated_at
      }
    });

  } catch (error) {
    console.error('❌ Error processing upload:', error);
    return NextResponse.json({ 
      error: 'Failed to process upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to validate upload types
export async function GET() {
  const validTypes = [
    'production.unfinished',
    'production.finished', 
    'production.released',
    'fanEngagement.capturedData',
    'fanEngagement.fans',
    'fanEngagement.superFans',
    'conversion.leads',
    'conversion.opportunities',
    'conversion.sales',
    'conversion.revenue'
  ];

  return NextResponse.json({
    validTypes,
    examples: {
      'Upload 10 finished tracks': {
        userId: 'user-uuid',
        type: 'production.finished',
        count: 10,
        operation: 'add'
      },
      'Upload CSV with 50 fan emails': {
        userId: 'user-uuid', 
        type: 'fanEngagement.capturedData',
        count: 50,
        operation: 'add'
      },
      'Set total leads to 25': {
        userId: 'user-uuid',
        type: 'conversion.leads', 
        count: 25,
        operation: 'set'
      }
    }
  });
}