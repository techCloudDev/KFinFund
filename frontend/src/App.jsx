// Add this at the top of App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './features/landing/pages/Landpage';
import Register from './features/auth/pages/register';
import Login from './features/auth/pages/Login';
import KycPage from './features/kyc/pages/KycPage';
import Dashboard from "./features/dashboard/Dashboard";
import MutualFundPage from './features/mutual-fund/pages/MutualFundPage';
import MutualFundDetailPage from './features/mutual-fund/pages/MutualFundDetailPage';
import WatchlistPage from './features/mutual-fund/pages/WatchlistPage';
import BasicDetails from './features/profile/BasicDetails';
import ReportPage from './features/profile/ReportPage';
import ChangePassword from './features/profile/ChangePassword';
import ProfileKycPage from './features/profile/KycPage';
import HelpPage from './features/profile/HelpPage';
import LogoutPage from './features/profile/LogoutPage';
import PortfolioPage from './features/portfolio/PortfolioPage';
import TransactionPage from './features/transactions/TransactionPage';
import SipPage from './features/sip/SipPage';
import './App.css';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <main style={{ minHeight: '100vh', background: 'var(--lp-bg)' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/kyc" element={<KycPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Navigate to="/user/profile" replace />} />
          <Route path="/mutual-fund" element={<MutualFundPage />} />
          <Route path="/mutual-fund/:schemeCode" element={<MutualFundDetailPage />} />
          <Route path="/mutual-fund/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
          <Route path="/watchlist" element={<Navigate to="/mutual-fund/watchlist" replace />} />
          <Route path="/sip" element={<Navigate to="/user/sip" replace />} />
          <Route path="/user/sip" element={<ProtectedRoute><SipPage /></ProtectedRoute>} />
          <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
          <Route path="/user/portfolio" element={<Navigate to="/portfolio" replace />} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionPage /></ProtectedRoute>} />
          <Route path="/user/transaction" element={<Navigate to="/transactions" replace />} />
          <Route path="/user/profile" element={<Navigate to="/user/profile/basic-details" replace />} />
          <Route path="/user/profile/basic-details" element={<ProtectedRoute><BasicDetails /></ProtectedRoute>} />
          <Route path="/user/profile/report" element={<ProtectedRoute><ReportPage /></ProtectedRoute>} />
          <Route path="/reports" element={<Navigate to="/user/profile/report" replace />} />
          <Route path="/user/profile/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
          <Route path="/user/profile/kyc" element={<ProtectedRoute><ProfileKycPage /></ProtectedRoute>} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/support" element={<Navigate to="/help" replace />} />
          <Route path="/user/logout" element={<LogoutPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
