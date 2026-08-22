import { redirect } from 'next/navigation';
import { createClient } from '@/supabase/server';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { AuthProvider } from '@/supabase/AuthProvider';
import { sampleSignals } from '@/lib/sample-data';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth/sign-in');
  }

  // Count unread signals
  const unreadCount = sampleSignals.filter(s => !s.read).length;

  return (
    <AuthProvider>
      <div className="flex min-h-screen bg-[#FAFAF7] text-[#1A1A1E] font-sans">
        <Sidebar unreadSignals={unreadCount} />
        <main className="flex-1 min-w-0 flex flex-col max-h-screen overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
