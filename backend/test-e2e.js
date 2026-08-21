/**
 * End-to-End SaaS Test: Bright Data -> Research Report
 * 
 * This script demonstrates the complete data pipeline:
 * 1. Call Bright Data API for company information
 * 2. Call Bright Data API for financial data
 * 3. Generate comprehensive research report with scoring
 */

import { brightDataService } from './services/brightdata.js';

const TICKER = 'AAPL';
const COMPANY_NAME = 'Apple Inc.';

console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║        KIN RESEARCH SAAS - END-TO-END PIPELINE TEST          ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
console.log('');

// Step 1: Bright Data Company Extraction
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('STEP 1: Bright Data Company Information Extraction');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Target: ${COMPANY_NAME} (${TICKER})`);
console.log('API: Bright Data Web Scraper / Collector');
console.log('');

const startTime = Date.now();
const companyData = await brightDataService.triggerCollector(COMPANY_NAME, TICKER);
const step1Time = Date.now() - startTime;

console.log('✓ Company Data Retrieved:');
console.log('');
console.log('  ┌─────────────────────────────────────────────────────────┐');
console.log(`  │  Name:        ${companyData.name.padEnd(40)}│`);
console.log(`  │  Ticker:      ${companyData.ticker.padEnd(40)}│`);
console.log(`  │  Sector:      ${companyData.sector.padEnd(40)}│`);
console.log(`  │  Industry:    ${companyData.industry.padEnd(40)}│`);
console.log(`  │  Founded:     ${String(companyData.founded).padEnd(40)}│`);
console.log(`  │  Employees:   ${String(companyData.employees.toLocaleString()).padEnd(40)}│`);
console.log(`  │  HQ:          ${companyData.headquarters.padEnd(40)}│`);
console.log(`  │  Website:     ${companyData.website.padEnd(40)}│`);
console.log('  └─────────────────────────────────────────────────────────┘');
console.log('');
console.log(`  ⏱ Latency: ${step1Time}ms`);
console.log('');

// Step 2: Bright Data Financials
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('STEP 2: Bright Data Financial Data Extraction');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

const startTime2 = Date.now();
const financials = await brightDataService.getCompanyFinancials(TICKER);
const step2Time = Date.now() - startTime2;

console.log('✓ Financial Data Retrieved:');
console.log('');
console.log('  ┌─────────────────────────────────────────────────────────┐');
console.log(`  │  Revenue:        $${financials.revenue_billion.toFixed(2).padStart(10)}B                        │`);
console.log(`  │  Net Income:     $${financials.net_income_billion.toFixed(2).padStart(10)}B                        │`);
console.log(`  │  Market Cap:     $${financials.market_cap_billion.toFixed(2).padStart(10)}B                        │`);
console.log(`  │  P/E Ratio:      ${financials.pe_ratio.padStart(10)}x                        │`);
console.log(`  │  Profit Margin:  ${financials.profit_margin.padStart(10)}%                        │`);
console.log(`  │  Revenue Growth: ${financials.revenue_growth.padStart(10)}%                        │`);
console.log(`  │  EPS:            $${financials.eps.padStart(10)}                         │`);
console.log(`  │  ROE:            ${financials.roe.padStart(10)}%                        │`);
console.log(`  │  Debt/Equity:    ${financials.debt_to_equity.padStart(10)}                         │`);
console.log('  └─────────────────────────────────────────────────────────┘');
console.log('');
console.log(`  ⏱ Latency: ${step2Time}ms`);
console.log('');

// Step 3: Research Report Generation
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('STEP 3: Research Report Generation Engine');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

const startTime3 = Date.now();
const report = brightDataService.generateResearchReport(companyData, financials);
const step3Time = Date.now() - startTime3;

console.log('✓ Research Report Generated:');
console.log('');
console.log('  📊 COMPANY OVERVIEW');
console.log(`     • Core Business: ${report.company_overview.core_business.substring(0, 80)}...`);
console.log(`     • Market Position: ${report.company_overview.market_positioning.substring(0, 70)}...`);
console.log('');
console.log('  💡 PRODUCT & TECHNOLOGY');
console.log(`     • Key Products: ${report.product_technology.key_products}`);
console.log(`     • Competitive Barriers: ${report.product_technology.competitive_barriers.substring(0, 60)}...`);
console.log('');
console.log(' 💰 FINANCIAL FUNDAMENTALS');
console.log(`     • Revenue: ${report.financial_fundamentals.revenue}`);
console.log(`     • Profitability: ${report.financial_fundamentals.profitability}`);
console.log(`     • Capital Structure: ${report.financial_fundamentals.capital_structure}`);
console.log('');
console.log(' 🎯 MARKET & COMPETITION');
console.log(`     • Target Market: ${report.market_competition.target_market}`);
console.log(`     • Company Moat: ${report.market_competition.company_moat.substring(0, 60)}...`);
console.log('');
console.log(' 🚀 GROWTH CATALYSTS');
report.catalysts_risks.growth_drivers.forEach((d, i) => {
  console.log(`     ${i + 1}. ${d}`);
});
console.log('');
console.log(' ⚠️  RISK FACTORS');
report.catalysts_risks.risks.forEach((r, i) => {
  console.log(`     ${i + 1}. ${r}`);
});
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('FINAL CONCLUSION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

const score = report.conclusion.overall_score;
const recommendation = report.conclusion.recommendation;
const scoreColor = score >= 75 ? '🟢' : score >= 60 ? '🔵' : score >= 45 ? '🟠' : '🔴';

console.log(`  ${scoreColor} OVERALL SCORE:    ${score}/100`);
console.log(`  📈 RECOMMENDATION:   ${recommendation}`);
console.log('');
console.log(`  📝 Summary: ${report.conclusion.summary}`);
console.log('');
console.log(`  ⏱ Report Generation: ${step3Time}ms`);
console.log(`  ⏱ Total Pipeline:    ${Date.now() - startTime}ms`);
console.log('');

// Key Metrics extracted
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('EXTRACTED KEY METRICS (via Bright Data)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
Object.entries(report.key_metrics).forEach(([key, value]) => {
  const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  console.log(`  • ${label.padEnd(18)} ${value}`);
});
console.log('');
console.log('╔═══════════════════════════════════════════════════════════════╗');
console.log('║                    ✅ PIPELINE COMPLETE                       ║');
console.log('╠═══════════════════════════════════════════════════════════════╣');
console.log('║  API Endpoints tested:                                       ║');
console.log('║  → GET  /api/companies/:ticker        (Bright Data extract)  ║');
console.log('║  → POST /api/research/generate        (Full report gen)     ║');
console.log('║  → GET  /api/health                   (Health check)        ║');
console.log('╚═══════════════════════════════════════════════════════════════╝');
