import React from 'react';
import { cn } from '@/lib/utils';
import type { SignalCategory, ImportanceLevel } from '@/types';

interface CategoryPillProps {
  category: SignalCategory;
  label: string;
  className?: string;
}

const categoryStyles: Record<SignalCategory, string> = {
  content: 'bg-[rgba(8,145,178,0.08)] text-[#0E7490] border-[rgba(8,145,178,0.15)]',
  pricing: 'bg-[rgba(217,119,6,0.08)] text-[#92400E] border-[rgba(217,119,6,0.15)]',
  policy: 'bg-[rgba(124,58,237,0.08)] text-[#5B21B6] border-[rgba(124,58,237,0.15)]',
  feature: 'bg-[rgba(5,150,105,0.08)] text-[#065F46] border-[rgba(5,150,105,0.15)]',
  announce: 'bg-[rgba(190,24,93,0.08)] text-[#9D174D] border-[rgba(190,24,93,0.15)]',
  deadline: 'bg-[rgba(220,38,38,0.08)] text-[#991B1B] border-[rgba(220,38,38,0.15)]',
};

export const CategoryPill: React.FC<CategoryPillProps> = ({ 
  category, 
  label, 
  className 
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-[10px] py-[3px] rounded-full text-[11px] font-semibold border tracking-[0.01em]',
        categoryStyles[category],
        className
      )}
    >
      {label}
    </span>
  );
};

interface ImportanceBadgeProps {
  level: ImportanceLevel;
  label: string;
}

export const ImportanceBadge: React.FC<ImportanceBadgeProps> = ({ level, label }) => {
  const styles: Record<ImportanceLevel, string> = {
    high: 'text-[#DC2626] font-bold',
    med: 'text-[#D97706] font-semibold',
    low: 'text-[#6B7280] font-medium',
  };
  
  return (
    <span className={cn('text-[11px]', styles[level])}>
      ● {label}
    </span>
  );
};

interface FilterChipProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export const FilterChip: React.FC<FilterChipProps> = ({ 
  active, 
  onClick, 
  children 
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-[14px] py-[6px] rounded-full border text-[12px] font-medium whitespace-nowrap transition-all duration-200 font-inherit cursor-pointer',
        active 
          ? 'bg-[#1A1A1E] text-white border-[#1A1A1E]' 
          : 'bg-transparent text-[#5A5D6B] border-[rgba(0,0,0,0.1)] hover:border-[rgba(0,0,0,0.2)] hover:text-[#1A1A1E]'
      )}
    >
      {children}
    </button>
  );
};

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ 
  checked, 
  onChange, 
  disabled 
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative w-10 h-[22px] rounded-full transition-colors duration-200 flex-shrink-0',
        checked ? 'bg-[#1A1A1E]' : 'bg-[rgba(0,0,0,0.15)]',
        disabled && 'opacity-50 cursor-not-allowed',
        !disabled && 'cursor-pointer'
      )}
    >
      <span
        className={cn(
          'absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-200',
          checked && 'translate-x-[18px]'
        )}
      />
    </button>
  );
};

export default CategoryPill;
