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
  return (
    <div className="w-full max-w-6xl mx-auto py-2">
      <div className="text-center mb-4">
        <div className="inline-block px-4 py-1.5 bg-forest-100 rounded-full border border-forest-300/40 mb-2">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-widest">Phase 5 • Final Chance</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-forest-800">
          The Complete Picture
        </h2>
      </div>

      <div className="bg-gradient-to-r from-forest-50 via-amber-50 to-forest-50 rounded-xl p-4 border border-forest-200/60 mb-4">
        <p className="text-sm text-forest-800 text-center font-medium italic leading-relaxed">
          {data.synthesis}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <h3 className="text-sm font-bold text-forest-800 mb-3 flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-forest-600 text-white flex items-center justify-center text-xs">%</span>
            Your Guesses Analyzed
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {data.semantic_scores.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg border p-3 shadow-sm"
                style={{
                  animation: `fadeIn 0.5s ease-out ${idx * 80}ms both`,
                  borderColor: item.score >= 70 ? '#10b981' : item.score >= 50 ? '#f59e0b' : '#ef4444',
                  borderWidth: '2px'
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-forest-800 text-sm">{item.guess}</span>
                  <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
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
                <p className="text-xs text-gray-600 italic leading-tight line-clamp-2">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-green-50 rounded-lg p-3 border-2 border-green-300/60">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded bg-green-600 text-white flex items-center justify-center text-xs font-bold">✓</div>
              <h4 className="text-xs font-bold text-forest-800 uppercase tracking-wide">You Found</h4>
            </div>
            <div className="space-y-1">
              {data.themes_identified.map((theme, idx) => (
                <div
                  key={idx}
                  className="text-xs text-forest-800 bg-white px-2 py-1.5 rounded font-semibold border border-green-200"
                  style={{ animation: 'slideIn 0.4s ease-out', animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
                >
                  {theme}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-3 border-2 border-red-300/60">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded bg-red-600 text-white flex items-center justify-center text-xs font-bold">!</div>
              <h4 className="text-xs font-bold text-forest-800 uppercase tracking-wide">You Missed</h4>
            </div>
            <div className="space-y-1">
              {data.themes_missing.map((theme, idx) => (
                <div
                  key={idx}
                  className="text-xs text-forest-800 bg-white px-2 py-1.5 rounded font-semibold border border-red-200"
                >
                  {theme}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
