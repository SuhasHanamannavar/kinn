import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-[10px] transition-all duration-180 font-inherit border cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-[#1A1A1E] text-white border-transparent hover:bg-[#2A2A32] hover:-translate-y-px active:scale-[0.98]',
    ghost: 'bg-transparent text-[#5A5D6B] border-[rgba(0,0,0,0.12)] hover:border-[rgba(0,0,0,0.22)] hover:text-[#1A1A1E]',
    danger: 'bg-[rgba(220,38,38,0.08)] text-[#DC2626] border-[rgba(220,38,38,0.15)] hover:bg-[rgba(220,38,38,0.12)]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-[18px] py-[9px] text-[13px]',
    lg: 'px-[22px] py-[11px] text-[14px]',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-thinking-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
