import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './features/landing/pages/Landpage';
import Register from './features/auth/pages/register';
import Login from './features/auth/pages/Login';
import KycPage from './features/kyc/pages/KycPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <main style={{ minHeight: '100vh', background: 'var(--lp-bg)' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/kyc" element={<KycPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
