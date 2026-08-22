import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/supabase/server';
import { checkSupabaseConnection, localDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const isDbConnected = await checkSupabaseConnection();

    if (!isDbConnected) {
      const settings = localDb.getSettings();
      return NextResponse.json({ success: true, settings, fallback: true });
    }

    const serviceClient = createServiceClient();
    const { data: settingsList, error } = await serviceClient
      .from('user_settings')
      .select('*')
      .limit(1);

    if (error) throw error;

    const defaultSettings = {
      email_alerts: true,
      weekly_digest: true,
      only_high_importance: false,
      scan_frequency: 'daily',
      noise_sensitivity: 'balanced',
      ai_tone: 'simple',
      include_raw_evidence: true,
      digest_day: 'sunday',
    };

    return NextResponse.json({
      success: true,
      settings: settingsList?.[0] || defaultSettings,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isDbConnected = await checkSupabaseConnection();

    if (!isDbConnected) {
      localDb.saveSettings(body);
      return NextResponse.json({ success: true, settings: body, fallback: true });
    }

    const serviceClient = createServiceClient();
    const { data: profiles } = await serviceClient.from('profiles').select('id').limit(1);
    const userId = profiles?.[0]?.id;

    if (!userId) {
      return NextResponse.json({ success: true, settings: body });
    }

    const { data, error } = await serviceClient
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...body,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, settings: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}