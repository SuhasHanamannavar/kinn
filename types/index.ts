export type SignalCategory = 
  | 'content' 
  | 'pricing' 
  | 'policy' 
  | 'feature' 
  | 'announce' 
  | 'deadline';

export type ImportanceLevel = 'high' | 'med' | 'low';

export type ScanStatus = 'watching' | 'paused' | 'error' | 'scanning';

export interface Signal {
  id: string;
  category: SignalCategory;
  categoryName: string;
  importance: ImportanceLevel;
  importanceLabel: string;
  site: string;
  url_id: string;
  time: string;
  detected_at: string;
  title: string;
  summary: string;
  why_it_matters: string;
  evidence: { label: string; value: string }[];
  raw_diff?: string;
  ai_summary?: string;
  read: boolean;
}

export interface MonitoredUrl {
  id: string;
  user_id: string;
  name: string;
  url: string;
  category: string;
  scan_frequency: 'daily' | '12h' | 'hourly' | 'weekly';
  status: ScanStatus;
  last_scan: string | null;
  last_signal_at: string | null;
  signal_count: number;
  created_at: string;
  is_active: boolean;
  noise_sensitivity: 'balanced' | 'conservative' | 'aggressive';
}

export interface Snapshot {
  id: string;
  url_id: string;
  content_hash: string;
  raw_html: string;
  text_content: string;
  status: 'success' | 'error';
  scraped_at: string;
  error_message?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  email_alerts: boolean;
  weekly_digest: boolean;
  only_high_importance: boolean;
  scan_frequency: 'daily' | '12h' | 'hourly' | 'weekly';
  noise_sensitivity: 'balanced' | 'conservative' | 'aggressive';
  ai_tone: 'simple' | 'detailed' | 'executive';
  include_raw_evidence: boolean;
  digest_day: 'sunday' | 'monday' | 'friday';
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  urls_used: number;
  urls_limit: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  context?: {
    signal_ids?: string[];
    url_ids?: string[];
  };
}

export type KinState = 
  | 'idle' 
  | 'listening' 
  | 'scanning' 
  | 'analyzing' 
  | 'found' 
  | 'important' 
  | 'thinking';
