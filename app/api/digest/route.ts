import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/supabase/server';
import { sendDigestEmail } from '@/lib/notifications';
import { checkSupabaseConnection, localDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const isDbConnected = await checkSupabaseConnection();

    let signals = [];
    if (!isDbConnected) {
      signals = localDb.getSignals();
    } else {
      const serviceClient = createServiceClient();
      const { data, error } = await serviceClient
        .from('signals')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      signals = data || [];
    }

    const highImportance = signals.filter((s: any) => s.importance === 'high');
    const categoriesCount: Record<string, number> = {};
    signals.forEach((s: any) => {
      const cat = s.category_name || s.category;
      categoriesCount[cat] = (categoriesCount[cat] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      signals,
      totalSignals: signals.length,
      highImportanceCount: highImportance.length,
      categoriesCount,
      fallback: !isDbConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    const isDbConnected = await checkSupabaseConnection();

    let signals = [];
    let targetEmail = email;

    if (!isDbConnected) {
      signals = localDb.getSignals();
      targetEmail = targetEmail || 'kinbrightdata@gmail.com';
    } else {
      const serviceClient = createServiceClient();
      const { data } = await serviceClient
        .from('signals')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(10);
      signals = data || [];

      if (!targetEmail) {
        const { data: profiles } = await serviceClient.from('profiles').select('email').limit(1);
        targetEmail = profiles?.[0]?.email || 'kinbrightdata@gmail.com';
      }
    }

    const emailResult = await sendDigestEmail({
      toEmail: targetEmail,
      signals,
    });

    return NextResponse.json({
      success: true,
      emailSentTo: targetEmail,
      result: emailResult,
      fallback: !isDbConnected,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}