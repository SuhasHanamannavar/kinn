'use client';

import React, { useState, useMemo } from 'react';
import TopBar from '@/components/layout/TopBar';
import SignalCard from '@/components/ui/SignalCard';
import { FilterChip } from '@/components/ui/Badges';
import Select from '@/components/ui/Select';
import { sampleSignals } from '@/lib/sample-data';
import type { SignalCategory } from '@/types';

const categories: { value: SignalCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'deadline', label: 'Deadlines' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'content', label: 'New Content' },
  { value: 'feature', label: 'Features' },
  { value: 'policy', label: 'Policy' },
  { value: 'announce', label: 'Announcements' },
];

export default function SignalsPage() {
  const [filter, setFilter] = useState<SignalCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState('newest');
  const unreadCount = sampleSignals.filter(s => !s.read).length;

  const filteredSignals = useMemo(() => {
    let result = [...sampleSignals];
    
    if (filter !== 'all') {
      result = result.filter(s => s.category === filter);
    }
    
    switch (sortBy) {
      case 'oldest':
        result.reverse();
        break;
      case 'important':
        const importanceOrder = { high: 0, med: 1, low: 2 };
        result.sort((a, b) => importanceOrder[a.importance] - importanceOrder[b.importance]);
        break;
    }
    
    return result;
  }, [filter, sortBy]);

  return (
    <>
      <TopBar 
        title="Signals" 
        subtitle="Every meaningful change classified by Kin. Click any signal to see details and evidence."
        unreadSignals={unreadCount}
      />
      
      <div className="p-7">
        <div className="flex items-end justify-between mb-5 flex-wrap gap-[14px]">
          <div>
            <div className="eyebrow">All signals</div>
            <h1 className="section-title">Live Signals</h1>
            <p className="section-sub">
              Every meaningful change classified by Kin. Click any signal to see details and evidence.
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
            <Select
              options={[
                { value: 'all', label: 'All time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This week' },
                { value: 'month', label: 'This month' },
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
          {filteredSignals.length > 0 ? (
            filteredSignals.map(signal => (
              <SignalCard key={signal.id} signal={signal} />
            ))
          ) : (
            <div className="empty-state">
              <div className="text-4xl mb-3 opacity-50">📡</div>
              <h4>No signals in this category</h4>
              <p>Kin will alert you when something meaningful changes.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
