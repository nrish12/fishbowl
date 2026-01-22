import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const VALID_CATEGORIES = ['pop_culture', 'history_science', 'sports', 'geography'] as const;
type DailyCategory = typeof VALID_CATEGORIES[number];

const CATEGORY_NAMES: Record<DailyCategory, string> = {
  pop_culture: 'Pop Culture',
  history_science: 'History & Science',
  sports: 'Sports',
  geography: 'Geography',
};

export default function DailyChallenge() {
  const navigate = useNavigate();
  const { category } = useParams<{ category: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const isValidCategory = category && VALID_CATEGORIES.includes(category as DailyCategory);
  const categoryName = isValidCategory ? CATEGORY_NAMES[category as DailyCategory] : '';

  const loadDailyChallenge = useCallback(async () => {
    if (!isValidCategory || !SUPABASE_URL || !SUPABASE_ANON_KEY) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const response = await fetchWithTimeout(
        `${SUPABASE_URL}/functions/v1/daily-challenge?category=${category}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          timeout: 30000,
          signal: abortControllerRef.current.signal,
        }
      );

      if (!isMountedRef.current) return;

      if (!response.ok) {
        let errorMessage = 'Failed to load daily challenge';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // JSON parsing failed, use default message
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!isMountedRef.current) return;

      if (data.token && typeof data.token === 'string') {
        setIsRevealing(true);
        setLoading(false);
        timeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            navigate(`/play?t=${encodeURIComponent(data.token)}`);
          }
        }, 1200);
      } else {
        throw new Error('No token received');
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;
      if (err.name === 'AbortError') return;

      setError(err.message || 'Failed to fetch');
      setLoading(false);
    }
  }, [category, isValidCategory, navigate]);

  useEffect(() => {
    isMountedRef.current = true;

    if (!isValidCategory) {
      navigate('/daily', { replace: true });
      return;
    }

    loadDailyChallenge();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [category, isValidCategory, navigate, loadDailyChallenge]);

  if (loading && !isRevealing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 paper-texture opacity-30" />

        <div className="text-center space-y-8 relative z-10 animate-paper-unfold">
          <Logo size="md" showTagline={false} />

          <div className="relative perspective-1200">
            <div className="absolute -inset-8 bg-gradient-to-br from-forest-500/20 to-gold-500/20 rounded-3xl blur-2xl animate-pulse" />

            <div className="relative bg-white rounded-3xl p-12 paper-shadow paper-texture">
              <div className="absolute top-6 left-6 w-4 h-4 rounded-full bg-forest-500/20" />
              <div className="absolute top-6 right-6 w-4 h-4 rounded-full bg-forest-500/20" />
              <div className="absolute bottom-6 left-6 w-4 h-4 rounded-full bg-forest-500/20" />
              <div className="absolute bottom-6 right-6 w-4 h-4 rounded-full bg-forest-500/20" />

              <div className="space-y-6">
                <div className="mx-auto flex items-center justify-center">
                  <Logo loading={true} />
                </div>

                <div className="space-y-2">
                  <p className="text-xl font-serif font-bold text-forest-800">
                    Loading {categoryName} Mystery
                  </p>
                  <div className="flex justify-center gap-2" role="status" aria-label="Loading">
                    <div className="w-2 h-2 bg-forest-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-forest-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-forest-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isRevealing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 paper-texture opacity-30" />

        <div className="relative z-10 w-full max-w-2xl">
          <div className="text-center space-y-8">
            <Logo loading={true} />
            <p className="text-2xl font-serif font-semibold text-forest-700">Loading {categoryName} Mystery...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 animate-paper-unfold">
          <Link to="/daily" className="flex items-center gap-2 text-forest-600 hover:text-forest-800 transition-colors">
            <ArrowLeft size={20} />
            <span>Choose Another Category</span>
          </Link>

          <div className="bg-white rounded-2xl p-8 paper-shadow paper-texture text-center space-y-4 border-2 border-red-200">
            <div className="text-5xl" role="img" aria-label="Warning">!</div>
            <h2 className="text-2xl font-serif font-bold text-forest-800">Unable to Load</h2>
            <p className="text-forest-600">{error}</p>
            <button
              onClick={loadDailyChallenge}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-forest-600 to-forest-700 text-gold-50 rounded-full font-bold hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Loading...' : 'Try Again'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
