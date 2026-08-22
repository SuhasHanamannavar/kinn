import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/supabase/server';
import { fetchPageContent, calculateChangeRatio, generateSimpleDiff } from '@/lib/scraper';
import { analyzeChangeWithAI } from '@/lib/ai';
import { sendSignalAlertEmail } from '@/lib/notifications';
import { checkSupabaseConnection, localDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { url_id, scan_all = false, force_simulate = false } = body;

    const isDbConnected = await checkSupabaseConnection();

    if (!isDbConnected) {
      let watchlist = localDb.getWatchlist();
      let urlsToScan = [];
      if (url_id) {
        const item = watchlist.find((i: any) => i.id === url_id);
        if (item) urlsToScan.push(item);
      } else if (scan_all) {
        urlsToScan = watchlist.filter((i: any) => i.is_active);
      } else {
        if (watchlist.length) urlsToScan.push(watchlist[0]);
      }

      if (urlsToScan.length === 0) {
        return NextResponse.json({ success: true, message: 'No URLs to scan', scanned: 0, fallback: true });
      }

      const results = [];

      for (const item of urlsToScan) {
        try {
          // Set status to scanning
          item.status = 'scanning';
          localDb.saveWatchlist(watchlist);

          const { html, text, hash } = await fetchPageContent(item.url);

          const snapshots = localDb.getSnapshots();
          const prevSnapshot = snapshots.filter((s: any) => s.url_id === item.id).pop();
          const oldText = prevSnapshot?.text_content || '';
          const oldHash = prevSnapshot?.content_hash || item.last_content_hash;

          const hasChanged = (!oldHash && force_simulate) || (oldHash && oldHash !== hash) || force_simulate;

          const newSnap = {
            id: `local-snap-${Date.now()}`,
            url_id: item.id,
            content_hash: hash,
            raw_html: html.substring(0, 100000),
            text_content: text.substring(0, 50000),
            status: 'success',
            scraped_at: new Date().toISOString(),
          };
          snapshots.push(newSnap);
          localDb.saveSnapshots(snapshots);

          let signalCreated = false;
          let signalData = null;

          if (hasChanged) {
            const changeRatio = oldText ? calculateChangeRatio(oldText, text) : 0.15;
            const rawDiff = oldText ? generateSimpleDiff(oldText, text) : 'New updates discovered on monitored page.';

            const aiAnalysis = await analyzeChangeWithAI({
              url: item.url,
              oldText: oldText || 'Initial baseline snapshot',
              newText: text,
              rawDiff,
              changeRatio,
            });

            let site = item.name;
            try {
              site = new URL(item.url).hostname.replace(/^www\./, '');
            } catch {}

            const signals = localDb.getSignals();
            signalData = {
              id: `local-sig-${Date.now()}`,
              url_id: item.id,
              user_id: 'guest',
              snapshot_from_id: prevSnapshot?.id || null,
              snapshot_to_id: newSnap.id,
              category: aiAnalysis.category,
              category_name: aiAnalysis.category_name,
              importance: aiAnalysis.importance,
              importance_label: aiAnalysis.importance.toUpperCase(),
              site,
              title: aiAnalysis.title,
              summary: aiAnalysis.summary,
              why_it_matters: aiAnalysis.why_it_matters,
              evidence: aiAnalysis.evidence,
              raw_diff: rawDiff.substring(0, 5000),
              ai_summary: aiAnalysis.ai_summary,
              read: false,
              notified: false,
              detected_at: new Date().toISOString(),
            };
            signals.unshift(signalData);
            localDb.saveSignals(signals);

            signalCreated = true;
            item.signal_count = (item.signal_count || 0) + 1;

            // Optional email notification
            const settings = localDb.getSettings();
            if (settings.email_alerts) {
              await sendSignalAlertEmail({
                toEmail: 'kinbrightdata@gmail.com',
                recipientName: 'Kin User',
                signal: {
                  title: aiAnalysis.title,
                  summary: aiAnalysis.summary,
                  site,
                  category_name: aiAnalysis.category_name,
                  importance: aiAnalysis.importance,
                  why_it_matters: aiAnalysis.why_it_matters,
                },
              });
            }
          }

          item.status = 'watching';
          item.last_scan = new Date().toISOString();
          item.last_content_hash = hash;
          if (signalCreated) {
            item.last_signal_at = new Date().toISOString();
          }

          localDb.saveWatchlist(watchlist);

          results.push({
            url_id: item.id,
            url: item.url,
            hasChanged,
            signalCreated,
            signal: signalData,
          });

        } catch (itemErr: any) {
          item.status = 'error';
          item.last_scan = new Date().toISOString();
          localDb.saveWatchlist(watchlist);

          results.push({
            url_id: item.id,
            url: item.url,
            error: itemErr.message,
          });
        }
      }

      return NextResponse.json({
        success: true,
        scanned: results.length,
        results,
        fallback: true,
      });
    }

    const serviceClient = createServiceClient();
    let urlsToScanDB: any[] = [];

    if (url_id) {
      const { data: urlRecord, error } = await serviceClient
        .from('monitored_urls')
        .select('*')
        .eq('id', url_id)
        .single();
      if (error) throw error;
      if (urlRecord) urlsToScanDB.push(urlRecord);
    } else if (scan_all) {
      const { data: records, error } = await serviceClient
        .from('monitored_urls')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      urlsToScanDB = records || [];
    } else {
      const { data: records } = await serviceClient
        .from('monitored_urls')
        .select('*')
        .limit(1);
      urlsToScanDB = records || [];
    }

    if (urlsToScanDB.length === 0) {
      return NextResponse.json({ success: true, message: 'No URLs to scan', scanned: 0 });
    }

    const resultsDB = [];

    for (const item of urlsToScanDB) {
      try {
        await serviceClient.from('monitored_urls').update({ status: 'scanning' }).eq('id', item.id);

        const { html, text, hash } = await fetchPageContent(item.url);

        const { data: prevSnapshots } = await serviceClient
          .from('snapshots')
          .select('*')
          .eq('url_id', item.id)
          .order('scraped_at', { ascending: false })
          .limit(1);

        const prevSnapshot = prevSnapshots?.[0];
        const oldText = prevSnapshot?.text_content || '';
        const oldHash = prevSnapshot?.content_hash || item.last_content_hash;

        const hasChanged = (!oldHash && force_simulate) || (oldHash && oldHash !== hash) || force_simulate;

        const { data: newSnapshot } = await serviceClient
          .from('snapshots')
          .insert({
            url_id: item.id,
            user_id: item.user_id,
            content_hash: hash,
            raw_html: html.substring(0, 500000),
            text_content: text.substring(0, 100000),
            status: 'success',
          })
          .select()
          .single();

        let signalCreated = false;
        let signalData = null;

        if (hasChanged) {
          const changeRatio = oldText ? calculateChangeRatio(oldText, text) : 0.15;
          const rawDiff = oldText ? generateSimpleDiff(oldText, text) : 'New updates discovered on monitored page.';

          const aiAnalysis = await analyzeChangeWithAI({
            url: item.url,
            oldText: oldText || 'Initial baseline snapshot',
            newText: text,
            rawDiff,
            changeRatio,
          });

          let site = item.name;
          try {
            site = new URL(item.url).hostname.replace(/^www\./, '');
          } catch {}

          const { data: insertedSignal } = await serviceClient
            .from('signals')
            .insert({
              url_id: item.id,
              user_id: item.user_id,
              snapshot_from_id: prevSnapshot?.id || null,
              snapshot_to_id: newSnapshot?.id || null,
              category: aiAnalysis.category,
              category_name: aiAnalysis.category_name,
              importance: aiAnalysis.importance,
              importance_label: aiAnalysis.importance.toUpperCase(),
              site,
              title: aiAnalysis.title,
              summary: aiAnalysis.summary,
              why_it_matters: aiAnalysis.why_it_matters,
              evidence: aiAnalysis.evidence,
              raw_diff: rawDiff.substring(0, 5000),
              ai_summary: aiAnalysis.ai_summary,
            })
            .select()
            .single();

          signalCreated = true;
          signalData = insertedSignal;

          const { data: settings } = await serviceClient
            .from('user_settings')
            .select('email_alerts, only_high_importance')
            .eq('user_id', item.user_id)
            .maybeSingle();

          const shouldEmail = settings?.email_alerts !== false && (!settings?.only_high_importance || aiAnalysis.importance === 'high');

          if (shouldEmail) {
            const { data: profile } = await serviceClient
              .from('profiles')
              .select('email, full_name')
              .eq('id', item.user_id)
              .maybeSingle();

            if (profile?.email) {
              await sendSignalAlertEmail({
                toEmail: profile.email,
                recipientName: profile.full_name,
                signal: {
                  title: aiAnalysis.title,
                  summary: aiAnalysis.summary,
                  site,
                  category_name: aiAnalysis.category_name,
                  importance: aiAnalysis.importance,
                  why_it_matters: aiAnalysis.why_it_matters,
                },
              });
            }
          }
        }

        await serviceClient
          .from('monitored_urls')
          .update({
            status: 'watching',
            last_scan: new Date().toISOString(),
            last_content_hash: hash,
            ...(signalCreated ? { last_signal_at: new Date().toISOString() } : {}),
          })
          .eq('id', item.id);

        resultsDB.push({
          url_id: item.id,
          url: item.url,
          hasChanged,
          signalCreated,
          signal: signalData,
        });

      } catch (itemErr: any) {
        console.error(`Error scanning ${item.url}:`, itemErr);
        await serviceClient
          .from('monitored_urls')
          .update({ status: 'error', last_scan: new Date().toISOString() })
          .eq('id', item.id);

        resultsDB.push({
          url_id: item.id,
          url: item.url,
          error: itemErr.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      scanned: resultsDB.length,
      results: resultsDB,
    });
  } catch (err: any) {
    console.error('Scan execution error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}