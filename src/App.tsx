import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { usePageTracking } from './hooks/usePageTracking';
import ErrorBoundary from './components/ErrorBoundary';
import Logo from './components/Logo';
import Home from './pages/Home';
import DailyCategoryPicker from './pages/DailyCategoryPicker';
import DailyChallenge from './pages/DailyChallenge';
import CreateChallenge from './pages/CreateChallenge';
import PlayChallenge from './pages/PlayChallenge';
import ShortUrlRedirect from './pages/ShortUrlRedirect';

const Admin = lazy(() => import('./pages/Admin'));
const DevTools = lazy(() => import('./pages/DevTools'));
const LogoShowcase = lazy(() => import('./pages/LogoShowcase'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Logo loading={true} />
        <p className="text-forest/70">Loading...</p>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border-2 border-amber-200 text-center space-y-4">
        <div className="text-6xl">?</div>
        <h1 className="text-3xl font-serif font-bold text-forest">Page Not Found</h1>
        <p className="text-forest/70">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-forest text-white rounded-full font-medium hover:bg-gold hover:text-forest transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function AppRoutes() {
  usePageTracking();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/daily" element={<DailyCategoryPicker />} />
      <Route path="/daily/:category" element={<DailyChallenge />} />
      <Route path="/create" element={<CreateChallenge />} />
      <Route path="/play" element={<PlayChallenge />} />
      <Route path="/s/:code" element={<ShortUrlRedirect />} />
      <Route path="/admin" element={
        <Suspense fallback={<LoadingFallback />}>
          <Admin />
        </Suspense>
      } />
      <Route path="/dev" element={
        <Suspense fallback={<LoadingFallback />}>
          <DevTools />
        </Suspense>
      } />
      <Route path="/logos" element={
        <Suspense fallback={<LoadingFallback />}>
          <LogoShowcase />
        </Suspense>
      } />
      <Route path="/privacy" element={
        <Suspense fallback={<LoadingFallback />}>
          <Privacy />
        </Suspense>
      } />
      <Route path="/terms" element={
        <Suspense fallback={<LoadingFallback />}>
          <Terms />
        </Suspense>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
