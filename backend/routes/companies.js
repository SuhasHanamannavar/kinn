import express from 'express';
import { db } from '../services/supabase.js';
import { brightDataService } from '../services/brightdata.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Search companies
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 1) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Save search history if authenticated
    if (req.auth?.userId) {
      try {
        await db.saveSearch(req.auth.userId, q);
      } catch (e) {
        console.error('Failed to save search:', e.message);
      }
    }

    const results = await db.searchCompanies(q);
    res.json({ results, count: results.length });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// List companies
router.get('/', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const companies = await db.listCompanies(parseInt(limit), parseInt(offset));
    res.json({ companies, count: companies.length });
  } catch (error) {
    console.error('List companies error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get company by ticker
router.get('/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    let company = null;
    
    // Try to get from database first
    try {
      company = await db.getCompanyByTicker(ticker);
    } catch (dbError) {
      console.log('DB lookup failed (tables may not exist), proceeding with Bright Data:', dbError.message?.substring(0, 60));
    }

    if (!company) {
      // Fetch from Bright Data
      console.log(`[BrightData] Fetching company data for: ${ticker}`);
      const brightData = await brightDataService.triggerCollector(ticker, ticker);
      console.log(`[BrightData] Company data received: ${brightData.name}`);
      
      company = brightData;
      
      // Try to save to database (may fail if tables don't exist)
      try {
        const saved = await db.saveCompany({
          name: brightData.name,
          ticker: brightData.ticker,
          sector: brightData.sector,
          industry: brightData.industry,
          description: brightData.description,
          website: brightData.website,
          employees: brightData.employees,
          founded: brightData.founded,
          headquarters: brightData.headquarters,
          ceo: brightData.ceo,
          logo_url: brightData.logo_url
        });
        company = saved;
        console.log(`[DB] Company saved to database`);
      } catch (saveError) {
        console.log('[DB] Could not save to database (tables not initialized):', saveError.message?.substring(0, 60));
      }
    }

    // Get financial data from Bright Data
    console.log(`[BrightData] Fetching financials for: ${ticker}`);
    const financials = await brightDataService.getCompanyFinancials(ticker);
    console.log(`[BrightData] Financials received: Market Cap $${financials.market_cap_billion}B`);
    
    res.json({
      company,
      financials,
      data_source: 'bright_data'
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Failed to fetch company data', details: error.message });
  }
});

// Get search history (authenticated)
router.get('/history/recent', requireAuth, async (req, res) => {
  try {
    const history = await db.getSearchHistory(req.auth.userId);
    res.json({ history });
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

export default router;
