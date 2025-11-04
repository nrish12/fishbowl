import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Eye, Lock } from 'lucide-react';
import Logo from '../components/Logo';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ADMIN_PASSWORD = 'clueladder2025';

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [dailyChallenges, setDailyChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
      loadDailyChallenges();
    } else {
      setMessage({ type: 'error', text: 'Invalid password' });
    }
  };

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      setAuthenticated(true);
      loadDailyChallenges();
    }
  }, []);

  const loadDailyChallenges = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/list-daily-challenges`);
      const data = await response.json();
      setDailyChallenges(data.challenges || []);
    } catch (error) {
      console.error('Failed to load daily challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const previewChallenge = (challengeId: string) => {
    window.open(`/play?t=${challengeId}`, '_blank');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border border-neutral-200">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-neutral-900" />
            <h1 className="text-2xl font-serif font-bold text-neutral-900">Admin Access</h1>
          </div>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="Enter admin password"
            className="w-full px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-gold focus:outline-none mb-4"
          />

          <button
            onClick={handleLogin}
            className="w-full px-6 py-3 bg-neutral-900 text-white rounded-full font-semibold hover:bg-gold hover:text-neutral-900 transition-colors"
          >
            Login
          </button>

          {message && message.type === 'error' && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-900">
              {message.text}
            </div>
          )}

          <Link to="/" className="block text-center mt-6 text-sm text-neutral-600 hover:text-neutral-900">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 py-8 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <Logo size="sm" />
          <button
            onClick={() => {
              setAuthenticated(false);
              localStorage.removeItem('admin_auth');
            }}
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            Logout
          </button>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold text-neutral-900 mb-2">Admin Tools</h1>
          <p className="text-neutral-600">Manage daily challenges and view analytics</p>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-900'
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Quick Actions</h2>

            <div className="space-y-3">
              <button
                onClick={loadDailyChallenges}
                disabled={loading}
                className="w-full px-6 py-3 bg-neutral-900 text-white rounded-full font-semibold hover:bg-gold hover:text-neutral-900 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                Refresh Challenges List
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">System Info</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-600">Environment:</span>
                <span className="font-semibold">{import.meta.env.MODE}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Supabase URL:</span>
                <span className="font-mono text-xs">{SUPABASE_URL?.slice(0, 30)}...</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-200">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Daily Challenges</h2>

          {loading && dailyChallenges.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">Loading...</div>
          ) : dailyChallenges.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">No daily challenges found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Target</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-neutral-900">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-neutral-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyChallenges.map((challenge) => (
                    <tr key={challenge.challenge_date} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">{challenge.challenge_date}</td>
                      <td className="py-3 px-4 font-semibold">{challenge.target}</td>
                      <td className="py-3 px-4 capitalize">{challenge.type}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          challenge.challenge_date === new Date().toISOString().split('T')[0]
                            ? 'bg-green-100 text-green-800'
                            : challenge.challenge_date > new Date().toISOString().split('T')[0]
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}>
                          {challenge.challenge_date === new Date().toISOString().split('T')[0]
                            ? 'Today'
                            : challenge.challenge_date > new Date().toISOString().split('T')[0]
                            ? 'Upcoming'
                            : 'Past'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => previewChallenge(challenge.challenge_id)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                        >
                          <Eye size={16} className="inline mr-1" />
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
