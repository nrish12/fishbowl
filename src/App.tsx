import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { usePageTracking } from './hooks/usePageTracking';
import Home from './pages/Home';
import DailyChallenge from './pages/DailyChallenge';
import CreateChallenge from './pages/CreateChallenge';
import PlayChallenge from './pages/PlayChallenge';
import Admin from './pages/Admin';
import DevTools from './pages/DevTools';
import LogoShowcase from './pages/LogoShowcase';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function AppRoutes() {
  usePageTracking();

  return (
    <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/daily" element={<DailyChallenge />} />
        <Route path="/create" element={<CreateChallenge />} />
        <Route path="/play" element={<PlayChallenge />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/dev" element={<DevTools />} />
        <Route path="/logos" element={<LogoShowcase />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
