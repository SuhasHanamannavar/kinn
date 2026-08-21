import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database operations
export const db = {
  // Company operations
  async saveCompany(companyData) {
    const { data, error } = await supabase
      .from('companies')
      .upsert(companyData, { onConflict: 'ticker' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getCompanyByTicker(ticker) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('ticker', ticker.toUpperCase())
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async searchCompanies(query) {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, ticker, sector, industry, logo_url')
      .or(`name.ilike.%${query}%,ticker.ilike.%${query}%`)
      .limit(20);
    if (error) throw error;
    return data;
  },

  async listCompanies(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, ticker, sector, industry, market_cap, logo_url, updated_at')
      .order('market_cap', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw error;
    return data;
  },

  // Research report operations
  async saveReport(reportData) {
    const { data, error } = await supabase
      .from('research_reports')
      .insert(reportData)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getReportsByUser(userId, limit = 20) {
    const { data, error } = await supabase
      .from('research_reports')
      .select(`
        *,
        companies (name, ticker, logo_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getReportById(reportId, userId) {
    const { data, error } = await supabase
      .from('research_reports')
      .select(`
        *,
        companies (*)
      `)
      .eq('id', reportId)
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async deleteReport(reportId, userId) {
    const { error } = await supabase
      .from('research_reports')
      .delete()
      .eq('id', reportId)
      .eq('user_id', userId);
    if (error) throw error;
    return true;
  },

  // User operations
  async upsertUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Search history
  async saveSearch(userId, query) {
    const { data, error } = await supabase
      .from('search_history')
      .insert({ user_id: userId, query })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getSearchHistory(userId, limit = 10) {
    const { data, error } = await supabase
      .from('search_history')
      .select('query, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  }
};
