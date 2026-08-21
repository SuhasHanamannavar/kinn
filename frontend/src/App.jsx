import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import CompanyDetail from './pages/CompanyDetail.jsx';
import Reports from './pages/Reports.jsx';
import ReportDetail from './pages/ReportDetail.jsx';
import Dashboard from './pages/Dashboard.jsx';

function App() {
  const { isLoaded, userId, getToken } = useAuth();

  // Store Clerk token for API calls
  useEffect(() => {
    if (isLoaded && userId) {
      getToken().then(token => {
        if (token) {
          localStorage.setItem('clerk-token', token);
        }
      });
    } else if (!userId) {
      localStorage.removeItem('clerk-token');
    }
  }, [isLoaded, userId, getToken]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/company/:ticker" element={<CompanyDetail />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/:id" element={<ReportDetail />} />
      </Routes>
    </Layout>
  );
}

export default App;
