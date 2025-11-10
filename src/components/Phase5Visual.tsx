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
    <div className="space-y-8 w-full max-w-5xl mx-auto animate-paper-unfold">
      <div className="text-center space-y-2">
        <div className="inline-block px-4 py-1 bg-forest-100 rounded-full mb-2 border border-forest-300/30">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-widest">Phase 5 • Final Chance</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-forest-800">
          The Complete Picture
        </h2>
        <p className="text-sm text-forest-600">All pieces revealed</p>
      </div>

      <div className="relative">
        <div className="absolute -inset-6 bg-gradient-to-br from-forest-200/40 to-gold-200/30 rounded-3xl blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />

        <div className="relative bg-paper-cream rounded-3xl p-12 shadow-[var(--shadow-envelope)] paper-texture">
          <div className="text-center space-y-6 relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 shadow-2xl relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-transparent" />
              <span className="text-5xl relative z-10">🔮</span>
            </div>

            <div className="relative py-8">
              <div className="absolute left-0 top-0 text-7xl text-forest-400/15 font-serif leading-none select-none">"</div>
              <div className="absolute right-0 bottom-0 text-7xl text-forest-400/15 font-serif leading-none select-none">"</div>

              <div className="relative bg-paper-100 backdrop-blur-lg rounded-3xl p-10 shadow-inner border-2 border-forest-300/30">
                <p className="text-2xl text-forest-800 leading-relaxed font-serif px-4">
                  {data.synthesis}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
        </div>
      </div>

      <div className="bg-paper-cream rounded-3xl p-8 shadow-[var(--shadow-paper)] paper-texture border-2 border-forest-300/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-forest-500 to-forest-700 flex items-center justify-center shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="text-2xl font-serif font-bold text-forest-800">Your Path to the Answer</h4>
        </div>

        <div className="space-y-4">
          {data.semantic_scores.map((item, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl border-2 transition-all duration-500 hover:scale-[1.01] bg-paper-100 shadow-[var(--shadow-paper)]"
              style={{
                animation: `fadeIn 0.6s ease-out ${idx * 100}ms both`,
                borderColor: item.score >= 70 ? '#10b981' : item.score >= 50 ? '#f59e0b' : '#ef4444',
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-forest-800 text-2xl">{item.guess}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-forest-600">Closeness</span>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-forest-500 to-gold-500 rounded-full blur-md opacity-30" />
                      <span className="relative block text-lg font-bold px-5 py-2 rounded-full bg-paper-cream shadow-lg border-2 border-forest-300/30">
                        {item.score}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative w-full bg-paper-200 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
                  <div
                    className="h-4 rounded-full transition-all duration-[1500ms] shadow-md"
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

                <p className="text-base text-ink-muted italic leading-relaxed font-medium">
                  {item.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-paper-cream rounded-3xl p-8 shadow-[var(--shadow-paper)] border-2 border-green-400/30 paper-texture">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">✅</span>
            </div>
            <h4 className="text-xl font-serif font-bold text-forest-800">
              You Found
            </h4>
          </div>
          <ul className="space-y-3">
            {data.themes_identified.map((theme, idx) => (
              <li
                key={idx}
                className="text-base text-forest-800 bg-green-50 px-5 py-3 rounded-xl font-semibold shadow-sm border border-green-200 flex items-center gap-3 animate-[slideIn_0.5s_ease-out]"
                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
              >
                <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
                {theme}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-paper-cream rounded-3xl p-8 shadow-[var(--shadow-paper)] border-2 border-red-400/30 paper-texture">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">💡</span>
            </div>
            <h4 className="text-xl font-serif font-bold text-forest-800">
              You Missed
            </h4>
          </div>
          <ul className="space-y-3">
            {data.themes_missing.map((theme, idx) => (
              <li
                key={idx}
                className="text-base text-forest-800 bg-red-50 px-5 py-3 rounded-xl font-semibold shadow-sm border border-red-200 flex items-center gap-3 animate-pulse"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <span className="w-2 h-2 rounded-full bg-red-600 flex-shrink-0 animate-ping" />
                {theme}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center py-6">
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-forest-100 to-gold-100 rounded-full border-2 border-forest-300/30 shadow-xl paper-texture">
          <span className="text-2xl">🧩</span>
          <p className="text-base font-bold text-forest-800">
            All the pieces are here—make your final guess!
          </p>
        </div>
      </div>
    </div>
  );
}
