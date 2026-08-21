import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { api } from '../services/api.js';

function formatMarketCap(value) {
  if (!value) return 'N/A';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
}

export default function CompanyDetail() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCompany();
  }, [ticker]);

  async function loadCompany() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCompany(ticker);
      setCompany(data.company);
      setFinancials(data.financials);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function generateReport() {
    setGenerating(true);
    try {
      const data = await api.generateReport(ticker, company?.name);
      if (data.report?.id) {
        navigate(`/reports/${data.report.id}`);
      }
    } catch (e) {
      alert('Failed to generate report: ' + e.message);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="card p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-apple-lg shimmer"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 w-48 shimmer rounded"></div>
              <div className="h-4 w-32 shimmer rounded"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5">
              <div className="h-3 w-16 shimmer rounded mb-2"></div>
              <div className="h-6 w-24 shimmer rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="card p-12 text-center">
        <h2 className="text-h2 mb-2">Company not found</h2>
        <p className="text-secondary mb-6">Could not load data for {ticker}</p>
        <button onClick={() => navigate('/search')} className="btn-secondary">
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Company Header */}
      <div className="card p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-20 h-20 rounded-apple-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-apple-text font-bold text-3xl flex-shrink-0">
            {company.ticker?.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h1 className="text-h2">{company.name}</h1>
              <span className="badge badge-blue text-sm">{company.ticker}</span>
            </div>
            <div className="flex items-center gap-3 text-secondary flex-wrap">
              {company.sector && <span>{company.sector}</span>}
              {company.industry && (
                <>
                  <span className="text-apple-gray3">•</span>
                  <span>{company.industry}</span>
                </>
              )}
              {company.headquarters && (
                <>
                  <span className="text-apple-gray3">•</span>
                  <span>{company.headquarters}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <SignedIn>
              <button
                onClick={generateReport}
                disabled={generating}
                className="btn-primary"
              >
                {generating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Generate Report
                  </>
                )}
              </button>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="btn-primary">
                  Sign In to Research
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>

      {/* Financial Snapshot */}
      {financials && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card p-5">
            <div className="text-caption mb-1">Market Cap</div>
            <div className="text-xl font-semibold text-apple-text">
              ${financials.market_cap_billion?.toFixed(2)}B
            </div>
          </div>
          <div className="card p-5">
            <div className="text-caption mb-1">Revenue</div>
            <div className="text-xl font-semibold text-apple-text">
              ${financials.revenue_billion?.toFixed(2)}B
            </div>
          </div>
          <div className="card p-5">
            <div className="text-caption mb-1">P/E Ratio</div>
            <div className="text-xl font-semibold text-apple-text">
              {financials.pe_ratio}
            </div>
          </div>
          <div className="card p-5">
            <div className="text-caption mb-1">Profit Margin</div>
            <div className={`text-xl font-semibold ${parseFloat(financials.profit_margin) > 10 ? 'text-apple-green' : parseFloat(financials.profit_margin) > 0 ? 'text-apple-orange' : 'text-apple-red'}`}>
              {financials.profit_margin}%
            </div>
          </div>
        </div>
      )}

      {/* Company Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Description */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-h3 mb-4">About</h2>
          <p className="text-body text-apple-textSecondary leading-relaxed">
            {company.description || 'No description available.'}
          </p>
        </div>

        {/* Key Info */}
        <div className="card p-6">
          <h2 className="text-h3 mb-4">Key Information</h2>
          <div className="space-y-4">
            {company.website && (
              <div className="flex justify-between items-center">
                <span className="text-caption">Website</span>
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-apple-blue hover:underline truncate max-w-[180px]">
                  {company.website.replace('https://', '')}
                </a>
              </div>
            )}
            {company.founded && (
              <div className="flex justify-between items-center">
                <span className="text-caption">Founded</span>
                <span className="text-sm font-medium">{company.founded}</span>
              </div>
            )}
            {company.employees && (
              <div className="flex justify-between items-center">
                <span className="text-caption">Employees</span>
                <span className="text-sm font-medium">{company.employees.toLocaleString()}</span>
              </div>
            )}
            {company.ceo && (
              <div className="flex justify-between items-center">
                <span className="text-caption">CEO</span>
                <span className="text-sm font-medium">{company.ceo}</span>
              </div>
            )}
            {company.market_cap && (
              <div className="flex justify-between items-center">
                <span className="text-caption">Market Cap</span>
                <span className="text-sm font-medium">{formatMarketCap(company.market_cap)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      {financials && (
        <div className="card p-6 mt-6">
          <h2 className="text-h3 mb-6">Financial Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { label: 'Net Income', value: `$${financials.net_income_billion?.toFixed(2)}B` },
              { label: 'Revenue Growth', value: `${financials.revenue_growth}%`, positive: parseFloat(financials.revenue_growth) > 0 },
              { label: 'EPS', value: `$${financials.eps}` },
              { label: 'Dividend Yield', value: `${financials.dividend_yield}%` },
              { label: 'ROE', value: `${financials.roe}%`, positive: parseFloat(financials.roe) > 15 },
              { label: 'Current Ratio', value: financials.current_ratio }
            ].map((metric) => (
              <div key={metric.label}>
                <div className="text-caption mb-1">{metric.label}</div>
                <div className={`text-lg font-semibold ${
                  metric.positive === undefined ? 'text-apple-text' : 
                  metric.positive ? 'text-apple-green' : 'text-apple-red'
                }`}>
                  {metric.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
