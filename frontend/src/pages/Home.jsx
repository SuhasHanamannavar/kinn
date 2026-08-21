import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

const featuredCompanies = [
  { name: 'Apple Inc.', ticker: 'AAPL', sector: 'Technology', marketCap: '$2.8T' },
  { name: 'Microsoft', ticker: 'MSFT', sector: 'Technology', marketCap: '$3.2T' },
  { name: 'NVIDIA', ticker: 'NVDA', sector: 'Technology', marketCap: '$3.4T' },
  { name: 'Alphabet', ticker: 'GOOGL', sector: 'Technology', marketCap: '$2.1T' },
  { name: 'Amazon', ticker: 'AMZN', sector: 'Consumer', marketCap: '$1.9T' },
  { name: 'Tesla', ticker: 'TSLA', sector: 'Automotive', marketCap: '$800B' }
];

const features = [
  {
    title: 'Comprehensive Analysis',
    description: 'Deep-dive research reports covering financials, products, market position, and risks.',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  {
    title: 'Real-time Data',
    description: 'Powered by Bright Data for accurate, up-to-date company information and financials.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  {
    title: 'Secure & Private',
    description: 'Enterprise-grade authentication with Clerk. Your research stays private and secure.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
  },
  {
    title: 'Beautiful Reports',
    description: 'Apple-inspired design with clear visualizations and actionable insights.',
    icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01'
  }
];

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="text-center py-16 md:py-24">
        <div className="inline-flex items-center gap-2 badge badge-blue mb-6 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-apple-blue animate-pulse"></span>
          Professional Research Platform
        </div>
        
        <h1 className="text-h1 md:text-[64px] text-apple-text mb-6 animate-slide-up animate-delay-100">
          Research companies.<br />
          <span className="bg-gradient-to-r from-apple-blue via-apple-purple to-apple-pink bg-clip-text text-transparent">
            Invest with confidence.
          </span>
        </h1>
        
        <p className="text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-slide-up animate-delay-200">
          Kin delivers comprehensive company research reports powered by advanced data collection. 
          Make informed decisions with professional-grade analysis.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6 animate-slide-up animate-delay-300">
          <div className="relative">
            <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-apple-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company name or ticker symbol..."
              className="input-lg pl-14 pr-32 shadow-apple"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary">
              Search
            </button>
          </div>
        </form>

        <p className="text-caption animate-slide-up animate-delay-400">
          Try: <button onClick={() => navigate('/company/AAPL')} className="text-apple-blue hover:underline mx-1">AAPL</button>
          <button onClick={() => navigate('/company/MSFT')} className="text-apple-blue hover:underline mx-1">MSFT</button>
          <button onClick={() => navigate('/company/NVDA')} className="text-apple-blue hover:underline mx-1">NVDA</button>
        </p>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div key={feature.title} className="card p-6 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="w-12 h-12 rounded-apple bg-blue-50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-apple-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-h3 text-base mb-2">{feature.title}</h3>
              <p className="text-secondary text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-h2 mb-2">Featured Companies</h2>
            <p className="text-secondary">Explore research on leading public companies</p>
          </div>
          <Link to="/search" className="btn-ghost">
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredCompanies.map((company, i) => (
            <Link
              key={company.ticker}
              to={`/company/${company.ticker}`}
              className="card p-5 flex items-center gap-4 animate-slide-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-12 h-12 rounded-apple bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-apple-text font-bold text-lg">
                {company.ticker.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-apple-text truncate">{company.name}</div>
                <div className="text-caption flex items-center gap-2">
                  <span className="text-apple-blue font-medium">{company.ticker}</span>
                  <span className="text-apple-gray3">•</span>
                  <span>{company.sector}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-apple-text text-sm">{company.marketCap}</div>
                <div className="text-caption">Market Cap</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="card p-10 md:p-14 text-center bg-gradient-to-br from-apple-blue/5 via-white to-apple-purple/5 border-0">
          <SignedIn>
            <h2 className="text-h2 mb-4">Ready to start your research?</h2>
            <p className="text-secondary text-lg mb-8 max-w-xl mx-auto">
              Generate your first professional research report in seconds.
            </p>
            <Link to="/dashboard" className="btn-primary text-base px-8 py-3">
              Go to Dashboard
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </SignedIn>
          <SignedOut>
            <h2 className="text-h2 mb-4">Start researching companies today</h2>
            <p className="text-secondary text-lg mb-8 max-w-xl mx-auto">
              Create a free account to save your research reports and access your personalized dashboard.
            </p>
            <Link to="/search" className="btn-primary text-base px-8 py-3">
              Get Started Free
            </Link>
          </SignedOut>
        </div>
      </section>
    </div>
  );
}
