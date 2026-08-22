'use client';

import React, { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { sampleWatchlist, sampleSignals } from '@/lib/sample-data';
import { formatTimeAgo, getSiteName } from '@/lib/utils';
import { Plus, Pause, Play, Trash2, Activity, Link2 } from 'lucide-react';
import type { ScanStatus } from '@/types';

const statusStyles: Record<ScanStatus, { bg: string; text: string; dot: string }> = {
  watching: { bg: 'rgba(5,150,105,0.08)', text: '#065F46', dot: '#059669' },
  paused: { bg: 'rgba(0,0,0,0.05)', text: '#5A5D6B', dot: '#8A8D9A' },
  error: { bg: 'rgba(220,38,38,0.08)', text: '#991B1B', dot: '#DC2626' },
  scanning: { bg: 'rgba(8,145,178,0.08)', text: '#0E7490', dot: '#0891B2' },
};

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState(sampleWatchlist);
  const [showAddModal, setShowAddModal] = useState(false);
  const unreadCount = sampleSignals.filter(s => !s.read).length;

  const toggleStatus = (id: string) => {
    setWatchlist(prev => prev.map(url => 
      url.id === id 
        ? { ...url, status: url.status === 'watching' ? 'paused' : 'watching' as ScanStatus }
        : url
    ));
  };

  const removeUrl = (id: string) => {
    setWatchlist(prev => prev.filter(url => url.id !== id));
  };

  return (
    <>
      <TopBar 
        title="Watchlist" 
        subtitle="URLs Kin is quietly monitoring for you."
        unreadSignals={unreadCount}
      />
      
      <div className="p-7">
        <div className="flex items-end justify-between mb-5 flex-wrap gap-[14px]">
          <div>
            <div className="eyebrow">Your watchlist</div>
            <h1 className="section-title">URLs Kin is watching</h1>
            <p className="section-sub">
              Add any website. Kin will quietly check it daily and surface meaningful changes.
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add URL to watch
          </Button>
        </div>

        {/* Watchlist grid */}
        <div 
          className="grid gap-[14px]"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}
        >
          {watchlist.map(url => {
            const style = statusStyles[url.status];
            return (
              <Card key={url.id} hoverable className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                  >
                    {url.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[#1A1A1E] truncate">{url.name}</div>
                    <div className="text-[12px] text-[#8A8D9A] truncate mt-[2px]">
                      {getSiteName(url.url)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#8A8D9A]">Category</span>
                    <span className="font-medium text-[#1A1A1E]">{url.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#8A8D9A]">Frequency</span>
                    <span className="font-medium capitalize text-[#1A1A1E]">{url.scan_frequency}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#8A8D9A]">Last scan</span>
                    <span className="font-medium text-[#1A1A1E]">
                      {url.last_scan ? formatTimeAgo(url.last_scan) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-[#8A8D9A]">Signals</span>
                    <span className={`font-semibold ${url.signal_count > 0 ? 'text-[#DC2626]' : 'text-[#8A8D9A]'}`}>
                      {url.signal_count}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(0,0,0,0.06)]">
                  <div 
                    className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[11px] font-semibold"
                    style={{ background: style.bg, color: style.text }}
                  >
                    <span 
                      className="w-[6px] h-[6px] rounded-full"
                      style={{ 
                        background: style.dot,
                        animation: url.status === 'scanning' ? 'pulseDot 1.8s ease-in-out infinite' : undefined
                      }}
                    />
                    {url.status.charAt(0).toUpperCase() + url.status.slice(1)}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleStatus(url.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5A5D6B] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
                      title={url.status === 'watching' ? 'Pause' : 'Resume'}
                    >
                      {url.status === 'watching' ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      onClick={() => removeUrl(url.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A8D9A] hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.06)] transition-colors"
                      title="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}

          {/* Add URL card */}
          <button
            onClick={() => setShowAddModal(true)}
            className="min-h-[200px] p-5 rounded-[14px] border-2 border-dashed border-[rgba(0,0,0,0.1)] hover:border-[rgba(26,26,30,0.3)] hover:bg-white transition-all flex flex-col items-center justify-center gap-3 text-[#8A8D9A] hover:text-[#1A1A1E]"
          >
            <div className="w-10 h-10 rounded-full bg-[rgba(0,0,0,0.04)] flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div className="font-medium text-[13px]">Add new URL</div>
          </button>
        </div>
      </div>

      {/* Add URL Modal */}
      {showAddModal && (
        <div className="modal-overlay animate-overlay-in" onClick={() => setShowAddModal(false)}>
          <div className="modal animate-modal-in" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-6 border-b border-[rgba(0,0,0,0.06)]">
              <div className="text-[18px] font-bold">Add a URL to watch</div>
              <div className="text-[13px] text-[#8A8D9A] mt-[3px]">
                Kin will monitor this site for meaningful changes.
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[12.5px] font-semibold text-[#5A5D6B] mb-[6px]">Website URL</label>
                <input 
                  type="text" 
                  placeholder="https://example.com"
                  className="w-full px-[14px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[14px] font-sans text-[#1A1A1E] bg-white outline-none focus:border-[rgba(26,26,30,0.3)] focus:shadow-[0_0_0_3px_rgba(26,26,30,0.06)] transition-all"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#5A5D6B] mb-[6px]">Label (optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Stanford Admissions"
                  className="w-full px-[14px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[14px] font-sans text-[#1A1A1E] bg-white outline-none focus:border-[rgba(26,26,30,0.3)] focus:shadow-[0_0_0_3px_rgba(26,26,30,0.06)] transition-all"
                />
              </div>
              <div>
                <label className="block text-[12.5px] font-semibold text-[#5A5D6B] mb-[6px]">Category</label>
                <select className="w-full px-[14px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[13px] font-sans text-[#1A1A1E] bg-white outline-none cursor-pointer">
                  <option>Education</option>
                  <option>Finance</option>
                  <option>Careers</option>
                  <option>Technology</option>
                  <option>Research</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FAFAF7] rounded-lg">
                <div className="text-[12.5px] text-[#5A5D6B]">
                  <b className="text-[#1A1A1E]">Free plan</b><br />
                  <span className="text-[11.5px]">2 of 3 URLs used</span>
                </div>
                <div className="w-[120px] h-[6px] bg-[rgba(0,0,0,0.08)] rounded-full overflow-hidden">
                  <div className="w-[66%] h-full bg-[#1A1A1E] rounded-full" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[rgba(0,0,0,0.06)] flex gap-[10px] justify-end">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={() => setShowAddModal(false)}>Add to watchlist</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
