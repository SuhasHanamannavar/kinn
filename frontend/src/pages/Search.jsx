import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Load popular companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Search when URL param changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  async function loadCompanies() {
    try {
      const data = await api.getCompanies(20);
      setCompanies(data.companies || []);
    } catch (e) {
      console.error('Failed to load companies:', e);
    }
  }

  async function performSearch(q) {
    if (!q.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.searchCompanies(q);
      setResults(data.results || []);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const displayResults = searched ? results : companies;
  const displayTitle = searched ? `Results for "${query}"` : 'Popular Companies';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-h2 mb-2">Company Search</h1>
        <p className="text-secondary">Find and research public companies</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="relative max-w-3xl">
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by company name or ticker (e.g., AAPL, Microsoft)..."
            className="input-lg pl-14 pr-4 shadow-card"
          />
        </div>
      </form>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-apple-text">{displayTitle}</h2>
          {searched && (
            <span className="text-caption">{results.length} found</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-apple shimmer"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 shimmer rounded"></div>
                    <div className="h-3 w-24 shimmer rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayResults.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayResults.map((company, i) => (
              <Link
                key={company.id || company.ticker}
                to={`/company/${company.ticker}`}
                className="card p-5 flex items-center gap-4 animate-slide-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="w-12 h-12 rounded-apple bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-apple-text font-bold text-lg flex-shrink-0">
                  {company.ticker?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-apple-text truncate">{company.name}</div>
                  <div className="text-caption flex items-center gap-2 flex-wrap">
                    <span className="text-apple-blue font-medium">{company.ticker}</span>
                    {company.sector && (
                      <>
                        <span className="text-apple-gray3">•</span>
                        <span>{company.sector}</span>
                      </>
                    )}
                    {company.industry && (
                      <>
                        <span className="text-apple-gray3">•</span>
                        <span className="truncate">{company.industry}</span>
                      </>
                    )}
                  </div>
                </div>
                <svg className="w-5 h-5 text-apple-gray3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-apple-gray6 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-apple-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </div>
            <h3 className="text-h3 mb-2">No results found</h3>
            <p className="text-secondary">Try searching with a different company name or ticker symbol.</p>
          </div>
        )}
      </div>
    </div>
  );
}
