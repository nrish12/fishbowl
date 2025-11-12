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
    <div className="space-y-4 w-full mx-auto">
      <div className="text-center mb-3">
        <div className="inline-block px-4 py-1 bg-forest-100 rounded-full border border-forest-300/30">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-widest">Phase 5 • Final Chance</span>
        </div>
        <h2 className="text-lg font-serif font-bold text-forest-800 mt-2">
          The Complete Picture
        </h2>
      </div>

      <div className="bg-gradient-to-br from-forest-50 to-amber-50 rounded-2xl p-5 border-2 border-forest-300/30">
        <p className="text-sm text-forest-800 leading-relaxed text-center font-medium italic">
          {data.synthesis}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <h4 className="text-sm font-serif font-bold text-forest-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-forest-600 text-white flex items-center justify-center text-xs">%</span>
            Your Guesses
          </h4>
          <div className="space-y-2">
            {data.semantic_scores.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border-2 p-3 shadow-sm"
                style={{
                  animation: `fadeIn 0.6s ease-out ${idx * 100}ms both`,
                  borderColor: item.score >= 70 ? '#10b981' : item.score >= 50 ? '#f59e0b' : '#ef4444',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-forest-800 text-sm">{item.guess}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-1000"
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
                    <span className="text-xs font-bold text-gray-600 w-10 text-right">
                      {item.score}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 italic">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-green-50/80 rounded-xl p-4 border-2 border-green-300/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                ✓
              </div>
              <h4 className="text-sm font-serif font-bold text-forest-800">
                You Found
              </h4>
            </div>
            <ul className="space-y-1.5">
              {data.themes_identified.map((theme, idx) => (
                <li
                  key={idx}
                  className="text-xs text-forest-800 bg-white px-3 py-2 rounded-lg font-semibold border border-green-200 flex items-center gap-2"
                  style={{ animation: 'slideIn 0.5s ease-out', animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0" />
                  <span className="leading-tight">{theme}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-red-50/80 rounded-xl p-4 border-2 border-red-300/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold">
                !
              </div>
              <h4 className="text-sm font-serif font-bold text-forest-800">
                You Missed
              </h4>
            </div>
            <ul className="space-y-1.5">
              {data.themes_missing.map((theme, idx) => (
                <li
                  key={idx}
                  className="text-xs text-forest-800 bg-white px-3 py-2 rounded-lg font-semibold border border-red-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                  <span className="leading-tight">{theme}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
