'use client';

import React, { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Badges';
import { sampleSignals } from '@/lib/sample-data';
import { useAuth } from '@/supabase/AuthProvider';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const unreadCount = sampleSignals.filter(s => !s.read).length;

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [onlyHighImportance, setOnlyHighImportance] = useState(false);
  const [includeRawEvidence, setIncludeRawEvidence] = useState(true);

  const initials = user?.email 
    ? user.email.split('@')[0].substring(0, 2).toUpperCase() 
    : 'AK';

  return (
    <>
      <TopBar 
        title="Settings" 
        subtitle="Configure how Kin monitors, analyzes, and notifies you."
        unreadSignals={unreadCount}
      />
      
      <div className="p-7">
        <div className="mb-6">
          <div className="eyebrow">Preferences</div>
          <h1 className="section-title">Settings</h1>
          <p className="section-sub">
            Configure monitoring, notifications, and preferences.
          </p>
        </div>

        <div className="flex flex-col gap-4 max-w-[680px]">
          {/* Notifications */}
          <Card className="p-[22px]">
            <div className="text-[15px] font-bold mb-4">Notifications</div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Email alerts</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Get an email when Kin detects a meaningful change
                  </div>
                </div>
                <Toggle checked={emailAlerts} onChange={setEmailAlerts} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Weekly digest</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Sunday morning summary of all signals from the week
                  </div>
                </div>
                <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Only high importance</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Don't notify me about low-importance signals
                  </div>
                </div>
                <Toggle checked={onlyHighImportance} onChange={setOnlyHighImportance} />
              </div>
            </div>
          </Card>

          {/* Monitoring */}
          <Card className="p-[22px]">
            <div className="text-[15px] font-bold mb-4">Monitoring</div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Scan frequency</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    How often Kin checks your watchlist
                  </div>
                </div>
                <Select
                  defaultValue="daily"
                  options={[
                    { value: 'daily', label: 'Daily (recommended)' },
                    { value: '12h', label: 'Every 12 hours' },
                    { value: 'hourly', label: 'Hourly' },
                    { value: 'weekly', label: 'Weekly' },
                  ]}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Noise sensitivity</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Higher = fewer signals but only the most meaningful changes
                  </div>
                </div>
                <Select
                  defaultValue="balanced"
                  options={[
                    { value: 'balanced', label: 'Balanced' },
                    { value: 'conservative', label: 'Conservative (fewer signals)' },
                    { value: 'aggressive', label: 'Aggressive (more signals)' },
                  ]}
                />
              </div>
            </div>
          </Card>

          {/* Kin AI */}
          <Card className="p-[22px]">
            <div className="text-[15px] font-bold mb-4">Kin AI</div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Summary tone</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    How Kin phrases its explanations
                  </div>
                </div>
                <Select
                  defaultValue="simple"
                  options={[
                    { value: 'simple', label: 'Simple & clear' },
                    { value: 'detailed', label: 'Detailed & thorough' },
                    { value: 'executive', label: 'Executive brief' },
                  ]}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Include raw evidence</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Show before/after data in signal details
                  </div>
                </div>
                <Toggle checked={includeRawEvidence} onChange={setIncludeRawEvidence} />
              </div>
            </div>
          </Card>

          {/* Account */}
          <Card className="p-[22px]">
            <div className="text-[15px] font-bold mb-4">Account</div>
            
            <div className="flex items-center gap-[14px] mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-[17px]"
                style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}
              >
                {initials}
              </div>
              <div>
                <div className="font-semibold">{user?.email?.split('@')[0] || 'Alex Kim'}</div>
                <div className="text-[12.5px] text-[#8A8D9A]">{user?.email || 'alex@example.com'}</div>
              </div>
            </div>
            
            <div className="flex gap-[10px] flex-wrap">
              <Button variant="ghost">Edit profile</Button>
              <Button variant="ghost">Manage subscription</Button>
              <Button variant="danger" onClick={() => signOut()}>Sign out</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
