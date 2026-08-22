'use client';

import React, { useEffect, useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Plus, Trash2, Pause, Play, RefreshCw, AlertCircle, Database } from 'lucide-react';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isFallback, setIsFallback] = useState(false);

  // Form states
  const [newUrl, setNewUrl] = useState('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Technology');
  const [adding, setAdding] = useState(false);
  const [scanningId, setScanningId] = useState<string | null>(null);

  async function fetchWatchlist() {
    try {
      const res = await fetch('/api/watchlist');
      const data = await res.json();
      if (data.success) {
        setWatchlist(data.watchlist || []);
        if (data.fallback) setIsFallback(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWatchlist();
  }, []);

  async function handleAddUrl(e: React.FormEvent) {
    e.preventDefault();
    if (!newUrl) return;
    setAdding(true);
    try {
      const res = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          url: newUrl,
          category: newCategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewUrl('');
        setNewName('');
        setShowAddModal(false);
        fetchWatchlist();
      } else {
        alert(data.error || 'Failed to add URL');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAdding(false);
    }
  }

  async function handleToggleStatus(item: any) {
    try {
      const newStatus = item.status === 'paused' ? 'watching' : 'paused';
      const res = await fetch('/api/watchlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchWatchlist();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm('Are you sure you want to delete this URL from your watchlist?')) return;
    try {
      const res = await fetch(`/api/watchlist?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchWatchlist();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleScanSingle(id: string) {
    setScanningId(id);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url_id: id }),
      });
      const data = await res.json();
      if (data.success) {
        fetchWatchlist();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanningId(null);
    }
  }

  function getSiteName(url: string) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  const categories = ['Technology', 'Pricing', 'Education', 'Policy', 'Research', 'Other'];

  return (
    <>
      <TopBar 
        title="Watchlist" 
        subtitle="Manage URLs Kin is currently monitoring."
        unreadSignals={0}
      />
      
      <div className="p-7">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="eyebrow">Monitored sites</div>
            <h1 className="section-title">Your Watchlist</h1>
            <p className="section-sub">
              Kin monitors these websites on your schedule, checking for visual, text, and structure differences.
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5">
            <Plus size={16} /> Add URL
          </Button>
        </div>

        {/* Fallback notice */}
        {isFallback && (
          <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3 text-[13.5px]">
            <Database className="text-amber-600 mt-[2px] flex-shrink-0" size={18} />
            <div className="flex-1">
              <span className="font-bold">Local Workspace Fallback:</span> Any updates here are saved locally on the Vercel/local workspace instance. To persistent save in a live Supabase PostgreSQL database, paste <code className="bg-amber-100 px-1 py-0.5 rounded text-red-700 font-mono text-[12px]">supabase/schema.sql</code> into the Supabase SQL editor.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {watchlist.map(url => {
            const isScanning = scanningId === url.id || url.status === 'scanning';
            return (
              <Card key={url.id} className="p-5 flex flex-col justify-between min-h-[220px]">
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}
                    >
                      {url.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#1A1A1E] truncate">{url.name}</div>
                      <div className="text-[12px] text-[#8A8D9A] truncate mt-[2px]">
                        {getSiteName(url.url)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#8A8D9A]">Category</span>
                      <span className="font-medium text-[#1A1A1E]">{url.category}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#8A8D9A]">Scan Frequency</span>
                      <span className="font-medium capitalize text-[#1A1A1E]">{url.scan_frequency || 'daily'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#8A8D9A]">Last Scan</span>
                      <span className="font-medium text-[#1A1A1E]">
                        {url.last_scan ? new Date(url.last_scan).toLocaleString() : 'never'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#059669] animate-pulse" />
                    <span className="text-[12px] text-[#5A5D6B] font-semibold capitalize">{url.status}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleScanSingle(url.id)}
                      disabled={isScanning}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5A5D6B] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
                      title="Scan Now"
                    >
                      <RefreshCw size={14} className={isScanning ? 'animate-spin' : ''} />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(url)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5A5D6B] hover:bg-[rgba(0,0,0,0.05)] transition-colors"
                      title={url.status === 'paused' ? 'Resume' : 'Pause'}
                    >
                      {url.status === 'paused' ? <Play size={14} /> : <Pause size={14} />}
                    </button>
                    <button
                      onClick={() => handleRemove(url.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8A8D9A] hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.06)] transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}

          <button
            onClick={() => setShowAddModal(true)}
            className="min-h-[220px] p-5 rounded-[14px] border-2 border-dashed border-[rgba(0,0,0,0.1)] hover:border-[rgba(26,26,30,0.3)] hover:bg-white transition-all flex flex-col items-center justify-center gap-3 text-[#8A8D9A] hover:text-[#1A1A1E]"
          >
            <div className="w-10 h-10 rounded-full bg-[rgba(0,0,0,0.04)] flex items-center justify-center">
              <Plus size={20} />
            </div>
            <div className="font-medium text-[13px]">Add new URL</div>
          </button>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay animate-overlay-in" onClick={() => setShowAddModal(false)}>
          <div className="modal animate-modal-in" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleAddUrl}>
              <div className="px-6 py-6 border-b border-[rgba(0,0,0,0.06)]">
                <div className="text-[18px] font-bold">Add a URL to watch</div>
                <div className="text-[13px] text-[#8A8D9A] mt-[3px]">
                  Kin will scrape, clean, and monitor this site for changes automatically.
                </div>
              </div>
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#5A5D6B] mb-[6px]">Website URL</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com"
                    required
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    className="w-full px-[14px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[14px] font-sans text-[#1A1A1E] bg-white outline-none focus:border-[rgba(26,26,30,0.3)] focus:shadow-[0_0_0_3px_rgba(26,26,30,0.06)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#5A5D6B] mb-[6px]">Label / Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. OpenAI Pricing"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-[14px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[14px] font-sans text-[#1A1A1E] bg-white outline-none focus:border-[rgba(26,26,30,0.3)] focus:shadow-[0_0_0_3px_rgba(26,26,30,0.06)] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[12.5px] font-semibold text-[#5A5D6B] mb-[6px]">Category</label>
                  <select 
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-[14px] py-[10px] border border-[rgba(0,0,0,0.12)] rounded-[10px] text-[13px] font-sans text-[#1A1A1E] bg-white outline-none cursor-pointer"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[rgba(0,0,0,0.06)] flex gap-[10px] justify-end">
                <Button variant="ghost" onClick={() => setShowAddModal(false)} type="button">Cancel</Button>
                <Button type="submit" loading={adding}>Add to watchlist</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}