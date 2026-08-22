'use client';

import React, { useState, useEffect, useRef } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import KinCharacter from '@/components/ui/KinCharacter';
import { Send, Sparkles, MessageCircle, Info } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  quickReplies?: string[];
  created_at?: string;
}

export default function KinPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: "Hello! I'm Kin, your change-monitoring agent. 🐧\n\nI parse raw HTML, extract semantic differences, and summarize them for you. Ask me about changes in your watchlist, price alerts, or course additions!",
      quickReplies: [
        'What are the most important updates?',
        'Check for pricing or policy changes',
        'Scan my watchlist now',
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [signalsCount, setSignalsCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  async function fetchContextStats() {
    try {
      const wlRes = await fetch('/api/watchlist');
      const wl = await wlRes.json();
      if (wl.success) setWatchlistCount(wl.watchlist.length);

      const sigRes = await fetch('/api/signals');
      const sig = await sigRes.json();
      if (sig.success) setSignalsCount(sig.signals.length);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchContextStats();
  }, []);

  async function sendMessage(text?: string) {
    const content = text || input.trim();
    if (!content || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const history = messages
        .filter(m => m.id !== 'init')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          conversationHistory: history,
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          quickReplies: data.quickReplies,
          created_at: new Date().toISOString()
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: "I'm having a little trouble connecting right now, but I'm still keeping a close eye on your pages!",
          created_at: new Date().toISOString()
        }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <TopBar 
        title="Kin AI" 
        subtitle="Chat with your AI monitoring agent."
        unreadSignals={0}
      />
      
      <div className="p-7">
        <div 
          className="grid gap-5"
          style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            height: 'calc(100vh - 180px)',
            minHeight: 500
          }}
        >
          {/* Kin profile panel */}
          <Card className="p-[22px] text-center flex flex-col justify-between max-w-[320px] mx-auto w-full">
            <div>
              <div className="inline-block mt-4">
                <KinCharacter size={100} state={isTyping ? 'thinking' : 'listening'} />
              </div>
              <div className="mt-[14px]">
                <div className="text-[18px] font-bold">Kin</div>
                <div className="text-[12px] text-[#8A8D9A] mt-[2px]">Your AI monitoring agent</div>
              </div>
              
              <div className="mt-6 p-3.5 bg-[#FAFAF7] rounded-xl text-left border border-[rgba(0,0,0,0.03)]">
                <div className="text-[11px] font-semibold text-[#8A8D9A] uppercase tracking-[0.06em] mb-2">
                  Capabilities
                </div>
                <div className="flex flex-col gap-[6.5px] text-[12px] text-[#5A5D6B]">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[#059669]">✔</span> Change classification
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[#059669]">✔</span> HTML noise filtering
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[#059669]">✔</span> Plain-English summaries
                  </div>
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[#059669]">✔</span> Resend notifications
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3.5 rounded-xl text-left"
              style={{ background: 'rgba(45,95,138,0.06)', border: '1px solid rgba(45,95,138,0.12)' }}
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1"
                style={{ color: '#2D5F8A' }}
              >
                Monitoring Workspace
              </div>
              <div className="text-[12px] text-[#1A1A1E]">
                <b>{watchlistCount} sites</b> watched • <b>{signalsCount} signals</b> detected
              </div>
            </div>
          </Card>

          {/* Chat area */}
          <Card className="flex flex-col h-full overflow-hidden flex-1">
            <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.06)] flex items-center justify-between">
              <div>
                <div className="text-[15px] font-bold">Chat with Kin</div>
                <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                  Ask about your watchlist, signals, or request instant scans
                </div>
              </div>
              <div className="text-[11px] text-[#8A8D9A] flex items-center gap-1">
                <Sparkles size={12} className="text-[#2D5F8A]" /> Context Aware
              </div>
            </div>
            
            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-5 flex flex-col gap-4"
              style={{ background: '#FAFAF7' }}
            >
              {messages.map(msg => (
                <div key={msg.id} className="animate-msg-in">
                  {msg.role === 'user' ? (
                    <div className="chat-msg-user">{msg.content}</div>
                  ) : (
                    <div>
                      <div className="chat-msg-kin whitespace-pre-wrap">{msg.content}</div>
                      {msg.quickReplies && (
                        <div className="mt-[10px] flex flex-wrap gap-[6px]">
                          {msg.quickReplies.map((reply, i) => (
                            <button
                              key={i}
                              onClick={() => sendMessage(reply)}
                              className="inline-block px-[12px] py-[6px] bg-white border border-[rgba(0,0,0,0.08)] rounded-full text-[12px] text-[#2D5F8A] hover:border-[rgba(45,95,138,0.3)] hover:bg-[rgba(45,95,138,0.04)] transition-all font-semibold"
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="chat-msg-kin animate-msg-in">
                  <div className="flex items-center gap-1">
                    <span className="w-[5px] h-[5px] rounded-full bg-[#5A5D6B] animate-pulse-dot" />
                    <span className="w-[5px] h-[5px] rounded-full bg-[#5A5D6B] animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
                    <span className="w-[5px] h-[5px] rounded-full bg-[#5A5D6B] animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input */}
            <div className="px-4 py-[14px] border-t border-[rgba(0,0,0,0.06)] flex gap-[10px] bg-white">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Kin anything about your monitored sites..."
                className="flex-1 px-[14px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[14px] font-sans outline-none focus:border-[rgba(26,26,30,0.3)] focus:shadow-[0_0_0_3px_rgba(26,26,30,0.06)] transition-all"
              />
              <Button onClick={() => sendMessage()} disabled={!input.trim() || isTyping}>
                <Send size={16} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}