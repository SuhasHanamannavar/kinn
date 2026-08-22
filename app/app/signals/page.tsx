'use client';

import React, { useEffect, useState, useMemo } from 'react';
import TopBar from '@/components/layout/TopBar';
import SignalCard from '@/components/ui/SignalCard';
import { FilterChip } from '@/components/ui/Badges';
import Select from '@/components/ui/Select';
import { Database, X, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'deadline', label: 'Deadlines' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'content', label: 'New Content' },
  { value: 'feature', label: 'Features' },
  { value: 'policy', label: 'Policy' },
  { value: 'announce', label: 'Announcements' },
];

export default function SignalsPage() {
  const [signals, setSignals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isFallback, setIsFallback] = useState(false);
  
  // Detail Drawer state
  const [selectedSignal, setSelectedSignal] = useState<any | null>(null);

  async function fetchSignals() {
    try {
      const res = await fetch('/api/signals');
      const data = await res.json();
      if (data.success) {
        setSignals(data.signals || []);
        if (data.fallback) setIsFallback(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSignals();
  }, []);

  async function handleMarkRead(id: string, read: boolean) {
    try {
      const res = await fetch('/api/signals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read }),
      });
      const data = await res.json();
      if (data.success) {
        setSignals((prev: any[]) => prev.map(s => s.id === id ? { ...s, read } : s));
        if (selectedSignal?.id === id) {
          setSelectedSignal((prev: any) => prev ? { ...prev, read } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDeleteSignal(id: string) {
    if (!confirm('Are you sure you want to delete this signal?')) return;
    try {
      const res = await fetch(`/api/signals?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSignals((prev: any[]) => prev.filter(s => s.id !== id));
        setSelectedSignal(null);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const filteredSignals = useMemo(() => {
    let result = [...signals];
    
    if (filter !== 'all') {
      result = result.filter(s => s.category === filter);
    }
    
    switch (sortBy) {
      case 'oldest':
        result.reverse();
        break;
      case 'important':
        const importanceOrder: Record<string, number> = { high: 0, med: 1, low: 2 };
        result.sort((a, b) => importanceOrder[a.importance] - importanceOrder[b.importance]);
        break;
    }
    
    return result;
  }, [signals, filter, sortBy]);

  const unreadCount = signals.filter(s => !s.read).length;

  return (
    <>
      <TopBar 
        title="Signals" 
        subtitle="Every meaningful change classified by Kin. Click any signal to see details and evidence."
        unreadSignals={unreadCount}
      />
      
      <div className="p-7">
        {isFallback && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3 text-[13.5px]">
            <Database className="text-amber-600 mt-[2px] flex-shrink-0" size={18} />
            <div className="flex-1">
              <span className="font-bold">Local Workspace Fallback:</span> Any signal updates here are stored locally in JSON format. Link your live Supabase database by pasting <code className="bg-amber-100 px-1 py-0.5 rounded text-red-700 font-mono text-[12px]">supabase/schema.sql</code> into your Supabase SQL editor.
            </div>
          </div>
        )}

        <div className="flex items-end justify-between mb-5 flex-wrap gap-[14px]">
          <div>
            <div className="eyebrow">All signals</div>
            <h1 className="section-title">Live Signals</h1>
            <p className="section-sub">
              Review, filter, and inspect detailed visual and semantic website changes parsed by Llama AI.
            </p>
          </div>
          <div className="flex gap-[10px] items-center flex-wrap">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={[
                { value: 'newest', label: 'Newest first' },
                { value: 'oldest', label: 'Oldest first' },
                { value: 'important', label: 'Most important' },
              ]}
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {categories.map(cat => (
            <FilterChip 
              key={cat.value}
              active={filter === cat.value}
              onClick={() => setFilter(cat.value)}
            >
              {cat.label}
            </FilterChip>
          ))}
        </div>

        {/* Signal feed */}
        <div className="flex flex-col gap-[10px]">
          {loading ? (
            <div className="text-center py-20 text-[#8A8D9A] text-[14px]">Loading signals feed...</div>
          ) : filteredSignals.length > 0 ? (
            filteredSignals.map(signal => (
              <div 
                key={signal.id} 
                onClick={() => {
                  setSelectedSignal(signal);
                  if (!signal.read) handleMarkRead(signal.id, true);
                }}
                className="cursor-pointer"
              >
                <SignalCard signal={signal} />
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="text-4xl mb-3 opacity-50">ðŸ”</div>
              <h4>No signals in this category</h4>
              <p>Kin will alert you when something meaningful changes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer Modal */}
      {selectedSignal && (
        <div className="modal-overlay animate-overlay-in" onClick={() => setSelectedSignal(null)}>
          <div 
            className="modal animate-modal-in max-w-[650px] w-full"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D5F8A] px-2 py-0.5 bg-[rgba(45,95,138,0.08)] rounded-full">
                  {selectedSignal.category_name || selectedSignal.category}
                </span>
                <span className="text-[11px] font-bold uppercase ml-2 text-red-600 px-2 py-0.5 bg-red-50 rounded-full">
                  {selectedSignal.importance_label || selectedSignal.importance}
                </span>
              </div>
              <button 
                onClick={() => setSelectedSignal(null)}
                className="text-[#8A8D9A] hover:text-[#1A1A1E]"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-5">
              <div>
                <div className="text-[12px] text-[#8A8D9A]">{selectedSignal.site}</div>
                <h3 className="text-[18px] font-bold text-[#1A1A1E] mt-1">{selectedSignal.title}</h3>
                <p className="text-[12px] text-[#8A8D9A] mt-1">
                  Detected on {new Date(selectedSignal.detected_at).toLocaleString()}
                </p>
              </div>

              <div>
                <div className="text-[12.5px] font-semibold text-[#5A5D6B] mb-1">Semantic Summary</div>
                <p className="text-[13.5px] text-[#1A1A1E] leading-relaxed bg-[#FAFAF7] p-3.5 rounded-xl border border-[rgba(0,0,0,0.04)]">
                  {selectedSignal.summary}
                </p>
              </div>

              {selectedSignal.why_it_matters && (
                <div>
                  <div className="text-[12.5px] font-semibold text-[#5A5D6B] mb-1">Why this matters</div>
                  <p className="text-[13.5px] text-[#2D5F8A] leading-relaxed bg-[rgba(45,95,138,0.04)] p-3.5 rounded-xl border border-[rgba(45,95,138,0.08)]">
                    {selectedSignal.why_it_matters}
                  </p>
                </div>
              )}

              {selectedSignal.evidence && selectedSignal.evidence.length > 0 && (
                <div>
                  <div className="text-[12.5px] font-semibold text-[#5A5D6B] mb-1.5">Parsed Evidence</div>
                  <div className="flex flex-col gap-2">
                    {selectedSignal.evidence.map((ev: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-[12.5px] bg-[#FAFAF7] p-3 rounded-lg border border-[rgba(0,0,0,0.03)]">
                        <span className="font-medium text-[#5A5D6B]">{ev.label}</span>
                        <span className="font-semibold text-[#1A1A1E]">{ev.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSignal.raw_diff && (
                <div>
                  <div className="text-[12.5px] font-semibold text-[#5A5D6B] mb-1">Extracted Text Diff</div>
                  <pre className="text-[11.5px] font-mono text-[#E11D48] bg-[#FFF1F2] p-4 rounded-xl overflow-x-auto max-h-[180px] border border-[#FECDD3]">
                    {selectedSignal.raw_diff}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[rgba(0,0,0,0.06)] flex justify-between gap-[10px]">
              <Button 
                variant="danger" 
                onClick={() => handleDeleteSignal(selectedSignal.id)}
              >
                Delete Signal
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={() => handleMarkRead(selectedSignal.id, !selectedSignal.read)}
                >
                  {selectedSignal.read ? 'Mark as Unread' : 'Mark as Read'}
                </Button>
                <Button onClick={() => setSelectedSignal(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
