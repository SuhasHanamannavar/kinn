import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/supabase/server';
import { fetchPageContent } from '@/lib/scraper';
import { checkSupabaseConnection, localDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const isDbConnected = await checkSupabaseConnection();

    if (!isDbConnected) {
      const watchlist = localDb.getWatchlist();
      return NextResponse.json({ success: true, watchlist, fallback: true });
    }

    const supabase = createClient();
    const serviceClient = createServiceClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = serviceClient.from('monitored_urls').select('*').order('created_at', { ascending: false });
    if (user) {
      query = query.eq('user_id', user.id);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, watchlist: data || [] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, category = 'General', scan_frequency = 'daily', noise_sensitivity = 'balanced' } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    const cleanUrl = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const displayName = name?.trim() || new URL(cleanUrl).hostname.replace(/^www\./, '');

    const isDbConnected = await checkSupabaseConnection();

    if (!isDbConnected) {
      const watchlist = localDb.getWatchlist();
      
      const newUrlRecord = {
        id: `local-${Date.now()}`,
        name: displayName,
        url: cleanUrl,
        category,
        scan_frequency,
        noise_sensitivity,
        status: 'watching',
        signal_count: 0,
        created_at: new Date().toISOString(),
        is_active: true,
        last_scan: null,
        last_signal_at: null,
      };

      watchlist.unshift(newUrlRecord);
      localDb.saveWatchlist(watchlist);

      // Baseline scrape async
      setTimeout(async () => {
        try {
          const { html, text, hash } = await fetchPageContent(cleanUrl);
          const currentWatch = localDb.getWatchlist();
          const itemIdx = currentWatch.findIndex((item: any) => item.id === newUrlRecord.id);
          if (itemIdx !== -1) {
            currentWatch[itemIdx].last_content_hash = hash;
            currentWatch[itemIdx].last_scan = new Date().toISOString();
            localDb.saveWatchlist(currentWatch);

            const snapshots = localDb.getSnapshots();
            snapshots.push({
              id: `local-snap-${Date.now()}`,
              url_id: newUrlRecord.id,
              content_hash: hash,
              raw_html: html.substring(0, 100000),
              text_content: text.substring(0, 50000),
              status: 'success',
              scraped_at: new Date().toISOString(),
            });
            localDb.saveSnapshots(snapshots);
          }
        } catch (scrapeErr: any) {
          console.warn('Initial scrape warning for new URL:', scrapeErr.message);
        }
      }, 100);

      return NextResponse.json({ success: true, item: newUrlRecord, fallback: true });
    }

    const supabase = createClient();
    const serviceClient = createServiceClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get or create dummy user_id if guest/demo
    let userId = user?.id;
    if (!userId) {
      const { data: profiles } = await serviceClient.from('profiles').select('id').limit(1);
      if (profiles && profiles.length > 0) {
        userId = profiles[0].id;
      } else {
        const { data: users } = await serviceClient.auth.admin.listUsers();
        if (users?.users?.length) {
          userId = users.users[0].id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please sign in or create an account first.' 
      }, { status: 401 });
    }

    const { data: newUrlRecordDB, error: insertError } = await serviceClient
      .from('monitored_urls')
      .insert({
        user_id: userId,
        name: displayName,
        url: cleanUrl,
        category,
        scan_frequency,
        noise_sensitivity,
        status: 'watching',
        signal_count: 0,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Perform immediate baseline scrape in background/async
    try {
      const { html, text, hash } = await fetchPageContent(cleanUrl);
      await serviceClient.from('snapshots').insert({
        url_id: newUrlRecordDB.id,
        user_id: userId,
        content_hash: hash,
        raw_html: html.substring(0, 500000),
        text_content: text.substring(0, 100000),
        status: 'success',
      });
      await serviceClient
        .from('monitored_urls')
        .update({
          last_content_hash: hash,
          last_scan: new Date().toISOString(),
          status: 'watching',
        })
        .eq('id', newUrlRecordDB.id);
    } catch (scrapeErr: any) {
      console.warn('Initial scrape warning for new URL:', scrapeErr.message);
    }

    return NextResponse.json({ success: true, item: newUrlRecordDB });
  } catch (err: any) {
    console.error('Error adding URL to watchlist:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, is_active } = body;

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });

    const isDbConnected = await checkSupabaseConnection();

    if (!isDbConnected) {
      const watchlist = localDb.getWatchlist();
      const itemIdx = watchlist.findIndex((item: any) => item.id === id);
      if (itemIdx !== -1) {
        if (status !== undefined) watchlist[itemIdx].status = status;
        if (is_active !== undefined) watchlist[itemIdx].is_active = is_active;
        localDb.saveWatchlist(watchlist);
        return NextResponse.json({ success: true, item: watchlist[itemIdx], fallback: true });
      }
      return NextResponse.json({ success: false, error: 'URL not found' }, { status: 404 });
    }

    const serviceClient = createServiceClient();
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data, error } = await serviceClient
      .from('monitored_urls')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, item: data });
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
      let watchlist = localDb.getWatchlist();
      watchlist = watchlist.filter((item: any) => item.id !== id);
      localDb.saveWatchlist(watchlist);
      return NextResponse.json({ success: true, deletedId: id, fallback: true });
    }

    const serviceClient = createServiceClient();
    const { error } = await serviceClient.from('monitored_urls').delete().eq('id', id);
    if (error) throw error;

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}