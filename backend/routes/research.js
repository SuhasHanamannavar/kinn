import express from 'express';
import { db } from '../services/supabase.js';
import { brightDataService } from '../services/brightdata.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Generate research report for a company
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { ticker, companyName } = req.body;

    if (!ticker && !companyName) {
      return res.status(400).json({ error: 'Ticker or company name is required' });
    }

    const searchTicker = ticker || companyName;
    console.log(`[Research] Generating report for: ${searchTicker}`);

    // Get or create company data
    let company = null;
    try {
      company = await db.getCompanyByTicker(searchTicker);
    } catch (dbError) {
      console.log('[Research] DB lookup skipped:', dbError.message?.substring(0, 60));
    }
    
    if (!company) {
      console.log(`[BrightData] Triggering collector for: ${companyName || searchTicker}`);
      const brightData = await brightDataService.triggerCollector(companyName || searchTicker, searchTicker);
      console.log(`[BrightData] Collector returned: ${brightData.name} (${brightData.ticker})`);
      
      company = brightData;
      
      // Try to save
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
      } catch (e) {
        console.log('[Research] DB save skipped (tables not initialized)');
      }
    }

    // Get financial data
    console.log(`[BrightData] Fetching financials for: ${company.ticker}`);
    const financials = await brightDataService.getCompanyFinancials(company.ticker);
    console.log(`[BrightData] Financials: Revenue $${financials.revenue_billion}B, Margin ${financials.profit_margin}%`);

    // Generate research report
    console.log(`[Engine] Generating comprehensive research report...`);
    const report = brightDataService.generateResearchReport(company, financials);
    console.log(`[Engine] Report generated - Score: ${report.conclusion.overall_score}, Recommendation: ${report.conclusion.recommendation}`);

    // Save report to database (may fail if tables don't exist)
    let savedReport = {
      id: 'temp-' + Date.now(),
      user_id: req.auth.userId,
      ticker: company.ticker,
      title: `${company.name} (${company.ticker}) - Research Report`,
      ...report,
      overall_score: report.conclusion.overall_score,
      recommendation: report.conclusion.recommendation,
      created_at: new Date().toISOString()
    };

    try {
      const dbReport = await db.saveReport({
        user_id: req.auth.userId,
        company_id: company.id || null,
        ticker: company.ticker,
        title: `${company.name} (${company.ticker}) - Research Report`,
        company_overview: report.company_overview,
        product_technology: report.product_technology,
        financial_fundamentals: report.financial_fundamentals,
        market_competition: report.market_competition,
        catalysts_risks: report.catalysts_risks,
        conclusion: report.conclusion,
        key_metrics: report.key_metrics,
        financial_snapshot: financials,
        overall_score: report.conclusion.overall_score,
        recommendation: report.conclusion.recommendation
      });
      savedReport = dbReport;
      console.log(`[DB] Report saved with ID: ${dbReport.id}`);
    } catch (saveError) {
      console.log('[DB] Report save skipped (tables not initialized):', saveError.message?.substring(0, 60));
    }

    res.json({
      success: true,
      report: savedReport,
      company,
      financials,
      data_source: 'bright_data',
      pipeline: ['bright_data_collector', 'financials_engine', 'research_analyzer']
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ error: 'Failed to generate research report', details: error.message });
  }
});

// Get all reports for current user
router.get('/my', requireAuth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const reports = await db.getReportsByUser(req.auth.userId, parseInt(limit));
    res.json({ reports, count: reports.length });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get specific report
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const report = await db.getReportById(id, req.auth.userId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Delete a report
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.deleteReport(id, req.auth.userId);
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

export default router;
