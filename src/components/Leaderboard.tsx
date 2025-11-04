import { useEffect, useState } from 'react';
import { getLeaderboard } from '../utils/tracking';
import { Trophy, Users, Target, Clock, TrendingUp } from 'lucide-react';

interface LeaderboardProps {
  challengeId: string;
}

interface LeaderboardData {
  challenge_id: string;
  type: string;
  is_daily: boolean;
  unique_visitors: number;
  unique_completions: number;
  phase1_completions: number;
  phase2_completions: number;
  phase3_completions: number;
  avg_attempts: number;
  avg_time_seconds: number;
  completion_rate_percent: number;
  view_count: number;
  completion_count: number;
  share_count: number;
}

export function Leaderboard({ challengeId }: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const result = await getLeaderboard(challengeId);
      setData(result);
      setLoading(false);
    }
    fetchData();
  }, [challengeId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const getPhaseColor = (phase: number) => {
    if (phase === 1) return 'text-yellow-600 bg-yellow-50';
    if (phase === 2) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const phasePercentages = [
    {
      phase: 1,
      count: data.phase1_completions,
      percentage: data.unique_completions > 0
        ? Math.round((data.phase1_completions / data.unique_completions) * 100)
        : 0,
    },
    {
      phase: 2,
      count: data.phase2_completions,
      percentage: data.unique_completions > 0
        ? Math.round((data.phase2_completions / data.unique_completions) * 100)
        : 0,
    },
    {
      phase: 3,
      count: data.phase3_completions,
      percentage: data.unique_completions > 0
        ? Math.round((data.phase3_completions / data.unique_completions) * 100)
        : 0,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">Challenge Stats</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">Players</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.unique_visitors.toLocaleString()}</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-sm font-medium">Solved</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.unique_completions.toLocaleString()}</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Success Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.completion_rate_percent}%</p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 text-orange-600 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Avg Time</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {data.avg_time_seconds ? Math.round(data.avg_time_seconds) : 0}s
          </p>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Solve Distribution</h3>
        <div className="space-y-3">
          {phasePercentages.map(({ phase, count, percentage }) => (
            <div key={phase} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className={`px-3 py-1 rounded-full font-medium ${getPhaseColor(phase)}`}>
                  Phase {phase}
                </span>
                <span className="text-gray-600">
                  {count} players ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    phase === 1 ? 'bg-yellow-500' : phase === 2 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {data.avg_attempts > 0 && (
        <div className="border-t pt-6">
          <p className="text-sm text-gray-600">
            On average, players made <span className="font-semibold text-gray-900">{data.avg_attempts.toFixed(1)}</span> attempts before solving
          </p>
        </div>
      )}
    </div>
  );
}
