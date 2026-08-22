'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';
import { useAuth } from '@/supabase/AuthProvider';

interface TopBarProps {
  title: string;
  subtitle?: string;
  unreadSignals?: number;
  onSearch?: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  title, 
  subtitle,
  unreadSignals = 0,
}) => {
  const { user } = useAuth();
  const initials = user?.email 
    ? user.email.split('@')[0].substring(0, 2).toUpperCase() 
    : 'AK';

  return (
    <header 
      className="bg-white border-b border-[rgba(0,0,0,0.06)] px-7 py-[14px] flex items-center gap-4 flex-shrink-0 sticky top-0 z-10"
    >
      <div className="min-w-0">
        <div className="text-[18px] font-bold tracking-tight">{title}</div>
        {subtitle && (
          <div className="text-[12px] text-[#8A8D9A] mt-[1px]">{subtitle}</div>
        )}
      </div>
      
      <div className="ml-auto flex items-center gap-3">
        {/* Search */}
        <div 
          className="flex items-center bg-white border border-[rgba(0,0,0,0.1)] rounded-[10px] px-3 transition-all duration-180 focus-within:border-[rgba(0,0,0,0.2)] focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.04)]"
          style={{ width: 280 }}
        >
          <Search size={16} strokeWidth={2} className="text-[#8A8D9A] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search signals, URLs…"
            className="flex-1 border-none outline-none bg-transparent px-2 py-[9px] text-[13px] font-sans text-[#1A1A1E] placeholder:text-[#8A8D9A]"
          />
        </div>

        {/* Notifications */}
        <button 
          className="w-9 h-9 rounded-[10px] border border-[rgba(0,0,0,0.08)] bg-white flex items-center justify-center relative hover:bg-[rgba(0,0,0,0.02)] transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={2} className="text-[#5A5D6B]" />
          {unreadSignals > 0 && (
            <span 
              className="absolute top-[6px] right-[6px] w-[7px] h-[7px] rounded-full bg-[#DC2626] border-2 border-white"
            />
          )}
        </button>

        {/* User avatar */}
        <div 
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[13px] cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}
          title={user?.email || 'User'}
        >
          {initials}
        </div>
      </div>
    </header>
  );
};

export default TopBar;