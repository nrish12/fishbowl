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
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <div className="inline-block px-4 py-1 bg-forest-100 rounded-full border border-forest-300/30">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-widest">Phase 5 • Final Chance</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-forest-800">
          The Complete Picture
        </h2>
        <p className="text-sm text-forest-600">All pieces revealed</p>
      </div>

      <div className="relative">
        <div className="relative bg-paper-100/50 rounded-3xl p-8 border-2 border-forest-300/30 backdrop-blur-sm">
          <div className="text-center space-y-4 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 shadow-lg">
              <span className="text-4xl">🔮</span>
            </div>

            <div className="relative py-4">
              <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-forest-200/50">
                <p className="text-xl text-forest-800 leading-relaxed font-serif px-4">
                  {data.synthesis}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-paper-100/40 rounded-3xl p-6 border-2 border-forest-300/20 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="text-2xl font-serif font-bold text-forest-800">Your Path to the Answer</h4>
        </div>

        <div className="space-y-3">
          {data.semantic_scores.map((item, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl border-2 bg-white/50 backdrop-blur-sm"
              style={{
                animation: `fadeIn 0.6s ease-out ${idx * 100}ms both`,
                borderColor: item.score >= 70 ? '#10b981' : item.score >= 50 ? '#f59e0b' : '#ef4444',
              }}
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-forest-800 text-xl">{item.guess}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-forest-600">Closeness</span>
                    <span className="text-base font-bold px-4 py-1 rounded-full bg-paper-100 border border-forest-300/30">
                      {item.score}%
                    </span>
                  </div>
                </div>

                <div className="relative w-full bg-paper-200 rounded-full h-3 mb-3 overflow-hidden">
                  <div
                    className="h-3 rounded-full transition-all duration-[1500ms]"
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

                <p className="text-sm text-ink-300 italic leading-relaxed">
                  {item.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-paper-100/40 rounded-2xl p-6 border-2 border-green-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">✅</span>
            </div>
            <h4 className="text-xl font-serif font-bold text-forest-800">
              You Found
            </h4>
          </div>
          <ul className="space-y-2">
            {data.themes_identified.map((theme, idx) => (
              <li
                key={idx}
                className="text-sm text-forest-800 bg-green-50 px-4 py-2 rounded-xl font-semibold border border-green-200 flex items-center gap-2"
                style={{ animation: 'slideIn 0.5s ease-out', animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
              >
                <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
                {theme}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-paper-100/40 rounded-2xl p-6 border-2 border-red-400/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">💡</span>
            </div>
            <h4 className="text-xl font-serif font-bold text-forest-800">
              You Missed
            </h4>
          </div>
          <ul className="space-y-2">
            {data.themes_missing.map((theme, idx) => (
              <li
                key={idx}
                className="text-sm text-forest-800 bg-red-50 px-4 py-2 rounded-xl font-semibold border border-red-200 flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0" />
                {theme}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center py-4">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-forest-100 to-gold-100 rounded-full border-2 border-forest-300/30">
          <span className="text-xl">🧩</span>
          <p className="text-sm font-bold text-forest-800">
            All the pieces are here—make your final guess!
          </p>
        </div>
      </div>
    </div>
  );
}
