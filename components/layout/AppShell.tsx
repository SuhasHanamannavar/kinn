'use client';

import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { AuthProvider } from '@/supabase/AuthProvider';

interface AppShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  unreadSignals?: number;
}

export const AppShell: React.FC<AppShellProps> = ({ 
  children, 
  title, 
  subtitle,
  unreadSignals = 0 
}) => {
  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-[#FAFAF7] text-[#1A1A1E] font-sans">
        <Sidebar unreadSignals={unreadSignals} />
        <main className="flex-1 min-w-0 flex flex-col max-h-screen overflow-y-auto">
          <TopBar 
            title={title} 
            subtitle={subtitle} 
            unreadSignals={unreadSignals} 
          />
          <div className="p-7 flex-1">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
};

export default AppShell;