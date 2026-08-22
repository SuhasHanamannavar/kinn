import fs from 'fs';
import path from 'path';
import { createServiceClient } from '@/supabase/server';

const DATA_DIR = path.join(process.cwd(), 'scratch', 'data');
const WATCHLIST_FILE = path.join(DATA_DIR, 'watchlist.json');
const SIGNALS_FILE = path.join(DATA_DIR, 'signals.json');
const SNAPSHOTS_FILE = path.join(DATA_DIR, 'snapshots.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile(filePath: string, defaultValue: any) {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
    return defaultValue;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return defaultValue;
  }
}

function writeJsonFile(filePath: string, data: any) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const serviceClient = createServiceClient();
    const { error } = await serviceClient.from('monitored_urls').select('count', { count: 'exact', head: true });
    if (error && error.message.includes('relation "public.monitored_urls" does not exist')) {
      return false; // Database exists but tables aren't created yet
    }
    return !error;
  } catch (e) {
    return false;
  }
}

// Local Fallback Storage helpers
export const localDb = {
  getWatchlist: () => readJsonFile(WATCHLIST_FILE, []),
  saveWatchlist: (data: any) => writeJsonFile(WATCHLIST_FILE, data),
  
  getSignals: () => readJsonFile(SIGNALS_FILE, []),
  saveSignals: (data: any) => writeJsonFile(SIGNALS_FILE, data),

  getSnapshots: () => readJsonFile(SNAPSHOTS_FILE, []),
  saveSnapshots: (data: any) => writeJsonFile(SNAPSHOTS_FILE, data),

  getSettings: () => readJsonFile(SETTINGS_FILE, {
    email_alerts: true,
    weekly_digest: true,
    only_high_importance: false,
    scan_frequency: 'daily',
    noise_sensitivity: 'balanced',
    ai_tone: 'simple',
    include_raw_evidence: true,
    digest_day: 'sunday',
  }),
  saveSettings: (data: any) => writeJsonFile(SETTINGS_FILE, data),

  getMessages: () => readJsonFile(MESSAGES_FILE, []),
  saveMessages: (data: any) => writeJsonFile(MESSAGES_FILE, data),
};