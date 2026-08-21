import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { api } from '../services/api.js';

export default function Dashboard() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const data = await api.getMyReports(20);
      setReports(data.reports || []);
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickResearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setGenerating(true);
    try {
      const data = await api.generateReport(searchQuery.toUpperCase(), searchQuery);
      if (data.report?.id) {
        navigate(`/reports/${data.report.id}`);
      }
    } catch (e) {
      alert('Failed to generate report: ' + e.message);
    } finally {
      setGenerating(false);
    }
  }

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-apple-green';
    if (score >= 60) return 'text-apple-blue';
    if (score >= 45) return 'text-apple-orange';
    return 'text-apple-red';
  };

  const getScoreBg = (score) => {
    if (score >= 75) return 'bg-green-50';
    if (score >= 60) return 'bg-blue-50';
    if (score >= 45) return 'bg-orange-50';
    return 'bg-red-50';
  };

  return (
    <div className="animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-10">
        <h1 className="text-h2 mb-2">
          Welcome back, {user?.firstName || 'Researcher'}
        </h1>
        <p className="text-secondary">Your research dashboard and recent reports</p>
      </div>

      {/* Quick Research */}
      <div className="card p-8 mb-8 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 border-0">
        <h2 className="text-h3 mb-2">Quick Research</h2>
        <p className="text-secondary mb-6">Generate a comprehensive research report for any public company</p>
        <form onSubmit={handleQuickResearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter ticker or company name (e.g., AAPL)"
              className="input pl-12"
            />
          </div>
          <button type="submit" disabled={generating} className="btn-primary whitespace-nowrap">
            {generating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Generate Report'
            )}
          </button>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-apple bg-blue-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-apple-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-apple-text">{reports.length}</div>
              <div className="text-caption">Total Reports</div>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-apple bg-green-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-apple-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-apple-text">
                {reports.filter(r => r.overall_score >= 60).length}
              </div>
              <div className="text-caption">Positive Outlook</div>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-apple bg-purple-50 flex items-center justify-center">
              <svg className="w-6 h-6 text-apple-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-apple-text">
                {reports.length > 0 ? Math.round(reports.reduce((a, r) => a + (r.overall_score || 0), 0) / reports.length) : 0}
              </div>
              <div className="text-caption">Avg. Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-apple-text">Recent Reports</h2>
        <Link to="/reports" className="btn-ghost text-sm">
          View All
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-apple shimmer"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-48 shimmer rounded"></div>
                  <div className="h-3 w-32 shimmer rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : reports.length > 0 ? (
        <div className="space-y-4">
          {reports.slice(0, 5).map((report, i) => (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className="card p-5 flex items-center gap-5 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-apple bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-apple-text font-bold text-lg flex-shrink-0">
                {report.ticker?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-apple-text truncate">
                  {report.companies?.name || report.title}
                </div>
                <div className="text-caption flex items-center gap-2">
                  <span className="text-apple-blue font-medium">{report.ticker}</span>
                  <span className="text-apple-gray3">•</span>
                  <span>{new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              {report.overall_score !== undefined && (
                <div className={`px-4 py-2 rounded-apple ${getScoreBg(report.overall_score)} text-right`}>
                  <div className={`text-xl font-bold ${getScoreColor(report.overall_score)}`}>
                    {report.overall_score}
                  </div>
                  <div className="text-caption">Score</div>
                </div>
              )}
              {report.recommendation && (
                <div className="hidden md:block text-right">
                  <div className={`badge ${
                    report.recommendation.includes('Buy') ? 'badge-green' :
                    report.recommendation.includes('Hold') ? 'badge-orange' :
                    report.recommendation.includes('Sell') || report.recommendation.includes('Reduce') ? 'badge-red' :
                    'badge-gray'
                  }`}>
                    {report.recommendation}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-apple-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-h3 mb-2">No reports yet</h3>
          <p className="text-secondary mb-6">Start by generating your first company research report.</p>
          <Link to="/search" className="btn-primary">
            Browse Companies
          </Link>
        </div>
      )}
    </div>
  );
}
