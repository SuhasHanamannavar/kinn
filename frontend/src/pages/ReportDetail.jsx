import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';

function ScoreGauge({ score }) {
  const getColor = () => {
    if (score >= 75) return '#34C759';
    if (score >= 60) return '#007AFF';
    if (score >= 45) return '#FF9500';
    return '#FF3B30';
  };

  const getGradient = () => {
    if (score >= 75) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-blue-400 to-blue-600';
    if (score >= 45) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-48 h-48 -rotate-90">
        <circle
          cx="96"
          cy="96"
          r="80"
          stroke="#E5E5EA"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="96"
          cy="96"
          r="80"
          stroke={getColor()}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-5xl font-bold bg-gradient-to-br ${getGradient()} bg-clip-text text-transparent`}>
          {score}
        </div>
        <div className="text-caption text-apple-textSecondary mt-1">Overall Score</div>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-apple bg-blue-50 flex items-center justify-center">
          <svg className="w-5 h-5 text-apple-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
        <h2 className="text-h3">{title}</h2>
      </div>
      <div className="text-body text-apple-textSecondary space-y-3">
        {children}
      </div>
    </div>
  );
}

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [id]);

  async function loadReport() {
    try {
      const data = await api.getReport(id);
      setReport(data.report);
      setCompany(data.report.companies);
    } catch (e) {
      console.error('Failed to load report:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (confirm('Delete this report?')) {
      try {
        await api.deleteReport(id);
        navigate('/reports');
      } catch (e) {
        alert('Failed to delete report');
      }
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto">
        <div className="card p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-apple-lg shimmer"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 w-64 shimmer rounded"></div>
              <div className="h-4 w-40 shimmer rounded"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-6">
              <div className="h-6 w-32 shimmer rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 w-full shimmer rounded"></div>
                <div className="h-4 w-5/6 shimmer rounded"></div>
                <div className="h-4 w-4/6 shimmer rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="card p-12 text-center max-w-xl mx-auto">
        <h2 className="text-h2 mb-2">Report not found</h2>
        <p className="text-secondary mb-6">This report may have been deleted or you don't have access.</p>
        <Link to="/reports" className="btn-secondary">Back to Reports</Link>
      </div>
    );
  }

  const getRecBadge = () => {
    if (report.recommendation?.includes('Buy')) return 'badge-green';
    if (report.recommendation?.includes('Hold')) return 'badge-orange';
    if (report.recommendation?.includes('Sell') || report.recommendation?.includes('Reduce')) return 'badge-red';
    return 'badge-gray';
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="card p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-apple-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-apple-text font-bold text-2xl flex-shrink-0">
            {report.ticker?.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-h2">{company?.name || report.title}</h1>
              <span className="badge badge-blue">{report.ticker}</span>
              {report.recommendation && (
                <span className={`badge ${getRecBadge()}`}>{report.recommendation}</span>
              )}
            </div>
            <div className="text-caption flex items-center gap-2 flex-wrap">
              {company?.sector && <span>{company.sector}</span>}
              {company?.industry && (
                <>
                  <span className="text-apple-gray3">•</span>
                  <span>{company.industry}</span>
                </>
              )}
              <span className="text-apple-gray3">•</span>
              <span>Generated {new Date(report.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/company/${report.ticker}`} className="btn-secondary">
              Company Profile
            </Link>
            <button onClick={handleDelete} className="p-2.5 rounded-pill bg-red-50 text-apple-red hover:bg-red-100 transition-colors" title="Delete">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Score & Conclusion */}
      <div className="card p-8 mb-6 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 border-0">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {report.overall_score !== undefined && (
            <ScoreGauge score={report.overall_score} />
          )}
          <div className="flex-1 text-center md:text-left">
            <div className="text-caption uppercase tracking-wider mb-2">Investment Conclusion</div>
            <p className="text-body text-apple-textSecondary leading-relaxed text-lg">
              {report.conclusion?.summary || report.conclusion}
            </p>
            {report.recommendation && (
              <div className="mt-4">
                <span className={`badge ${getRecBadge()} text-sm px-4 py-1.5`}>
                  Recommendation: {report.recommendation}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {report.key_metrics && (
        <div className="card p-6 mb-6">
          <h2 className="text-h3 mb-5">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {Object.entries(report.key_metrics).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-caption mb-1 capitalize">{key.replace(/_/g, ' ')}</div>
                <div className="text-lg font-semibold text-apple-text">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {report.company_overview && (
          <SectionCard
            title="Company Overview"
            icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          >
            {Object.entries(report.company_overview).map(([key, value]) => (
              <div key={key}>
                <div className="text-sm font-medium text-apple-text capitalize mb-1">{key.replace(/_/g, ' ')}</div>
                <p>{value}</p>
              </div>
            ))}
          </SectionCard>
        )}

        {report.product_technology && (
          <SectionCard
            title="Product & Technology"
            icon="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          >
            {Object.entries(report.product_technology).map(([key, value]) => (
              <div key={key}>
                <div className="text-sm font-medium text-apple-text capitalize mb-1">{key.replace(/_/g, ' ')}</div>
                <p>{value}</p>
              </div>
            ))}
          </SectionCard>
        )}

        {report.financial_fundamentals && (
          <SectionCard
            title="Financial Fundamentals"
            icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          >
            {Object.entries(report.financial_fundamentals).map(([key, value]) => (
              <div key={key}>
                <div className="text-sm font-medium text-apple-text capitalize mb-1">{key.replace(/_/g, ' ')}</div>
                <p>{value}</p>
              </div>
            ))}
          </SectionCard>
        )}

        {report.market_competition && (
          <SectionCard
            title="Market & Competition"
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          >
            {Object.entries(report.market_competition).map(([key, value]) => (
              <div key={key}>
                <div className="text-sm font-medium text-apple-text capitalize mb-1">{key.replace(/_/g, ' ')}</div>
                <p>{value}</p>
              </div>
            ))}
          </SectionCard>
        )}
      </div>

      {/* Catalysts & Risks */}
      {report.catalysts_risks && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-apple bg-green-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-apple-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-h3">Growth Catalysts</h2>
            </div>
            <ul className="space-y-3">
              {(report.catalysts_risks.growth_drivers || []).map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-apple-green" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-body text-apple-textSecondary">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-apple bg-orange-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-apple-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-h3">Risk Factors</h2>
            </div>
            <ul className="space-y-3">
              {(report.catalysts_risks.risks || []).map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-apple-orange" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-body text-apple-textSecondary">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
