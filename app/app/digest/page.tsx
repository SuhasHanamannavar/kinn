'use client';

import React from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { CategoryPill } from '@/components/ui/Badges';
import { sampleSignals } from '@/lib/sample-data';
import { Mail } from 'lucide-react';

export default function DigestPage() {
  const unreadCount = sampleSignals.filter(s => !s.read).length;
  const deadlineSignals = sampleSignals.filter(s => s.category === 'deadline');
  const pricingSignals = sampleSignals.filter(s => s.category === 'pricing');
  const contentSignals = sampleSignals.filter(s => s.category === 'content');
  const policySignals = sampleSignals.filter(s => s.category === 'policy');

  return (
    <>
      <TopBar 
        title="Digest" 
        subtitle="Weekly intelligence brief from Kin."
        unreadSignals={unreadCount}
      />
      
      <div className="p-7">
        <div className="flex items-end justify-between mb-5 flex-wrap gap-[14px]">
          <div>
            <div className="eyebrow">Weekly digest</div>
            <h1 className="section-title">Your Intelligence Brief</h1>
            <p className="section-sub">
              Kin's curated summary of the most important changes this week.
            </p>
          </div>
          <div className="flex gap-[10px]">
            <Button variant="ghost">
              <Mail size={16} /> Email me
            </Button>
            <Select
              options={[
                { value: 'week', label: 'This week' },
                { value: 'last', label: 'Last week' },
                { value: 'month', label: 'This month' },
              ]}
            />
          </div>
        </div>

        <Card className="p-8 mx-auto" style={{ maxWidth: 760 }}>
          {/* Header */}
          <div className="text-center border-b border-[rgba(0,0,0,0.08)] pb-5 mb-6">
            <div className="font-mono text-[11px] text-[#8A8D9A]">
              KIN WEEKLY INTELLIGENCE BRIEF
            </div>
            <div className="text-[22px] font-bold mt-[6px]">
              Week of August 16–22, 2026
            </div>
          </div>

          {/* Summary paragraph */}
          <div className="text-[14px] text-[#5A5D6B] leading-[1.7] mb-5">
            Kin monitored <b>5 websites</b>, analyzed <b>2,847 content changes</b>, 
            filtered out <b>92%</b> as noise, and surfaced <b>8 meaningful signals</b> across 4 categories.
          </div>

          {/* Signals grouped */}
          <div className="flex flex-col gap-[18px]">
            {/* Deadline */}
            {deadlineSignals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CategoryPill category="deadline" label="Deadline" />
                  <span className="text-[13px] font-bold">
                    {deadlineSignals[0].title}
                  </span>
                </div>
                <p className="text-[13.5px] text-[#5A5D6B] m-0 leading-[1.6]">
                  {deadlineSignals[0].summary}
                </p>
              </div>
            )}

            {/* Pricing */}
            {pricingSignals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CategoryPill category="pricing" label="Pricing" />
                  <span className="text-[13px] font-bold">
                    Vercel Pro plan increased 25%
                  </span>
                </div>
                <p className="text-[13.5px] text-[#5A5D6B] m-0 leading-[1.6]">
                  Vercel raised Pro tier from $20 to $25 and introduced Enterprise. 
                  If you're on Pro, evaluate whether the new pricing fits your budget.
                </p>
              </div>
            )}

            {/* Content */}
            {contentSignals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CategoryPill category="content" label="New Content" />
                  <span className="text-[13px] font-bold">
                    3 new hackathons + 12 AI courses
                  </span>
                </div>
                <p className="text-[13.5px] text-[#5A5D6B] m-0 leading-[1.6]">
                  Devpost posted Spring 2026 hackathons including a $50K AI/ML competition. 
                  Coursera added 12 generative AI courses from Stanford and DeepLearning.AI.
                </p>
              </div>
            )}

            {/* Policy */}
            {policySignals.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CategoryPill category="policy" label="Policy" />
                  <span className="text-[13px] font-bold">
                    SEC cybersecurity disclosure rules updated
                  </span>
                </div>
                <p className="text-[13.5px] text-[#5A5D6B] m-0 leading-[1.6]">
                  New 4-day reporting requirement for material cybersecurity incidents. 
                  Relevant for compliance and investment monitoring.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-7 pt-5 border-t border-[rgba(0,0,0,0.08)] text-center text-[12px] text-[#8A8D9A]">
            Generated by Kin · Confidence: High · Sources verified
          </div>
        </Card>
      </div>
    </>
  );
}
