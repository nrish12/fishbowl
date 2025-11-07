import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Loader2, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function DailyChallenge() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDailyChallenge();
  }, []);

  const loadDailyChallenge = async () => {
    try {
      console.log('Fetching daily challenge from:', `${SUPABASE_URL}/functions/v1/daily-challenge`);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/daily-challenge`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to load daily challenge');
      }

      const data = await response.json();
      console.log('Got daily challenge:', data);

      if (data.token) {
        navigate(`/play?t=${data.token}`);
      } else {
        throw new Error('No token received');
      }
    } catch (err: any) {
      console.error('Daily challenge error:', err);
      setError(err.message || 'Failed to fetch');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-amber-50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <Logo size="md" />
          <div className="space-y-4">
            <Calendar className="w-16 h-16 text-gold mx-auto animate-pulse" />
            <p className="text-lg text-forest/70">Preparing today's challenge...</p>
            <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-amber-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          <Link to="/" className="flex items-center gap-2 text-forest/60 hover:text-forest transition-colors">
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-red-200 text-center space-y-4">
            <div className="text-5xl">⚠️</div>
            <h2 className="text-2xl font-serif font-bold text-forest">Unable to Load</h2>
            <p className="text-forest/70">{error}</p>
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
