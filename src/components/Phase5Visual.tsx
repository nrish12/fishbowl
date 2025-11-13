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
      <div className="bg-gradient-to-r from-forest-50 via-amber-50 to-forest-50 rounded-2xl p-6 border-2 border-forest-300/40 mb-4 shadow-sm">
        <p className="text-lg text-forest-800 text-center font-medium italic leading-relaxed">
          {data.synthesis}
        </p>
      </div>

      <div className="flex gap-3 mb-4 justify-center">
        <button
          onClick={() => setActiveTab('guesses')}
          className={`px-8 py-3 rounded-xl font-bold text-base transition-all ${
            activeTab === 'guesses'
              ? 'bg-forest-600 text-white shadow-lg scale-105'
              : 'bg-white text-forest-700 border-2 border-forest-300 hover:bg-forest-50'
          }`}
        >
          Your Guesses
        </button>
        <button
          onClick={() => setActiveTab('themes')}
          className={`px-8 py-3 rounded-xl font-bold text-base transition-all ${
            activeTab === 'themes'
              ? 'bg-forest-600 text-white shadow-lg scale-105'
              : 'bg-white text-forest-700 border-2 border-forest-300 hover:bg-forest-50'
          }`}
        >
          Themes Analysis
        </button>
      </div>

      <div className="bg-white rounded-2xl border-2 border-forest-200 p-6 shadow-sm">
        {activeTab === 'guesses' && (
          <div className="grid grid-cols-1 gap-4">
            {data.semantic_scores && data.semantic_scores.map((item, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-white to-gray-50 rounded-xl border-3 p-4 shadow-md hover:shadow-lg transition-shadow"
                style={{
                  animation: `fadeIn 0.4s ease-out ${idx * 60}ms both`,
                  borderWidth: '3px',
                  borderColor: item.score >= 75 ? '#10b981' : item.score >= 55 ? '#f59e0b' : '#ef4444',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-forest-800 text-lg">{item.guess}</span>
                  <span className="text-sm font-bold text-white px-3 py-1 rounded-full shadow-sm" style={{
                    backgroundColor: item.score >= 75 ? '#10b981' : item.score >= 55 ? '#f59e0b' : '#ef4444'
                  }}>
                    {item.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div
                    className="h-2 rounded-full transition-all duration-1000"
                    style={{
                      width: `${item.score}%`,
                      background: item.score >= 75
                        ? '#10b981'
                        : item.score >= 55
                        ? '#f59e0b'
                        : '#ef4444',
                    }}
                  />
                </div>
                <p className="text-base text-gray-700 italic leading-relaxed">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'themes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-green-50 rounded-xl p-5 border-2 border-green-400/60 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">✓</div>
                <h4 className="text-sm font-bold text-forest-800 uppercase tracking-wide">You Found</h4>
              </div>
              <div className="space-y-2">
                {data.themes_identified && data.themes_identified.map((theme, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-forest-800 bg-white px-4 py-2.5 rounded-lg font-semibold border-2 border-green-300 shadow-sm"
                    style={{ animation: 'slideIn 0.3s ease-out', animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
                  >
                    {theme}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 rounded-xl p-5 border-2 border-red-400/60 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold">!</div>
                <h4 className="text-sm font-bold text-forest-800 uppercase tracking-wide">You Missed</h4>
              </div>
              <div className="space-y-2">
                {data.themes_missing && data.themes_missing.map((theme, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-forest-800 bg-white px-4 py-2.5 rounded-lg font-semibold border-2 border-red-300 shadow-sm"
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
