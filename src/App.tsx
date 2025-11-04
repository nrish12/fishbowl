import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DailyChallenge from './pages/DailyChallenge';
import CreateChallenge from './pages/CreateChallenge';
import PlayChallenge from './pages/PlayChallenge';
import Admin from './pages/Admin';
import DevTools from './pages/DevTools';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/daily" element={<DailyChallenge />} />
        <Route path="/create" element={<CreateChallenge />} />
        <Route path="/play" element={<PlayChallenge />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/dev" element={<DevTools />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
