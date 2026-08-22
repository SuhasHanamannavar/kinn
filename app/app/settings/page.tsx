'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import { Toggle } from '@/components/ui/Badges';
import { useAuth } from '@/supabase/AuthProvider';

export default function SettingsPage() {
  const { user, signOut } = useAuth();

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [onlyHighImportance, setOnlyHighImportance] = useState(false);
  const [scanFrequency, setScanFrequency] = useState('daily');
  const [noiseSensitivity, setNoiseSensitivity] = useState('balanced');
  const [aiTone, setAiTone] = useState('simple');
  const [includeRawEvidence, setIncludeRawEvidence] = useState(true);
  const [saving, setSaving] = useState(false);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        const s = data.settings;
        setEmailAlerts(s.email_alerts !== false);
        setWeeklyDigest(s.weekly_digest !== false);
        setOnlyHighImportance(!!s.only_high_importance);
        setScanFrequency(s.scan_frequency || 'daily');
        setNoiseSensitivity(s.noise_sensitivity || 'balanced');
        setAiTone(s.ai_tone || 'simple');
        setIncludeRawEvidence(s.include_raw_evidence !== false);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchSettings();
  }, []);

  async function handleSaveSettings() {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email_alerts: emailAlerts,
          weekly_digest: weeklyDigest,
          only_high_importance: onlyHighImportance,
          scan_frequency: scanFrequency,
          noise_sensitivity: noiseSensitivity,
          ai_tone: aiTone,
          include_raw_evidence: includeRawEvidence,
        }),
      });
      await res.json();
      alert('Settings saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  const initials = user?.email 
    ? user.email.split('@')[0].substring(0, 2).toUpperCase() 
    : 'AK';

  return (
    <>
      <TopBar 
        title="Settings" 
        subtitle="Configure how Kin monitors, analyzes, and notifies you."
        unreadSignals={0}
      />
      
      <div className="p-7 max-w-[680px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="eyebrow">Preferences</div>
            <h1 className="section-title">Settings</h1>
            <p className="section-sub">
              Customize change detection parameters, alerting profiles, and Groq-LPU summaries.
            </p>
          </div>
          <Button onClick={handleSaveSettings} loading={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Notifications */}
          <Card className="p-[22px]">
            <div className="text-[15px] font-bold mb-4">Notifications</div>
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Email Alerts</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Get an email when Kin detects a meaningful change
                  </div>
                </div>
                <Toggle checked={emailAlerts} onChange={setEmailAlerts} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Weekly Digest</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Sunday morning summary of all signals from the week
                  </div>
                </div>
                <Toggle checked={weeklyDigest} onChange={setWeeklyDigest} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Only High Importance</div>
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
                  <div className="text-[13.5px] font-semibold">Scan Frequency</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    How often Kin checks your watchlist
                  </div>
                </div>
                <Select
                  value={scanFrequency}
                  onChange={(e) => setScanFrequency(e.target.value)}
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
                  <div className="text-[13.5px] font-semibold">Noise Sensitivity</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Balanced = standard; Conservative = ignore tiny updates; Aggressive = catch minor changes
                  </div>
                </div>
                <Select
                  value={noiseSensitivity}
                  onChange={(e) => setNoiseSensitivity(e.target.value)}
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
                  <div className="text-[13.5px] font-semibold">Summary Tone</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    How Kin phrases its explanations
                  </div>
                </div>
                <Select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                  options={[
                    { value: 'simple', label: 'Simple & clear' },
                    { value: 'detailed', label: 'Detailed & thorough' },
                    { value: 'executive', label: 'Executive brief' },
                  ]}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13.5px] font-semibold">Include Raw Evidence</div>
                  <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                    Show diff text comparisons in signal details
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
                <div className="font-semibold">{user?.email?.split('@')[0] || 'Guest User'}</div>
                <div className="text-[12.5px] text-[#8A8D9A]">{user?.email || 'guest@workspace.local'}</div>
              </div>
            </div>
            
            <div className="flex gap-[10px] flex-wrap">
              <Button variant="danger" onClick={() => signOut()}>Sign Out</Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}