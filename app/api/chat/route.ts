import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/supabase/server';
import { chatWithKinAI } from '@/lib/ai';
import { checkSupabaseConnection, localDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const isDbConnected = await checkSupabaseConnection();

    if (!isDbConnected) {
      const messages = localDb.getMessages();
      return NextResponse.json({ success: true, messages, fallback: true });
    }

    const serviceClient = createServiceClient();
    const { data: messages, error } = await serviceClient
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(30);

    if (error) throw error;
    return NextResponse.json({ success: true, messages: messages || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }

    const isDbConnected = await checkSupabaseConnection();

    let watchlist: any[] = [];
    let signals: any[] = [];

    if (!isDbConnected) {
      watchlist = localDb.getWatchlist();
      signals = localDb.getSignals();
    } else {
      const serviceClient = createServiceClient();
      const { data: wl } = await serviceClient
        .from('monitored_urls')
        .select('name, url, category, signal_count, last_scan, status')
        .eq('is_active', true)
        .limit(10);
      const { data: sigs } = await serviceClient
        .from('signals')
        .select('title, summary, category, category_name, importance, site, detected_at, why_it_matters')
        .order('detected_at', { ascending: false })
        .limit(15);
      watchlist = wl || [];
      signals = sigs || [];
    }

    // Call Groq AI
    const aiResponse = await chatWithKinAI({
      message,
      watchlistContext: watchlist,
      signalsContext: signals,
      conversationHistory,
    });

    if (!isDbConnected) {
      const messages = localDb.getMessages();
      const userMsg = { id: `msg-u-${Date.now()}`, role: 'user', content: message, created_at: new Date().toISOString() };
      const assistantMsg = { id: `msg-a-${Date.now()}`, role: 'assistant', content: aiResponse, created_at: new Date().toISOString() };
      messages.push(userMsg, assistantMsg);
      localDb.saveMessages(messages);
      
      return NextResponse.json({
        success: true,
        response: aiResponse,
        quickReplies: [
          'What are the most important updates?',
          'Check for pricing or policy changes',
          'Scan my watchlist now',
        ],
        fallback: true,
      });
    }

    const serviceClient = createServiceClient();
    try {
      const { data: users } = await serviceClient.from('profiles').select('id').limit(1);
      const userId = users?.[0]?.id;
      if (userId) {
        await serviceClient.from('chat_messages').insert([
          { user_id: userId, role: 'user', content: message },
          { user_id: userId, role: 'assistant', content: aiResponse },
        ]);
      }
    } catch (dbErr) {
      console.warn('Could not persist chat message to database:', dbErr);
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      quickReplies: [
        'What are the most important updates?',
        'Check for pricing or policy changes',
        'Scan my watchlist now',
      ],
    });
  } catch (err: any) {
    console.error('Chat API error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}