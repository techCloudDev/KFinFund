import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './features/landing/pages/Landpage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <main style={{ minHeight: '100vh', background: 'var(--lp-bg)' }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
