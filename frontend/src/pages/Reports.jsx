import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const data = await api.getMyReports(50);
      setReports(data.reports || []);
    } catch (e) {
      console.error('Failed to load reports:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, e) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this report?')) {
      try {
        await api.deleteReport(id);
        setReports(reports.filter(r => r.id !== id));
      } catch (e) {
        alert('Failed to delete report');
      }
    }
  }

  const filteredReports = reports.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'buy') return r.recommendation?.includes('Buy');
    if (filter === 'hold') return r.recommendation?.includes('Hold');
    if (filter === 'sell') return r.recommendation?.includes('Sell') || r.recommendation?.includes('Reduce');
    return true;
  });

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h2 mb-2">My Reports</h1>
          <p className="text-secondary">Your saved company research reports</p>
        </div>
        <Link to="/search" className="btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          New Research
        </Link>
      </div>

      {/* Filter */}
      <div className="segmented mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'buy', label: 'Buy' },
          { key: 'hold', label: 'Hold' },
          { key: 'sell', label: 'Sell' }
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`segmented-item ${filter === item.key ? 'active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
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
      ) : filteredReports.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((report, i) => (
            <Link
              key={report.id}
              to={`/reports/${report.id}`}
              className="card p-5 flex items-center gap-5 group animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-apple bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-apple-text font-bold text-lg flex-shrink-0">
                {report.ticker?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-apple-text truncate">
                  {report.companies?.name || report.title}
                </div>
                <div className="text-caption flex items-center gap-2 flex-wrap">
                  <span className="text-apple-blue font-medium">{report.ticker}</span>
                  <span className="text-apple-gray3">•</span>
                  <span>{new Date(report.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  {report.companies?.sector && (
                    <>
                      <span className="text-apple-gray3">•</span>
                      <span>{report.companies.sector}</span>
                    </>
                  )}
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
                <div className={`badge ${
                  report.recommendation.includes('Buy') ? 'badge-green' :
                  report.recommendation.includes('Hold') ? 'badge-orange' :
                  report.recommendation.includes('Sell') || report.recommendation.includes('Reduce') ? 'badge-red' :
                  'badge-gray'
                } hidden sm:inline-flex`}>
                  {report.recommendation}
                </div>
              )}
              <button
                onClick={(e) => handleDelete(report.id, e)}
                className="p-2 rounded-lg text-apple-gray hover:text-apple-red hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete report"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-apple-gray6 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-apple-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-h3 mb-2">No reports found</h3>
          <p className="text-secondary mb-6">
            {filter !== 'all' ? 'No reports match this filter.' : 'Start researching companies to build your portfolio.'}
          </p>
          <Link to="/search" className="btn-primary">
            Start Researching
          </Link>
        </div>
      )}
    </div>
  );
}
