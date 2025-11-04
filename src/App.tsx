import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import DailyChallenge from './pages/DailyChallenge';
import CreateChallenge from './pages/CreateChallenge';
import PlayChallenge from './pages/PlayChallenge';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/daily" element={<DailyChallenge />} />
        <Route path="/create" element={<CreateChallenge />} />
        <Route path="/play" element={<PlayChallenge />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
