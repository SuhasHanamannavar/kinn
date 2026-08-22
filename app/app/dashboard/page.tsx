'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import KinCharacter from '@/components/ui/KinCharacter';
import SignalCard from '@/components/ui/SignalCard';
import Link from 'next/link';
import { 
  Activity, 
  Link2, 
  Eye, 
  Clock, 
  ChevronRight, 
  Plus,
  AlertCircle,
  Database
} from 'lucide-react';

export default function DashboardPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [scanning, setScanning] = useState(false);

  async function fetchDashboardData() {
    try {
      const wlRes = await fetch('/api/watchlist');
      const wlData = await wlRes.json();
      if (wlData.success) {
        setWatchlist(wlData.watchlist || []);
        if (wlData.fallback) setIsFallback(true);
      }

      const sigRes = await fetch('/api/signals');
      const sigData = await sigRes.json();
      if (sigData.success) {
        setSignals(sigData.signals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function handleScanAll() {
    setScanning(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scan_all: true }),
      });
      await res.json();
      await fetchDashboardData();
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  }

  const unreadCount = signals.filter(s => !s.read).length;
  const recentSignals = signals.slice(0, 4);
  const recentWatchlist = watchlist.slice(0, 5);

  function getSiteName(url: string) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  return (
    <>
      <TopBar 
        title="Dashboard" 
        subtitle="Welcome back. Here's what Kin found today."
        unreadSignals={unreadCount}
      />
      
      <div className="p-7">
        {/* Fallback storage notice */}
        {isFallback && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3 text-[13.5px]">
            <Database className="text-amber-600 mt-[2px] flex-shrink-0" size={18} />
            <div className="flex-1">
              <span className="font-bold">Supabase Tables Offline:</span> Kin is currently running in fallback mode using local file storage. Paste the database schema from <code className="bg-amber-100 px-1.5 py-0.5 rounded text-red-700 font-mono text-[12px]">supabase/schema.sql</code> into your Supabase SQL Editor to connect your live database.
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-fade-up">
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(220,38,38,0.08)] flex items-center justify-center text-[#DC2626]">
                <Activity size={16} />
              </div>
              <span className="stat-label !mt-0">Active Signals</span>
            </div>
            <div className="stat-num">{unreadCount}</div>
            <div className="mt-[10px] text-[11.5px] text-[#059669] font-semibold">● Live feed active</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(45,95,138,0.08)] flex items-center justify-center text-[#2D5F8A]">
                <Link2 size={16} />
              </div>
              <span className="stat-label !mt-0">URLs Watched</span>
            </div>
            <div className="stat-num">{watchlist.length}</div>
            <div className="mt-[10px] text-[11.5px] text-[#8A8D9A]">Change monitoring</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(5,150,105,0.08)] flex items-center justify-center text-[#059669]">
                <Eye size={16} />
              </div>
              <span className="stat-label !mt-0">Noise Filtered</span>
            </div>
            <div className="stat-num">95<span className="text-[18px]">%</span></div>
            <div className="mt-[10px] text-[11.5px] text-[#8A8D9A]">Only meaningful changes</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(124,58,237,0.08)] flex items-center justify-center text-[#5B21B6]">
                <Clock size={16} />
              </div>
              <span className="stat-label !mt-0">AI Engine</span>
            </div>
            <div className="stat-num">GPT</div>
            <div className="mt-[10px] text-[11.5px] text-[#8A8D9A]">Meta/Llama inference</div>
          </div>
        </div>

        {/* Two column: Recent signals + Watchlist */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-5">
          {/* Recent signals */}
          <Card className="overflow-hidden">
            <div className="px-5 py-[18px] border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
              <div>
                <div className="text-[15px] font-bold">Recent Signals</div>
                <div className="text-[12px] text-[#8A8D9A] mt-[2px]">Latest changes detected by Kin</div>
              </div>
              <Link href="/app/signals">
                <button className="btn-ghost px-4 py-2 text-[12px] font-medium rounded-[10px] border border-[rgba(0,0,0,0.12)] text-[#5A5D6B] hover:border-[rgba(0,0,0,0.22)] hover:text-[#1A1A1E] transition-all flex items-center gap-1">
                  View all <ChevronRight size={14} />
                </button>
              </Link>
            </div>
            <div className="p-[6px] flex flex-col gap-[10px] min-h-[150px]">
              {loading ? (
                <div className="flex justify-center items-center py-10 text-[#8A8D9A] text-[13.5px]">Loading signals...</div>
              ) : recentSignals.length > 0 ? (
                recentSignals.map(signal => (
                  <SignalCard key={signal.id} signal={signal} compact />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-[#8A8D9A] text-center px-4">
                  <div className="text-3xl mb-2">🔍</div>
                  <div className="font-semibold text-[13.5px] text-[#1A1A1E]">No signals detected yet</div>
                  <p className="text-[12px] mt-1 max-w-[280px]">Add URLs to your watchlist or trigger a scan to detect changes.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Watchlist summary */}
          <Card className="overflow-hidden">
            <div className="px-5 py-[18px] border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
              <div>
                <div className="text-[15px] font-bold">Your Watchlist</div>
                <div className="text-[12px] text-[#8A8D9A] mt-[2px]">Sites Kin is monitoring</div>
              </div>
              <Link href="/app/watchlist">
                <button className="btn-ghost px-3 py-2 text-[12px] font-medium rounded-[10px] border border-[rgba(0,0,0,0.12)] text-[#5A5D6B] hover:border-[rgba(0,0,0,0.22)] hover:text-[#1A1A1E] transition-all flex items-center gap-1">
                  <Plus size={14} /> View
                </button>
              </Link>
            </div>
            <div className="p-[6px] min-h-[150px]">
              {loading ? (
                <div className="flex justify-center items-center py-10 text-[#8A8D9A] text-[13.5px]">Loading sites...</div>
              ) : recentWatchlist.length > 0 ? (
                recentWatchlist.map(url => (
                  <div 
                    key={url.id}
                    className="px-4 py-3 flex items-center gap-3 rounded-lg hover:bg-[rgba(0,0,0,0.02)] transition-colors cursor-pointer group"
                  >
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                    >
                      {url.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-[#1A1A1E] truncate">{url.name}</div>
                      <div className="text-[11.5px] text-[#8A8D9A] truncate">{getSiteName(url.url)}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {url.signal_count > 0 ? (
                        <div className="text-[12px] font-semibold text-[#DC2626]">{url.signal_count} signals</div>
                      ) : (
                        <div className="text-[11px] text-[#8A8D9A]">Watching</div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-[#8A8D9A] text-center px-4">
                  <div className="text-3xl mb-2">🌐</div>
                  <div className="font-semibold text-[13.5px] text-[#1A1A1E]">Watchlist is empty</div>
                  <p className="text-[12px] mt-1 max-w-[200px]">Add your first URL to begin monitoring.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Kin status + activity */}
        <Card 
          className="mt-5 p-[22px] flex flex-col sm:flex-row items-center gap-6"
        >
          <div className="relative">
            <KinCharacter size={72} state={scanning ? 'scanning' : 'idle'} />
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <div className="eyebrow">Kin status</div>
            <div className="text-[18px] font-bold mb-1">
              {scanning ? 'Kin is currently scanning your watchlist...' : 'All systems running smoothly'}
            </div>
            <div className="text-[13.5px] text-[#5A5D6B] leading-[1.6]">
              Kin is monitoring {watchlist.length} pages for updates, filters out web noise, and uses Groq AI to summarize meaningful changes instantly.
            </div>
          </div>
          
          <div className="text-right flex-shrink-0">
            <Button onClick={handleScanAll} loading={scanning}>
              {scanning ? 'Scanning...' : 'Scan Watchlist Now'}
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
}