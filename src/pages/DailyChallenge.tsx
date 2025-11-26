import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function DailyChallenge() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const loadDailyChallenge = async () => {
    try {
      const response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/daily-challenge`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        timeout: 30000,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load daily challenge');
      }

      const data = await response.json();

      if (data.token) {
        setIsRevealing(true);
        setTimeout(() => {
          navigate(`/play?t=${data.token}`);
        }, 1200);
      } else {
        throw new Error('No token received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch');
      setLoading(false);
    }
  };

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
                    Loading Today's Mystery
                  </p>
                  <div className="flex justify-center gap-2">
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
            <p className="text-2xl font-serif font-semibold text-forest-700">Loading Today's Mystery...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6 animate-paper-unfold">
          <Link to="/" className="flex items-center gap-2 text-ink-300 hover:text-ink-500 transition-colors">
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>

          <div className="bg-white rounded-2xl p-8 paper-shadow paper-texture text-center space-y-4 border-2 border-red-200">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-2xl font-serif font-bold text-forest-800">Unable to Load</h2>
            <p className="text-forest-600">{error}</p>
            <button
              onClick={loadDailyChallenge}
              className="px-6 py-3 bg-gradient-to-r from-forest-600 to-forest-700 text-gold-50 rounded-full font-bold hover:shadow-xl transition-all transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
