import { useState } from 'react';

interface Phase5Data {
  semantic_scores: Array<{
    guess: string;
    score: number;
    reason: string;
  }>;
  connections: Array<{
    guess: string;
    hint: string;
    pattern: string;
  }>;
  synthesis: string;
  themes_identified: string[];
  themes_missing: string[];
}

interface Phase5VisualProps {
  data: Phase5Data;
}

export default function Phase5Visual({ data }: Phase5VisualProps) {
  const [activeTab, setActiveTab] = useState<'guesses' | 'themes'>('guesses');

  if (!data || !data.semantic_scores || !data.themes_identified || !data.themes_missing) {
    return (
      <div className="w-full max-w-6xl mx-auto py-2">
        <div className="text-center">
          <p className="text-ink-400">Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto py-1">
      <div className="text-center mb-3">
        <div className="inline-block px-4 py-1.5 bg-forest-100 rounded-full border border-forest-300/40 mb-2">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-widest">Phase 5 • Final Chance</span>
        </div>
      </div>

      <div className="bg-gradient-to-r from-forest-50 via-amber-50 to-forest-50 rounded-xl p-3 border border-forest-200/60 mb-3">
        <p className="text-xs text-forest-800 text-center font-medium italic leading-relaxed">
          {data.synthesis}
        </p>
      </div>

      <div className="flex gap-2 mb-3 justify-center">
        <button
          onClick={() => setActiveTab('guesses')}
          className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'guesses'
              ? 'bg-forest-600 text-white shadow-md'
              : 'bg-white text-forest-700 border border-forest-300 hover:bg-forest-50'
          }`}
        >
          Your Guesses
        </button>
        <button
          onClick={() => setActiveTab('themes')}
          className={`px-5 py-2 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'themes'
              ? 'bg-forest-600 text-white shadow-md'
              : 'bg-white text-forest-700 border border-forest-300 hover:bg-forest-50'
          }`}
        >
          Themes Analysis
        </button>
      </div>

      <div className="bg-white rounded-xl border-2 border-forest-200 p-4 min-h-[280px]">
        {activeTab === 'guesses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.semantic_scores && data.semantic_scores.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-white to-gray-50 rounded-lg border-2 p-3 shadow-sm"
                style={{
                  animation: `fadeIn 0.4s ease-out ${idx * 60}ms both`,
                  borderColor: item.score >= 70 ? '#10b981' : item.score >= 50 ? '#f59e0b' : '#ef4444',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-forest-800 text-base">{item.guess}</span>
                  <span className="text-xs font-bold text-white px-2.5 py-1 rounded-full" style={{
                    backgroundColor: item.score >= 70 ? '#10b981' : item.score >= 50 ? '#f59e0b' : '#ef4444'
                  }}>
                    {item.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                  <div
                    className="h-1.5 rounded-full transition-all duration-1000"
                    style={{
                      width: `${item.score}%`,
                      background: item.score >= 70
                        ? '#10b981'
                        : item.score >= 50
                        ? '#f59e0b'
                        : '#ef4444',
                    }}
                  />
                </div>
                <p className="text-xs text-gray-600 italic leading-tight">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300/60">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">✓</div>
                <h4 className="text-sm font-bold text-forest-800 uppercase tracking-wide">You Found</h4>
              </div>
              <div className="space-y-2">
                {data.themes_identified && data.themes_identified.map((theme, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-forest-800 bg-white px-3 py-2 rounded-lg font-semibold border border-green-200 shadow-sm"
                    style={{ animation: 'slideIn 0.3s ease-out', animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
                  >
                    {theme}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-4 border-2 border-red-300/60">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">!</div>
                <h4 className="text-sm font-bold text-forest-800 uppercase tracking-wide">You Missed</h4>
              </div>
              <div className="space-y-2">
                {data.themes_missing && data.themes_missing.map((theme, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-forest-800 bg-white px-3 py-2 rounded-lg font-semibold border border-red-200 shadow-sm"
                  >
                    {theme}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
