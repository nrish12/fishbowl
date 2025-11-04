import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Loader2, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function DailyChallenge() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const loadDailyChallenge = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/daily-challenge`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load daily challenge');
      }

      const data = await response.json();

      if (data.token) {
        navigate(`/play?t=${data.token}`);
      } else {
        throw new Error('No token received');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center space-y-6">
          <Logo size="md" />
          <div className="space-y-4">
            <Calendar className="w-16 h-16 text-gold mx-auto animate-pulse" />
            <p className="text-lg text-neutral-600">Preparing today's challenge...</p>
            <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          <Link to="/" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors">
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-red-200 text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-2xl font-serif font-bold text-neutral-900">Unable to Load</h2>
            <p className="text-neutral-600">{error}</p>
            <button
              onClick={loadDailyChallenge}
              className="px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-gold hover:text-neutral-900 transition-colors"
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
