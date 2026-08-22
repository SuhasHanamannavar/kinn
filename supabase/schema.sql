-- ============================================================
-- Kin — Database Schema
-- Website Change Monitoring SaaS
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Profiles table (extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  urls_used INTEGER NOT NULL DEFAULT 0,
  urls_limit INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on user signup
CREATE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- User Settings
-- ============================================================
CREATE TABLE public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email_alerts BOOLEAN NOT NULL DEFAULT true,
  weekly_digest BOOLEAN NOT NULL DEFAULT true,
  only_high_importance BOOLEAN NOT NULL DEFAULT false,
  scan_frequency TEXT NOT NULL DEFAULT 'daily' 
    CHECK (scan_frequency IN ('daily', '12h', 'hourly', 'weekly')),
  noise_sensitivity TEXT NOT NULL DEFAULT 'balanced'
    CHECK (noise_sensitivity IN ('balanced', 'conservative', 'aggressive')),
  ai_tone TEXT NOT NULL DEFAULT 'simple'
    CHECK (ai_tone IN ('simple', 'detailed', 'executive')),
  include_raw_evidence BOOLEAN NOT NULL DEFAULT true,
  digest_day TEXT NOT NULL DEFAULT 'sunday'
    CHECK (digest_day IN ('sunday', 'monday', 'friday')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-create settings on user signup
CREATE FUNCTION public.handle_new_user_settings() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_settings
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();

-- ============================================================
-- Monitored URLs (Watchlist)
-- ============================================================
CREATE TABLE public.monitored_urls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Other',
  scan_frequency TEXT NOT NULL DEFAULT 'daily'
    CHECK (scan_frequency IN ('daily', '12h', 'hourly', 'weekly')),
  status TEXT NOT NULL DEFAULT 'watching'
    CHECK (status IN ('watching', 'paused', 'error', 'scanning')),
  last_scan TIMESTAMPTZ,
  last_signal_at TIMESTAMPTZ,
  signal_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  noise_sensitivity TEXT DEFAULT 'balanced'
    CHECK (noise_sensitivity IN ('balanced', 'conservative', 'aggressive')),
  last_content_hash TEXT,
  brightdata_collector_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, normalized_url)
);

CREATE INDEX idx_monitored_urls_user_id ON public.monitored_urls(user_id);
CREATE INDEX idx_monitored_urls_status ON public.monitored_urls(status);
CREATE INDEX idx_monitored_urls_last_scan ON public.monitored_urls(last_scan);

ALTER TABLE public.monitored_urls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own URLs" ON public.monitored_urls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own URLs" ON public.monitored_urls
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    (
      SELECT urls_used < urls_limit 
      FROM public.profiles 
      WHERE id = user_id
    )
  );

CREATE POLICY "Users can update own URLs" ON public.monitored_urls
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own URLs" ON public.monitored_urls
  FOR DELETE USING (auth.uid() = user_id);

-- Update urls_used count in profiles
CREATE FUNCTION public.update_urls_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET urls_used = urls_used + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET urls_used = urls_used - 1 WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_urls_count
  AFTER INSERT OR DELETE ON public.monitored_urls
  FOR EACH ROW EXECUTE FUNCTION public.update_urls_count();

-- ============================================================
-- Snapshots (scraped content history)
-- ============================================================
CREATE TABLE public.snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url_id UUID REFERENCES public.monitored_urls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_hash TEXT NOT NULL,
  raw_html TEXT,
  text_content TEXT,
  status TEXT NOT NULL DEFAULT 'success'
    CHECK (status IN ('success', 'error')),
  error_message TEXT,
  scraped_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_snapshots_url_id ON public.snapshots(url_id);
CREATE INDEX idx_snapshots_scraped_at ON public.snapshots(scraped_at DESC);

ALTER TABLE public.snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots" ON public.snapshots
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- Signals (detected changes)
-- ============================================================
CREATE TABLE public.signals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  url_id UUID REFERENCES public.monitored_urls(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  snapshot_from_id UUID REFERENCES public.snapshots(id),
  snapshot_to_id UUID REFERENCES public.snapshots(id),
  category TEXT NOT NULL
    CHECK (category IN ('content', 'pricing', 'policy', 'feature', 'announce', 'deadline')),
  category_name TEXT NOT NULL,
  importance TEXT NOT NULL DEFAULT 'med'
    CHECK (importance IN ('high', 'med', 'low')),
  importance_label TEXT NOT NULL DEFAULT 'MED',
  site TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  why_it_matters TEXT,
  evidence JSONB DEFAULT '[]'::jsonb,
  raw_diff TEXT,
  ai_summary TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  notified BOOLEAN NOT NULL DEFAULT false,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_signals_user_id ON public.signals(user_id);
CREATE INDEX idx_signals_url_id ON public.signals(url_id);
CREATE INDEX idx_signals_detected_at ON public.signals(detected_at DESC);
CREATE INDEX idx_signals_read ON public.signals(read);
CREATE INDEX idx_signals_importance ON public.signals(importance);

ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own signals" ON public.signals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own signals" ON public.signals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own signals" ON public.signals
  FOR DELETE USING (auth.uid() = user_id);

-- Update signal_count in monitored_urls
CREATE FUNCTION public.update_signal_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.monitored_urls 
    SET signal_count = signal_count + 1, last_signal_at = NOW() 
    WHERE id = NEW.url_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_signal_count
  AFTER INSERT ON public.signals
  FOR EACH ROW EXECUTE FUNCTION public.update_signal_count();

-- ============================================================
-- Chat messages (Kin AI conversations)
-- ============================================================
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at ASC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- API Keys storage (encrypted via pgcrypto)
-- ============================================================
-- Note: For production, use Supabase Vault instead
-- This table is for user-provided integration keys

-- ============================================================
-- Updated timestamps trigger
-- ============================================================
CREATE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_urls_updated_at
  BEFORE UPDATE ON public.monitored_urls
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- pg_cron Jobs — Scheduled Scraping
-- ============================================================

-- Daily scraping trigger — runs every day at 6 AM UTC
-- Calls the Edge Function to process all URLs due for scanning
SELECT cron.schedule(
  'daily-scraping-trigger',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.edge_function_url') || '/trigger-scraping',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', current_setting('app.service_role_key')
    ),
    body := '{"frequency": "daily"}'::jsonb
  );
  $$
);

-- 12-hour scraping trigger
SELECT cron.schedule(
  '12h-scraping-trigger',
  '0 */12 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.edge_function_url') || '/trigger-scraping',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', current_setting('app.service_role_key')
    ),
    body := '{"frequency": "12h"}'::jsonb
  );
  $$
);

-- Hourly scraping trigger
SELECT cron.schedule(
  'hourly-scraping-trigger',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.edge_function_url') || '/trigger-scraping',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', current_setting('app.service_role_key')
    ),
    body := '{"frequency": "hourly"}'::jsonb
  );
  $$
);

-- Weekly digest — Sunday at 8 AM UTC
SELECT cron.schedule(
  'weekly-digest',
  '0 8 * * 0',
  $$
  SELECT net.http_post(
    url := current_setting('app.edge_function_url') || '/send-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', current_setting('app.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- Snapshot cleanup — keep only last 5 snapshots per URL, runs daily at 3 AM
SELECT cron.schedule(
  'cleanup-old-snapshots',
  '0 3 * * *',
  $$
  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY url_id ORDER BY scraped_at DESC) as rn
    FROM public.snapshots
  )
  DELETE FROM public.snapshots WHERE id IN (
    SELECT id FROM ranked WHERE rn > 5
  );
  $$
);
