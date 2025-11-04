import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Database, Zap, Activity, Terminal, RefreshCw, Trash2, Copy, Check } from 'lucide-react';
import Logo from '../components/Logo';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Stats {
  total_challenges: number;
  daily_challenges: number;
  total_attempts: number;
  avg_quality_score: number;
  recent_challenges: any[];
  difficulty_stats: any[];
}

export default function DevTools() {
  const [activeTab, setActiveTab] = useState<'overview' | 'database' | 'functions' | 'performance'>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM challenges LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [testFunction, setTestFunction] = useState('validate-challenge');
  const [testPayload, setTestPayload] = useState('{\n  "type": "person",\n  "target": "Albert Einstein"\n}');
  const [functionResult, setFunctionResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/dev-stats`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    setLoading(true);
    setQueryResult(null);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ query: sqlQuery }),
      });

      const data = await response.json();
      setQueryResult(data);
    } catch (error) {
      setQueryResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testEdgeFunction = async () => {
    setLoading(true);
    setFunctionResult(null);
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${testFunction}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: testPayload,
      });

      const data = await response.json();
      setFunctionResult({
        status: response.status,
        statusText: response.statusText,
        data,
      });
    } catch (error) {
      setFunctionResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async () => {
    if (confirm('Clear all cached API responses?')) {
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/clear-cache`, {
          method: 'POST',
        });
        alert('Cache cleared successfully');
      } catch (error) {
        alert('Failed to clear cache');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-800 text-white py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>
          <Logo size="sm" />
          <div className="w-20" />
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold mb-2">Developer Tools</h1>
          <p className="text-neutral-400">Debug, test, and monitor your application</p>
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'database', label: 'Database', icon: Database },
            { id: 'functions', label: 'Edge Functions', icon: Zap },
            { id: 'performance', label: 'Performance', icon: Terminal },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-gold text-neutral-900'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">System Overview</h2>
              <button
                onClick={loadStats}
                disabled={loading}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center gap-2 transition-colors"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                Refresh
              </button>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
                <div className="text-neutral-400 text-sm mb-2">Total Challenges</div>
                <div className="text-3xl font-bold">{stats?.total_challenges || 0}</div>
              </div>
              <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
                <div className="text-neutral-400 text-sm mb-2">Daily Challenges</div>
                <div className="text-3xl font-bold">{stats?.daily_challenges || 0}</div>
              </div>
              <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
                <div className="text-neutral-400 text-sm mb-2">Total Attempts</div>
                <div className="text-3xl font-bold">{stats?.total_attempts || 0}</div>
              </div>
              <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
                <div className="text-neutral-400 text-sm mb-2">Avg Quality</div>
                <div className="text-3xl font-bold">{stats?.avg_quality_score?.toFixed(0) || 'N/A'}</div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <h3 className="text-xl font-bold mb-4">Environment Variables</h3>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between items-center p-3 bg-neutral-900 rounded">
                  <span className="text-neutral-400">VITE_SUPABASE_URL</span>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400">{SUPABASE_URL?.slice(0, 40)}...</span>
                    <button
                      onClick={() => copyToClipboard(SUPABASE_URL || '')}
                      className="p-1 hover:bg-neutral-800 rounded"
                    >
                      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-900 rounded">
                  <span className="text-neutral-400">VITE_SUPABASE_ANON_KEY</span>
                  <span className="text-green-400">{SUPABASE_ANON_KEY?.slice(0, 20)}...</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-900 rounded">
                  <span className="text-neutral-400">MODE</span>
                  <span className="text-yellow-400">{import.meta.env.MODE}</span>
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <button
                  onClick={clearCache}
                  className="px-4 py-3 bg-red-900/20 hover:bg-red-900/30 border border-red-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 size={16} />
                  Clear API Cache
                </button>
                <Link
                  to="/create"
                  className="px-4 py-3 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Zap size={16} />
                  Test Challenge Creation
                </Link>
                <Link
                  to="/admin"
                  className="px-4 py-3 bg-purple-900/20 hover:bg-purple-900/30 border border-purple-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Terminal size={16} />
                  Admin Panel
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Database Query Tool</h2>

            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">SQL Query</label>
                <textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg font-mono text-sm focus:border-gold focus:outline-none"
                  placeholder="SELECT * FROM challenges LIMIT 10;"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={executeQuery}
                  disabled={loading}
                  className="px-6 py-3 bg-gold text-neutral-900 rounded-lg font-semibold hover:bg-yellow-400 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {loading ? <RefreshCw size={16} className="animate-spin" /> : <Terminal size={16} />}
                  Execute Query
                </button>
                <button
                  onClick={() => setSqlQuery('SELECT * FROM challenges ORDER BY created_at DESC LIMIT 10;')}
                  className="px-4 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                >
                  Recent Challenges
                </button>
                <button
                  onClick={() => setSqlQuery('SELECT * FROM difficulty_performance ORDER BY completion_rate DESC LIMIT 10;')}
                  className="px-4 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
                >
                  Performance Stats
                </button>
              </div>

              {queryResult && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">Result</span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(queryResult, null, 2))}
                      className="text-xs px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded flex items-center gap-1"
                    >
                      <Copy size={12} />
                      Copy JSON
                    </button>
                  </div>
                  <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 text-xs overflow-auto max-h-96">
                    {JSON.stringify(queryResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <h3 className="text-lg font-bold mb-4">Common Queries</h3>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-neutral-900 rounded font-mono">
                  SELECT COUNT(*) FROM challenges;
                </div>
                <div className="p-3 bg-neutral-900 rounded font-mono">
                  SELECT type, COUNT(*) FROM challenges GROUP BY type;
                </div>
                <div className="p-3 bg-neutral-900 rounded font-mono">
                  SELECT * FROM challenge_quality_scores WHERE quality_score {'<'} 70;
                </div>
                <div className="p-3 bg-neutral-900 rounded font-mono">
                  SELECT * FROM daily_challenges ORDER BY challenge_date DESC;
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'functions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Edge Function Tester</h2>

            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Function Name</label>
                <select
                  value={testFunction}
                  onChange={(e) => setTestFunction(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg focus:border-gold focus:outline-none"
                >
                  <option value="validate-challenge">validate-challenge</option>
                  <option value="create-challenge-fast">create-challenge-fast</option>
                  <option value="check-guess">check-guess</option>
                  <option value="suggest-difficulty">suggest-difficulty</option>
                  <option value="daily-challenge">daily-challenge</option>
                  <option value="get-leaderboard">get-leaderboard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Request Payload (JSON)</label>
                <textarea
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg font-mono text-sm focus:border-gold focus:outline-none"
                />
              </div>

              <button
                onClick={testEdgeFunction}
                disabled={loading}
                className="px-6 py-3 bg-gold text-neutral-900 rounded-lg font-semibold hover:bg-yellow-400 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                Test Function
              </button>

              {functionResult && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold">
                      Response: {functionResult.status && (
                        <span className={functionResult.status < 300 ? 'text-green-400' : 'text-red-400'}>
                          {functionResult.status} {functionResult.statusText}
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(functionResult, null, 2))}
                      className="text-xs px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded flex items-center gap-1"
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                  </div>
                  <pre className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 text-xs overflow-auto max-h-96">
                    {JSON.stringify(functionResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <h3 className="text-lg font-bold mb-4">Available Functions</h3>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                {[
                  'validate-challenge',
                  'create-challenge-fast',
                  'check-guess',
                  'finalize-challenge',
                  'suggest-difficulty',
                  'update-difficulty-performance',
                  'daily-challenge',
                  'get-leaderboard',
                  'list-daily-challenges',
                  'track-event',
                ].map((fn) => (
                  <div key={fn} className="p-3 bg-neutral-900 rounded font-mono">
                    {fn}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Performance Monitoring</h2>

            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <h3 className="text-lg font-bold mb-4">Difficulty Performance</h3>
              {stats?.difficulty_stats && stats.difficulty_stats.length > 0 ? (
                <div className="space-y-3">
                  {stats.difficulty_stats.map((stat: any, idx: number) => (
                    <div key={idx} className="p-4 bg-neutral-900 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold capitalize">{stat.challenge_type}</div>
                          <div className="text-sm text-neutral-400">
                            Phase {stat.selected_phase1_index + 1} / {stat.selected_phase2_index + 1}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gold">
                            {(stat.completion_rate * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-neutral-400">{stat.total_attempts} attempts</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="p-2 bg-yellow-500/10 rounded text-center">
                          <div className="text-yellow-500 font-semibold">{stat.gold_completions}</div>
                          <div className="text-neutral-400">Gold</div>
                        </div>
                        <div className="p-2 bg-gray-400/10 rounded text-center">
                          <div className="text-gray-400 font-semibold">{stat.silver_completions}</div>
                          <div className="text-neutral-400">Silver</div>
                        </div>
                        <div className="p-2 bg-orange-600/10 rounded text-center">
                          <div className="text-orange-600 font-semibold">{stat.bronze_completions}</div>
                          <div className="text-neutral-400">Bronze</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-400">No performance data yet</div>
              )}
            </div>

            <div className="bg-neutral-800 rounded-xl p-6 border border-neutral-700">
              <h3 className="text-lg font-bold mb-4">Recent Challenges</h3>
              {stats?.recent_challenges && stats.recent_challenges.length > 0 ? (
                <div className="space-y-2">
                  {stats.recent_challenges.map((challenge: any) => (
                    <div key={challenge.id} className="p-3 bg-neutral-900 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{challenge.target}</div>
                        <div className="text-sm text-neutral-400 capitalize">{challenge.type}</div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-gold">Fame: {challenge.fame_score}</div>
                        <div className="text-xs text-neutral-400">
                          {new Date(challenge.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-400">No challenges yet</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
