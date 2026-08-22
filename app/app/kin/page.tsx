'use client';

import React, { useState, useRef, useEffect } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import KinCharacter from '@/components/ui/KinCharacter';
import Button from '@/components/ui/Button';
import { sampleSignals } from '@/lib/sample-data';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  quickReplies?: string[];
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "👋 Hi! I'm Kin. I've been monitoring your watchlist and found 8 meaningful signals this week. What would you like to know?",
    quickReplies: [
      "What's the most important signal?",
      "Summarize all deadline changes",
      "What changed on Stanford's site?"
    ]
  }
];

export default function KinAIPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unreadCount = sampleSignals.filter(s => !s.read).length;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('important') || msg.includes('most')) {
      return "The most important signal right now is **Stanford's application deadline moving from March 1 to February 15**. That's two weeks less than expected. If you or someone you know is applying, prioritize this immediately.\n\nSecond most important: **Vercel Pro pricing increased 25%** ($20 → $25) with a new Enterprise tier. Review your cloud costs.";
    }
    
    if (msg.includes('deadline')) {
      return "Here are the deadline changes I found:\n\n• **Stanford Admissions** — Regular decision moved from March 1 to **Feb 15** (14 days earlier)\n\nThis is classified as HIGH importance because it directly impacts application timelines. Would you like me to set a reminder for the new deadline?";
    }
    
    if (msg.includes('stanford')) {
      return "On Stanford's admissions site, I detected one significant change:\n\n📅 **Deadline Change** — Regular decision shifted from **March 1 → February 15**\n\nThis is a HIGH importance signal because:\n• It's a 14-day reduction in preparation time\n• Application deadlines are typically firm\n• Missing this would mean automatic disqualification\n\nRecommendation: Start or accelerate your application immediately.";
    }
    
    if (msg.includes('pricing') || msg.includes('cost') || msg.includes('price')) {
      return "I found two pricing-related changes:\n\n💰 **Vercel** — Pro plan increased from $20 to $25/mo (25%)\n💰 **Stripe Billing** — Volume-based discounts now available at 100K+ transactions\n\nThe Vercel increase is HIGH importance if you're on their Pro tier. The Stripe change could save you money if you cross the volume threshold.";
    }
    
    if (msg.includes('hackathon') || msg.includes('course') || msg.includes('learn')) {
      return "Great opportunities I found this week:\n\n🎯 **Devpost** — 3 new hackathons posted:\n• AI/ML Competition ($50K prizes)\n• Climate Tech Challenge\n• Student Design Jam\n\n📚 **Coursera** — 12 new Generative AI courses from Stanford and DeepLearning.AI covering LLMs, prompt engineering, diffusion models, and AI ethics.\n\nWant me to summarize any of these in more detail?";
    }
    
    return `I've analyzed your question about "${userMessage}". Based on my monitoring of ${sampleSignals.length} signals across your watchlist, here's what I found relevant:\n\nThe key themes this week have been deadline changes, pricing updates, and new educational content. Is there a specific site or category you'd like me to focus on?`;
  };

  const sendMessage = async (text?: string) => {
    const content = text || input.trim();
    if (!content || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(content)
      };
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

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
        unreadSignals={unreadCount}
      />
      
      <div className="p-7">
        <div 
          className="grid gap-5"
          style={{ 
            gridTemplateColumns: '280px 1fr',
            height: 'calc(100vh - 180px)',
            minHeight: 500
          }}
        >
          {/* Kin profile panel */}
          <Card className="p-[22px] text-center">
            <div className="inline-block">
              <KinCharacter size={100} state="listening" />
            </div>
            <div className="mt-[14px]">
              <div className="text-[18px] font-bold">Kin</div>
              <div className="text-[12px] text-[#8A8D9A] mt-[2px]">Your AI monitoring agent</div>
            </div>
            
            <div className="mt-4 p-3 bg-[#FAFAF7] rounded-lg text-left">
              <div className="text-[11px] font-semibold text-[#8A8D9A] uppercase tracking-[0.06em] mb-2">
                Capabilities
              </div>
              <div className="flex flex-col gap-[6px] text-[12px] text-[#5A5D6B]">
                <div className="flex items-center gap-[6px]">
                  <span className="text-[#059669]">✓</span> Website change detection
                </div>
                <div className="flex items-center gap-[6px]">
                  <span className="text-[#059669]">✓</span> Importance classification
                </div>
                <div className="flex items-center gap-[6px]">
                  <span className="text-[#059669]">✓</span> Plain-English summaries
                </div>
                <div className="flex items-center gap-[6px]">
                  <span className="text-[#059669]">✓</span> Signal correlation
                </div>
                <div className="flex items-center gap-[6px]">
                  <span className="text-[#059669]">✓</span> Answers in context
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-lg text-left"
              style={{ background: 'rgba(45,95,138,0.06)', border: '1px solid rgba(45,95,138,0.12)' }}
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-1"
                style={{ color: '#2D5F8A' }}
              >
                Currently monitoring
              </div>
              <div className="text-[12px] text-[#1A1A1E]">
                <b>5 websites</b> · <b>8 signals</b> detected
              </div>
            </div>
          </Card>

          {/* Chat area */}
          <Card className="flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-[rgba(0,0,0,0.06)]">
              <div className="text-[15px] font-bold">Chat with Kin</div>
              <div className="text-[12px] text-[#8A8D9A] mt-[2px]">
                Ask about your signals, monitored sites, or what changed
              </div>
            </div>
            
            {/* Messages */}
            <div 
              className="flex-1 overflow-y-auto p-5 flex flex-col gap-3"
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
                              className="inline-block px-[10px] py-[5px] bg-white border border-[rgba(0,0,0,0.08)] rounded-full text-[12px] text-[#2D5F8A] hover:border-[rgba(45,95,138,0.3)] hover:bg-[rgba(45,95,138,0.04)] transition-all"
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
            <div className="px-4 py-[14px] border-t border-[rgba(0,0,0,0.06)] flex gap-[10px]">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Kin anything about your signals…"
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
