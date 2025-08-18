import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all production records for the user
    const { data: records, error } = await supabase
      .from('production_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching production records:', error);
      return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
    }

    // Group records by status
    const grouped = {
      unfinished: records?.filter(r => r.record_type === 'unfinished') || [],
      finished: records?.filter(r => r.record_type === 'finished') || [],
      released: records?.filter(r => r.record_type === 'released') || []
    };

    return NextResponse.json({
      success: true,
      data: grouped,
      total: records?.length || 0
    });

  } catch (error) {
    console.error('Error in production API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recordId, newStatus, updates } = await request.json();

    if (!recordId) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    let updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Handle status update (drag and drop)
    if (newStatus) {
      if (!['unfinished', 'finished', 'released'].includes(newStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.record_type = newStatus;
    }

    // Handle general record updates (edit modal)
    if (updates) {
      if (updates.title) updateData.title = updates.title;
      if (updates.artist_name !== undefined) updateData.artist_name = updates.artist_name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.completion_percentage !== undefined) updateData.completion_percentage = updates.completion_percentage;
      if (updates.release_date !== undefined) updateData.release_date = updates.release_date;
      if (updates.platforms !== undefined) updateData.platforms = updates.platforms;
    }

    // Update the record
    const { data, error } = await supabase
      .from('production_records')
      .update(updateData)
      .eq('id', recordId)
      .eq('user_id', user.id) // Ensure user owns the record
      .select()
      .single();

    if (error) {
      console.error('Error updating record:', error);
      return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error updating production record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recordId } = await request.json();

    if (!recordId) {
      return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
    }

    // Delete the record (ensure user owns it)
    const { error } = await supabase
      .from('production_records')
      .delete()
      .eq('id', recordId)
      .eq('user_id', user.id); // Ensure user owns the record

    if (error) {
      console.error('Error deleting record:', error);
      return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting production record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}