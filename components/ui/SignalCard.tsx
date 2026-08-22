import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Signal } from '@/types';
import { CategoryPill, ImportanceBadge } from './Badges';
import { ChevronDown } from 'lucide-react';

interface SignalCardProps {
  signal: Signal;
  onExpand?: (signal: Signal) => void;
  compact?: boolean;
}

export const SignalCard: React.FC<SignalCardProps> = ({ 
  signal, 
  compact = false 
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div 
      className={cn(
        'bg-white border border-[rgba(0,0,0,0.08)] rounded-[12px] overflow-hidden transition-all duration-250 cursor-pointer',
        'hover:border-[rgba(0,0,0,0.14)] hover:shadow-[0_3px_14px_rgba(0,0,0,0.04)]',
        signal.importance === 'high' && 'border-l-[3px] border-l-[#DC2626]'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-[16px_18px]">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <CategoryPill category={signal.category} label={signal.categoryName} />
          <ImportanceBadge level={signal.importance} label={signal.importanceLabel} />
          <span className="ml-auto text-[11px] text-[#8A8D9A]">{signal.time}</span>
        </div>
        
        <div className="font-bold text-[15px] text-[#1A1A1E] mb-[6px]">
          {signal.title}
        </div>
        
        {!compact && (
          <p className="text-[13.5px] text-[#5A5D6B] leading-[1.6] mb-3">
            {signal.summary}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] text-[#8A8D9A]">
            Source: {signal.site}
          </span>
          <ChevronDown 
            className={cn(
              'w-4 h-4 transition-transform duration-300 text-[#8A8D9A]',
              expanded && 'rotate-180'
            )} 
          />
        </div>
      </div>
      
      <div
        className={cn(
          'overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          expanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-[18px] pb-[18px] pt-0 border-t border-[rgba(0,0,0,0.06)]">
          {signal.why_it_matters && (
            <div 
              className="mt-4 p-[10px_12px] rounded-lg"
              style={{
                background: signal.importance === 'high' 
                  ? 'rgba(220,38,38,0.06)' 
                  : 'rgba(26,26,30,0.04)',
                border: signal.importance === 'high' 
                  ? '1px solid rgba(220,38,38,0.12)' 
                  : '1px solid rgba(0,0,0,0.06)',
              }}
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.05em] mb-[3px]"
                style={{ color: signal.importance === 'high' ? '#991B1B' : '#5A5D6B' }}
              >
                Why it matters
              </div>
              <div className="text-[12.5px] leading-[1.5]"
                style={{ color: signal.importance === 'high' ? '#7F1D1D' : '#5A5D6B' }}
              >
                {signal.why_it_matters}
              </div>
            </div>
          )}
          
          {signal.evidence && signal.evidence.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] font-semibold text-[#8A8D9A] uppercase tracking-[0.05em] mb-2">
                Evidence
              </div>
              <div className="flex flex-wrap gap-2">
                {signal.evidence.map((e, i) => (
                  <div 
                    key={i}
                    className="px-3 py-1.5 rounded-lg bg-[#FAFAF7] border border-[rgba(0,0,0,0.06)] text-[12px]"
                  >
                    <span className="text-[#8A8D9A]">{e.label}: </span>
                    <span className="font-medium text-[#1A1A1E]">{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignalCard;
