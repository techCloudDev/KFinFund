import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './features/landing/pages/Landpage';
import Register from './features/auth/pages/register';
import Login from './features/auth/pages/Login';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <main style={{ minHeight: '100vh', background: 'var(--lp-bg)' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
