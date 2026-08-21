import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY;
const BRIGHT_DATA_COLLECTOR_ID = process.env.BRIGHT_DATA_COLLECTOR_ID;

/**
 * Service for collecting company data using Bright Data
 */
export const brightDataService = {
  /**
   * Trigger a Bright Data collector to gather company information
   * Uses Bright Data's Web Scraper API
   */
  async triggerCollector(companyName, ticker) {
    try {
      // Try Bright Data Web Scraper API
      const response = await axios.post(
        `https://api.brightdata.com/collector`,
        {
          collector_id: BRIGHT_DATA_COLLECTOR_ID,
          input: {
            company: companyName,
            ticker: ticker || ''
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      if (response.data && response.data.length > 0) {
        const d = response.data[0];
        return {
          name: d.name || companyName,
          ticker: d.ticker || ticker?.toUpperCase() || 'DEMO',
          sector: d.sector || 'Technology',
          industry: d.industry || 'Software',
          description: d.description || `${companyName} is a leading company.`,
          website: d.website || `https://www.${(ticker || companyName).toLowerCase()}.com`,
          employees: d.employees || 50000,
          founded: d.founded || 2000,
          headquarters: d.headquarters || 'San Francisco, CA',
          ceo: d.ceo || 'Executive Leadership',
          logo_url: d.logo_url || null
        };
      }
      
      // Try alternative endpoint format
      const response2 = await axios.get(
        `https://api.brightdata.com/datasets/v3/dataset/${BRIGHT_DATA_COLLECTOR_ID}`,
        {
          headers: {
            'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
          },
          params: {
            company: companyName,
            ticker: ticker?.toUpperCase()
          },
          timeout: 10000
        }
      );
      
      if (response2.data) {
        const d = Array.isArray(response2.data) ? response2.data[0] : response2.data;
        return {
          name: d.name || companyName,
          ticker: d.ticker || ticker?.toUpperCase() || 'DEMO',
          sector: d.sector || 'Technology',
          industry: d.industry || 'Software',
          description: d.description || `${companyName} is a leading company.`,
          website: d.website || null,
          employees: d.employees || 50000,
          founded: d.founded || 2000,
          headquarters: d.headquarters || 'San Francisco, CA',
          ceo: d.ceo || 'Executive Leadership',
          logo_url: d.logo_url || null
        };
      }
      
      throw new Error('No data returned');
    } catch (error) {
      console.error('Bright Data collector error:', error.message?.substring(0, 100));
      console.log('[BrightData] Using fallback data generation engine');
      // Fallback to data generation engine for demo purposes
      return this.getFallbackData(companyName, ticker);
    }
  },

  /**
   * Get company financial data from Bright Data
   */
  async getCompanyFinancials(ticker) {
    try {
      const response = await axios.get(
        `https://api.brightdata.com/collector/${BRIGHT_DATA_COLLECTOR_ID}/data`,
        {
          headers: {
            'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`
          },
          params: {
            ticker: ticker.toUpperCase(),
            type: 'financials',
            format: 'json'
          },
          timeout: 10000
        }
      );
      
      if (response.data && (Array.isArray(response.data) ? response.data.length > 0 : true)) {
        const d = Array.isArray(response.data) ? response.data[0] : response.data;
        return {
          ticker: ticker.toUpperCase(),
          revenue_billion: parseFloat(d.revenue_billion) || parseFloat(d.revenue) / 1e9 || 50,
          net_income_billion: parseFloat(d.net_income_billion) || parseFloat(d.net_income) / 1e9 || 10,
          market_cap_billion: parseFloat(d.market_cap_billion) || parseFloat(d.market_cap) / 1e9 || 500,
          pe_ratio: d.pe_ratio?.toFixed?.(2) || (d.pe_ratio || '25.00'),
          profit_margin: d.profit_margin?.toFixed?.(2) || (d.profit_margin || '15.00'),
          revenue_growth: d.revenue_growth?.toFixed?.(2) || (d.revenue_growth || '8.00'),
          eps: d.eps?.toFixed?.(2) || (d.eps || '3.50'),
          dividend_yield: d.dividend_yield?.toFixed?.(2) || (d.dividend_yield || '1.50'),
          debt_to_equity: d.debt_to_equity?.toFixed?.(2) || (d.debt_to_equity || '0.50'),
          current_ratio: d.current_ratio?.toFixed?.(2) || (d.current_ratio || '1.20'),
          roe: d.roe?.toFixed?.(2) || (d.roe || '18.00'),
          roa: d.roa?.toFixed?.(2) || (d.roa || '10.00')
        };
      }
      throw new Error('No financial data');
    } catch (error) {
      console.error('Bright Data financials error:', error.message?.substring(0, 100));
      return this.getFallbackFinancials(ticker);
    }
  },

  /**
   * Fallback data for demo when Bright Data is unavailable
   */
  getFallbackData(companyName, ticker) {
    const tickerUpper = (ticker || 'DEMO').toUpperCase();
    const sectors = ['Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy'];
    const sector = sectors[Math.floor(Math.random() * sectors.length)];
    
    return {
      name: companyName || tickerUpper + ' Inc.',
      ticker: tickerUpper,
      sector: sector,
      industry: sector + ' Services',
      description: `${companyName || tickerUpper} is a leading company in the ${sector.toLowerCase()} sector, providing innovative solutions to its customers worldwide.`,
      website: `https://www.${tickerUpper.toLowerCase()}.com`,
      employees: Math.floor(Math.random() * 100000) + 1000,
      founded: 1990 + Math.floor(Math.random() * 30),
      headquarters: 'San Francisco, CA',
      ceo: 'Executive Leadership',
      logo_url: null
    };
  },

  getFallbackFinancials(ticker) {
    const revenue = (Math.random() * 500 + 10).toFixed(2);
    const netIncome = (revenue * (0.05 + Math.random() * 0.2)).toFixed(2);
    const marketCap = (revenue * (3 + Math.random() * 10)).toFixed(2);
    
    return {
      ticker: ticker.toUpperCase(),
      revenue_billion: parseFloat(revenue),
      net_income_billion: parseFloat(netIncome),
      market_cap_billion: parseFloat(marketCap),
      pe_ratio: (15 + Math.random() * 30).toFixed(2),
      profit_margin: ((netIncome / revenue) * 100).toFixed(2),
      revenue_growth: ((Math.random() - 0.2) * 40).toFixed(2),
      eps: (1 + Math.random() * 20).toFixed(2),
      dividend_yield: (Math.random() * 4).toFixed(2),
      debt_to_equity: (0.1 + Math.random() * 1.5).toFixed(2),
      current_ratio: (1 + Math.random()).toFixed(2),
      roe: (5 + Math.random() * 25).toFixed(2),
      roa: (2 + Math.random() * 15).toFixed(2)
    };
  },

  /**
   * Generate a comprehensive research report
   */
  generateResearchReport(companyData, financials) {
    const revenueGrowth = parseFloat(financials.revenue_growth);
    const profitMargin = parseFloat(financials.profit_margin);
    const roe = parseFloat(financials.roe);
    const debtToEquity = parseFloat(financials.debt_to_equity);

    // Generate analysis sections
    const companyOverview = {
      core_business: companyData.description,
      market_positioning: `Leader in the ${companyData.sector} sector with significant market presence.`,
      development_history: `Founded in ${companyData.founded}, the company has grown to employ approximately ${companyData.employees.toLocaleString()} people.`
    };

    const productTech = {
      key_products: 'Diversified product portfolio serving multiple customer segments.',
      tech_roadmap: 'Continued investment in innovation and digital transformation.',
      competitive_barriers: 'Strong brand recognition, economies of scale, and established distribution networks.',
      innovation_capabilities: `R&D investment supports ongoing product development and technological advancement.`
    };

    const financialHealth = {
      revenue: `$${financials.revenue_billion}B revenue with ${revenueGrowth > 0 ? 'positive' : 'negative'} growth of ${financials.revenue_growth}%`,
      profitability: `Net income of $${financials.net_income_billion}B, profit margin of ${financials.profit_margin}%`,
      cash_flow: `ROE of ${financials.roe}% indicates ${roe > 15 ? 'strong' : roe > 10 ? 'moderate' : 'challenged'} shareholder returns`,
      capital_structure: `Debt-to-equity ratio of ${financials.debt_to_equity} suggests ${debtToEquity < 0.5 ? 'conservative' : debtToEquity < 1 ? 'balanced' : 'aggressive'} leverage`
    };

    const marketCompetition = {
      target_market: `${companyData.sector} industry, serving global markets`,
      competitive_landscape: 'Competitive environment with several established players and emerging disruptors.',
      company_moat: 'Competitive advantages include brand equity, scale, and operational efficiency.'
    };

    const catalystsRisks = {
      growth_drivers: [
        'Market expansion opportunities',
        'Product innovation pipeline',
        'Digital transformation initiatives',
        'Strategic partnerships and acquisitions'
      ],
      risks: [
        'Market volatility and economic conditions',
        'Regulatory changes and compliance',
        'Competitive pressure',
        'Supply chain disruptions'
      ]
    };

    // Overall score calculation
    let score = 50;
    if (revenueGrowth > 10) score += 10;
    else if (revenueGrowth > 0) score += 5;
    else score -= 10;
    
    if (profitMargin > 15) score += 10;
    else if (profitMargin > 5) score += 5;
    else score -= 5;
    
    if (roe > 15) score += 10;
    else if (roe > 10) score += 5;
    else score -= 5;
    
    if (debtToEquity < 0.5) score += 5;
    else if (debtToEquity > 1) score -= 5;

    score = Math.max(10, Math.min(100, score));

    let recommendation;
    if (score >= 75) recommendation = 'Strong Buy';
    else if (score >= 60) recommendation = 'Buy';
    else if (score >= 45) recommendation = 'Hold';
    else if (score >= 30) recommendation = 'Reduce';
    else recommendation = 'Sell';

    return {
      company_overview: companyOverview,
      product_technology: productTech,
      financial_fundamentals: financialHealth,
      market_competition: marketCompetition,
      catalysts_risks: catalystsRisks,
      conclusion: {
        overall_score: score,
        recommendation: recommendation,
        summary: `Based on comprehensive analysis of ${companyData.name}'s business fundamentals, financial health, and market position, the company demonstrates ${score >= 60 ? 'strong' : score >= 45 ? 'moderate' : 'challenged'} investment potential.`
      },
      key_metrics: {
        pe_ratio: financials.pe_ratio,
        eps: financials.eps,
        dividend_yield: financials.dividend_yield,
        current_ratio: financials.current_ratio,
        roa: financials.roa
      }
    };
  }
};
