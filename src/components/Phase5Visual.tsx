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
      <div className="text-center space-y-1.5">
        <div className="inline-block px-4 py-1 bg-forest-100 rounded-full border border-forest-300/30">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-widest">Phase 5 • Final Chance</span>
        </div>
        <h2 className="text-xl font-serif font-bold text-forest-800">
          The Complete Picture
        </h2>
        <p className="text-xs text-forest-600">All pieces revealed</p>
      </div>

      <div className="relative">
        <div className="relative bg-paper-100/50 rounded-2xl p-5 border-2 border-forest-300/30 backdrop-blur-sm">
          <div className="text-center space-y-3 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 shadow-lg">
              <span className="text-2xl">🔮</span>
            </div>

            <div className="relative">
              <div className="relative bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-forest-200/50">
                <p className="text-base text-forest-800 leading-relaxed font-serif">
                  {data.synthesis}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-paper-100/40 rounded-2xl p-4 border-2 border-forest-300/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-lg">
            <span className="text-lg">📊</span>
          </div>
          <h4 className="text-lg font-serif font-bold text-forest-800">Your Guesses</h4>
        </div>

        <div className="space-y-2">
          {data.semantic_scores.map((item, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-xl border-2 bg-white/50 backdrop-blur-sm"
              style={{
                animation: `fadeIn 0.6s ease-out ${idx * 100}ms both`,
                borderColor: item.score >= 70 ? '#10b981' : item.score >= 50 ? '#f59e0b' : '#ef4444',
              }}
            >
              <div className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-forest-800 text-base">{item.guess}</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-paper-100 border border-forest-300/30">
                    {item.score}%
                  </span>
                </div>

                <div className="relative w-full bg-paper-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-[1500ms]"
                    style={{
                      width: `${item.score}%`,
                      background: item.score >= 70
                        ? 'linear-gradient(to right, #10b981, #059669)'
                        : item.score >= 50
                        ? 'linear-gradient(to right, #f59e0b, #d97706)'
                        : 'linear-gradient(to right, #ef4444, #dc2626)',
                      animationDelay: `${idx * 200}ms`,
                    }}
                  />
                </div>

                <p className="text-xs text-ink-300 italic leading-snug">
                  {item.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-paper-100/40 rounded-xl p-3 border-2 border-green-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-sm">✅</span>
            </div>
            <h4 className="text-sm font-serif font-bold text-forest-800">
              You Found
            </h4>
          </div>
          <ul className="space-y-1.5">
            {data.themes_identified.map((theme, idx) => (
              <li
                key={idx}
                className="text-xs text-forest-800 bg-green-50 px-3 py-1.5 rounded-lg font-semibold border border-green-200 flex items-center gap-1.5"
                style={{ animation: 'slideIn 0.5s ease-out', animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0" />
                <span className="leading-tight">{theme}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-paper-100/40 rounded-xl p-3 border-2 border-red-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
              <span className="text-sm">💡</span>
            </div>
            <h4 className="text-sm font-serif font-bold text-forest-800">
              You Missed
            </h4>
          </div>
          <ul className="space-y-1.5">
            {data.themes_missing.map((theme, idx) => (
              <li
                key={idx}
                className="text-xs text-forest-800 bg-red-50 px-3 py-1.5 rounded-lg font-semibold border border-red-200 flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                <span className="leading-tight">{theme}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
