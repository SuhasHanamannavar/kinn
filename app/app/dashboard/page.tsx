'use client';

import React from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import SignalCard from '@/components/ui/SignalCard';
import KinCharacter from '@/components/ui/KinCharacter';
import Button from '@/components/ui/Button';
import { sampleSignals, sampleWatchlist } from '@/lib/sample-data';
import { formatTimeAgo, getSiteName } from '@/lib/utils';
import { Activity, Link2, Eye, Clock, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const recentSignals = sampleSignals.slice(0, 4);
  const recentWatchlist = sampleWatchlist.slice(0, 5);
  const unreadCount = sampleSignals.filter(s => !s.read).length;

  return (
    <>
      <TopBar 
        title="Dashboard" 
        subtitle="Welcome back. Here's what Kin found today."
        unreadSignals={unreadCount}
      />
      
      <div className="p-7">
        {/* Stats row */}
        <div 
          className="grid grid-cols-4 gap-4 mb-6 animate-fade-up"
          style={{ animationDelay: '0s' }}
        >
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(220,38,38,0.08)] flex items-center justify-center text-[#DC2626]">
                <Activity size={16} />
              </div>
              <span className="stat-label !mt-0">Active Signals</span>
            </div>
            <div className="stat-num">{unreadCount}</div>
            <div className="mt-[10px] text-[11.5px] text-[#059669] font-semibold">▲ 3 this week</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(45,95,138,0.08)] flex items-center justify-center text-[#2D5F8A]">
                <Link2 size={16} />
              </div>
              <span className="stat-label !mt-0">URLs Watched</span>
            </div>
            <div className="stat-num">{sampleWatchlist.length}</div>
            <div className="mt-[10px] text-[11.5px] text-[#8A8D9A]">Daily scans</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(5,150,105,0.08)] flex items-center justify-center text-[#059669]">
                <Eye size={16} />
              </div>
              <span className="stat-label !mt-0">Noise Filtered</span>
            </div>
            <div className="stat-num">92<span className="text-[18px]">%</span></div>
            <div className="mt-[10px] text-[11.5px] text-[#8A8D9A]">Only meaningful changes</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[rgba(124,58,237,0.08)] flex items-center justify-center text-[#5B21B6]">
                <Clock size={16} />
              </div>
              <span className="stat-label !mt-0">Avg. Detection</span>
            </div>
            <div className="stat-num">2h</div>
            <div className="mt-[10px] text-[11.5px] text-[#8A8D9A]">From change to alert</div>
          </div>
        </div>

        {/* Two column: Recent signals + Watchlist */}
        <div className="grid grid-cols-[1.5fr_1fr] gap-5">
          {/* Recent signals */}
          <Card className="animate-fade-up overflow-hidden" style={{ animationDelay: '0.05s' }}>
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
            <div className="p-[6px] flex flex-col gap-[10px]">
              {recentSignals.map(signal => (
                <SignalCard key={signal.id} signal={signal} compact />
              ))}
            </div>
          </Card>

          {/* Watchlist summary */}
          <Card className="animate-fade-up overflow-hidden" style={{ animationDelay: '0.1s' }}>
            <div className="px-5 py-[18px] border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
              <div>
                <div className="text-[15px] font-bold">Your Watchlist</div>
                <div className="text-[12px] text-[#8A8D9A] mt-[2px]">Sites Kin is monitoring</div>
              </div>
              <button className="btn-ghost px-3 py-2 text-[12px] font-medium rounded-[10px] border border-[rgba(0,0,0,0.12)] text-[#5A5D6B] hover:border-[rgba(0,0,0,0.22)] hover:text-[#1A1A1E] transition-all flex items-center gap-1">
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="p-[6px]">
              {recentWatchlist.map(url => (
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
                    <div className="text-[10.5px] text-[#8A8D9A] mt-[2px]">
                      {url.last_scan ? formatTimeAgo(url.last_scan) : '—'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Kin status + activity */}
        <Card 
          className="mt-5 p-[22px] animate-fade-up flex items-center gap-6"
          style={{ animationDelay: '0.15s' }}
        >
          <div className="relative">
            <div 
              className="absolute"
              style={{
                bottom: -2,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                height: 6,
                background: 'rgba(0,0,0,0.08)',
                borderRadius: '50%',
                filter: 'blur(3px)',
              }}
            />
            <KinCharacter size={72} state="idle" />
          </div>
          
          <div className="flex-1">
            <div className="eyebrow">Kin status</div>
            <div className="text-[18px] font-bold mb-1">All systems running smoothly</div>
            <div className="text-[13.5px] text-[#5A5D6B] leading-[1.6]">
              Kin completed 5 scheduled scans in the last 24 hours, analyzed 2,847 content changes, 
              filtered out 92% as noise, and surfaced 8 meaningful signals.
            </div>
          </div>
          
          <div className="text-right">
            <div className="inline-flex items-center gap-2 px-3 py-[6px] rounded-full text-[12px] font-semibold"
              style={{ background: 'rgba(5,150,105,0.08)', color: '#065F46' }}
            >
              <span className="w-[6px] h-[6px] rounded-full bg-[#059669] animate-pulse-dot" />
              Watching
            </div>
            <div className="text-[11.5px] text-[#8A8D9A] mt-2">Next scan in 22h 14m</div>
          </div>
        </Card>
      </div>
    </>
  );
}
