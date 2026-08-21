import { Link, useLocation } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';

export default function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: 'M3 12l9-9 9 9M5 10v10h14V10' },
    { path: '/search', label: 'Search', icon: 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z' },
    { path: '/dashboard', label: 'Dashboard', icon: 'M4 6h16M4 12h16M4 18h10', requireAuth: true },
    { path: '/reports', label: 'Reports', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', requireAuth: true }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-apple-text to-gray-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="text-h3 text-apple-text">Kin</span>
              <span className="badge badge-blue hidden sm:inline-flex">Research</span>
            </Link>

            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.requireAuth) {
                  return (
                    <SignedIn key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-medium transition-all duration-200 ${
                          isActive(item.path)
                            ? 'bg-apple-gray6 text-apple-text'
                            : 'text-apple-textSecondary hover:text-apple-text hover:bg-apple-gray6/50'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        {item.label}
                      </Link>
                    </SignedIn>
                  );
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-medium transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-apple-gray6 text-apple-text'
                        : 'text-apple-textSecondary hover:text-apple-text hover:bg-apple-gray6/50'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Auth */}
            <div className="flex items-center gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-primary">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9',
                      userButtonPopoverCard: 'rounded-apple-lg shadow-apple-xl border-0',
                      userButtonPopoverActionButton: 'hover:bg-apple-gray6 rounded-lg'
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-black/5 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-caption">
              <div className="w-6 h-6 rounded-lg bg-apple-text flex items-center justify-center">
                <span className="text-white font-bold text-xs">K</span>
              </div>
              <span>Kin Research Platform</span>
              <span className="text-apple-gray3">© 2026</span>
            </div>
            <div className="flex items-center gap-6 text-caption text-apple-textSecondary">
              <span>Professional company analysis</span>
              <span>Powered by Bright Data</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
