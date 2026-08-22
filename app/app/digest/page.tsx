'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Newspaper, Send, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DigestPage() {
  const [digest, setDigest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  async function fetchDigest() {
    try {
      const res = await fetch('/api/digest');
      const data = await res.json();
      if (data.success) {
        setDigest(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDigest();
  }, []);

  async function handleSendTestDigest() {
    setSendingEmail(true);
    setEmailStatus(null);
    try {
      const res = await fetch('/api/digest', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEmailStatus(`Digest email successfully sent to ${data.emailSentTo}!`);
      } else {
        setEmailStatus('Error sending digest email. Please check your Resend configuration.');
      }
    } catch (e) {
      console.error(e);
      setEmailStatus('Connection error sending test email.');
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <>
      <TopBar 
        title="Digest" 
        subtitle="Weekly intelligence brief compiled by Kin."
        unreadSignals={0}
      />
      
      <div className="p-7 max-w-[700px] mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="eyebrow">Weekly brief</div>
            <h1 className="section-title">Weekly Digest</h1>
            <p className="section-sub">
              Your Sunday morning summary of all website changes monitored by Kin.
            </p>
          </div>
          <Button 
            onClick={handleSendTestDigest} 
            loading={sendingEmail}
            className="flex items-center gap-1.5"
          >
            <Mail size={16} /> Send Test Email
          </Button>
        </div>

        {emailStatus && (
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 text-[13.5px] ${emailStatus.includes('Error') || emailStatus.includes('error') ? 'border-red-200 bg-red-50 text-red-900' : 'border-green-200 bg-green-50 text-green-900'}`}>
            {emailStatus.includes('Error') || emailStatus.includes('error') ? (
              <AlertCircle className="text-red-600 mt-[2px] flex-shrink-0" size={18} />
            ) : (
              <CheckCircle2 className="text-green-600 mt-[2px] flex-shrink-0" size={18} />
            )}
            <div>{emailStatus}</div>
          </div>
        )}

        <Card className="p-7">
          <div className="flex items-center gap-3 border-b border-[rgba(0,0,0,0.06)] pb-4 mb-5">
            <Newspaper className="text-[#2D5F8A]" size={22} />
            <div>
              <div className="text-[16px] font-bold text-[#1A1A1E]">Kin Intelligence Brief</div>
              <div className="text-[12px] text-[#8A8D9A] mt-[1px]">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="space-y-6 min-h-[150px]">
            {loading ? (
              <div className="text-center py-10 text-[#8A8D9A] text-[13.5px]">Compiling weekly updates...</div>
            ) : digest && digest.signals.length > 0 ? (
              digest.signals.map((signal: any) => (
                <div key={signal.id} className="pb-5 border-b border-[rgba(0,0,0,0.05)] last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#2D5F8A] px-2 py-0.5 bg-[rgba(45,95,138,0.08)] rounded-full">
                      {signal.category_name || signal.category}
                    </span>
                    {signal.importance === 'high' && (
                      <span className="text-[10px] font-bold uppercase text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        High Priority
                      </span>
                    )}
                    <span className="text-[11.5px] text-[#8A8D9A] ml-auto">{signal.site}</span>
                  </div>
                  <h4 className="text-[14.5px] font-bold text-[#1A1A1E] mb-1">{signal.title}</h4>
                  <p className="text-[13px] text-[#5A5D6B] leading-relaxed">{signal.summary}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-[#8A8D9A] text-[13.5px]">
                No monitored changes have been recorded this week yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}