import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './features/landing/pages/Landpage';
import Register from './features/auth/pages/register';
import Login from './features/auth/pages/Login';
import MutualFundPage from './features/mutual-fund/pages/MutualFundPage';
import MutualFundDetailPage from './features/mutual-fund/pages/MutualFundDetailPage';
import WatchlistPage from './features/mutual-fund/pages/WatchlistPage';
import BasicDetails from './features/profile/BasicDetails';
import ReportPage from './features/profile/ReportPage';
import ChangePassword from './features/profile/ChangePassword';
import KycPage from './features/profile/KycPage';
import HelpPage from './features/profile/HelpPage';
import LogoutPage from './features/profile/LogoutPage';
import PortfolioPage from './features/portfolio/PortfolioPage';
import TransactionPage from './features/transactions/TransactionPage';
import SipPage from './features/sip/SipPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <main style={{ minHeight: '100vh', background: 'var(--lp-bg)' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mutual-fund" element={<MutualFundPage />} />
          <Route path="/mutual-fund/:schemeCode" element={<MutualFundDetailPage />} />
          <Route path="/mutual-fund/watchlist" element={<WatchlistPage />} />
          <Route path="/watchlist" element={<Navigate to="/mutual-fund/watchlist" replace />} />
          <Route path="/sip" element={<Navigate to="/user/sip" replace />} />
          <Route path="/user/sip" element={<SipPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/user/portfolio" element={<Navigate to="/portfolio" replace />} />
          <Route path="/transactions" element={<TransactionPage />} />
          <Route path="/user/transaction" element={<Navigate to="/transactions" replace />} />
          <Route path="/profile" element={<Navigate to="/user/profile/basic-details" replace />} />
          <Route path="/user/profile/basic-details" element={<BasicDetails />} />
          <Route path="/user/profile/report" element={<ReportPage />} />
          <Route path="/reports" element={<Navigate to="/user/profile/report" replace />} />
          <Route path="/user/profile/change-password" element={<ChangePassword />} />
          <Route path="/user/profile/kyc" element={<KycPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/support" element={<Navigate to="/help" replace />} />
          <Route path="/user/logout" element={<LogoutPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
