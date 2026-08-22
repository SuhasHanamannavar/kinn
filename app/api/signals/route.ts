import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/supabase/server';
import { checkSupabaseConnection, localDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get('category');
    const importance = request.nextUrl.searchParams.get('importance');
    const search = request.nextUrl.searchParams.get('search');

    const isDbConnected = await checkSupabaseConnection();

    if (!isDbConnected) {
      let signals = localDb.getSignals();
      if (category && category !== 'all') {
        signals = signals.filter((s: any) => s.category === category);
      }
      if (importance && importance !== 'all') {
        signals = signals.filter((s: any) => s.importance === importance);
      }
      if (search) {
        signals = signals.filter((s: any) => s.title.toLowerCase().includes(search.toLowerCase()));
      }
      return NextResponse.json({
        success: true,
        signals,
        unreadCount: signals.filter((s: any) => !s.read).length,
        fallback: true,
      });
    }

    const serviceClient = createServiceClient();
    let query = serviceClient
      .from('signals')
      .select('*')
      .order('detected_at', { ascending: false })
      .limit(50);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }
    if (importance && importance !== 'all') {
      query = query.eq('importance', importance);
    }
    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      signals: data || [],
      unreadCount: (data || []).filter((s: any) => !s.read).length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    const isDbConnected = await checkSupabaseConnection();

    if (!isDbConnected) {
      const signals = localDb.getSignals();
      const signalIdx = signals.findIndex((s: any) => s.id === id);
      if (signalIdx !== -1) {
        signals[signalIdx].read = !!read;
        localDb.saveSignals(signals);
        return NextResponse.json({ success: true, signal: signals[signalIdx], fallback: true });
      }
      return NextResponse.json({ success: false, error: 'Signal not found' }, { status: 404 });
    }

    const serviceClient = createServiceClient();
    const { data, error } = await serviceClient
      .from('signals')
      .update({ read: !!read })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, signal: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    const isDbConnected = await checkSupabaseConnection();

    if (!isDbConnected) {
      let signals = localDb.getSignals();
      signals = signals.filter((s: any) => s.id !== id);
      localDb.saveSignals(signals);
      return NextResponse.json({ success: true, deletedId: id, fallback: true });
    }

    const serviceClient = createServiceClient();
    const { error } = await serviceClient.from('signals').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}