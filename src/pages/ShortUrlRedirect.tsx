import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function ShortUrlRedirect() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setError('Invalid short URL');
      return;
    }

    resolveShortUrl(code);
  }, [code]);

  const resolveShortUrl = async (shortCode: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/s?c=${shortCode}`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error('Short URL not found');
      }

      const data = await response.json();

      if (data.token) {
        navigate(`/play?t=${data.token}`, { replace: true });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resolve short URL');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200 flex items-center justify-center p-6">
        <div className="text-center space-y-6">
          <Logo size="md" showTagline={false} />
          <div className="bg-white rounded-3xl p-8 paper-shadow max-w-md">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-serif font-bold text-ink-600 mb-2">Link Not Found</h2>
            <p className="text-ink-500">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-gradient-to-br from-forest-600 to-forest-700 text-gold-200 rounded-full font-semibold hover:from-forest-700 hover:to-forest-800 transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200 flex items-center justify-center p-6">
      <div className="text-center space-y-6">
        <Logo size="md" showTagline={false} />
        <div className="bg-white rounded-3xl p-12 paper-shadow">
          <div className="text-6xl mb-4 animate-pulse">✉️</div>
          <p className="text-lg font-serif text-ink-600">Opening your challenge...</p>
        </div>
      </div>
    </div>
  );
}
