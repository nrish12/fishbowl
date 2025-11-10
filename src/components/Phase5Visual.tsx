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
        <div className="inline-block px-4 py-1 bg-echo-glow/10 rounded-full mb-2">
          <span className="text-xs font-bold text-echo-glow uppercase tracking-widest">Phase 5 • Final Chance</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-ink-500">
          The Complete Picture
        </h2>
        <p className="text-sm text-ink-300">All pieces revealed</p>
      </div>

      <div className="relative">
        <div className="absolute -inset-6 bg-gradient-to-br from-echo-glow/10 to-echo-soft/10 rounded-3xl blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />

        <div className="relative bg-white rounded-3xl p-12 paper-shadow paper-texture">
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10 rounded-3xl" viewBox="0 0 600 400" preserveAspectRatio="none">
            <line x1="300" y1="0" x2="300" y2="400" stroke="currentColor" strokeWidth="2" strokeDasharray="8,8" className="text-echo-glow" />
            <line x1="0" y1="200" x2="600" y2="200" stroke="currentColor" strokeWidth="2" strokeDasharray="8,8" className="text-echo-glow" />
            <line x1="150" y1="0" x2="150" y2="400" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" className="text-echo-soft" />
            <line x1="450" y1="0" x2="450" y2="400" stroke="currentColor" strokeWidth="1" strokeDasharray="4,4" className="text-echo-soft" />
          </svg>

          <div className="absolute top-8 left-8 w-6 h-6 rounded-full bg-gradient-to-br from-echo-glow to-echo-soft shadow-lg" />
          <div className="absolute top-8 right-8 w-6 h-6 rounded-full bg-gradient-to-br from-echo-glow to-echo-soft shadow-lg" />
          <div className="absolute bottom-8 left-8 w-6 h-6 rounded-full bg-gradient-to-br from-echo-glow to-echo-soft shadow-lg" />
          <div className="absolute bottom-8 right-8 w-6 h-6 rounded-full bg-gradient-to-br from-echo-glow to-echo-soft shadow-lg" />

          <div className="text-center space-y-6 relative z-10">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-echo-glow to-echo-soft shadow-2xl relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-transparent" />
              <span className="text-5xl relative z-10">🔮</span>
            </div>

            <div className="relative py-8">
              <div className="absolute left-0 top-0 text-7xl text-echo-glow/15 font-serif leading-none select-none">"</div>
              <div className="absolute right-0 bottom-0 text-7xl text-echo-glow/15 font-serif leading-none select-none">"</div>

              <div className="relative bg-paper-50 backdrop-blur-lg rounded-3xl p-10 shadow-inner border-2 border-echo-glow/20">
                <p className="text-2xl text-ink-500 leading-relaxed font-script px-4">
                  {data.synthesis}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 paper-shadow paper-texture">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-echo-glow to-echo-soft flex items-center justify-center shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="text-2xl font-serif font-bold text-ink-500">Your Path to the Answer</h4>
        </div>

        <div className="space-y-4">
          {data.semantic_scores.map((item, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl border-2 transition-all duration-500 hover:scale-[1.01] bg-white paper-shadow"
              style={{
                animation: `fadeIn 0.6s ease-out ${idx * 100}ms both`,
                borderColor: item.score >= 70 ? '#10b981' : item.score >= 50 ? '#f59e0b' : '#ef4444',
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-ink-500 text-2xl">{item.guess}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-ink-300">Closeness</span>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-echo-glow to-echo-soft rounded-full blur-md opacity-30" />
                      <span className="relative block text-lg font-bold px-5 py-2 rounded-full bg-white shadow-lg border-2 border-echo-glow/30">
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

                <p className="text-base text-ink-400 italic leading-relaxed font-medium">
                  {item.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 paper-shadow border-2 border-green-400/30 paper-texture">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">✅</span>
            </div>
            <h4 className="text-xl font-serif font-bold text-ink-500">
              You Found
            </h4>
          </div>
          <ul className="space-y-3">
            {data.themes_identified.map((theme, idx) => (
              <li
                key={idx}
                className="text-base text-ink-500 bg-green-50 px-5 py-3 rounded-xl font-semibold shadow-sm border border-green-200 flex items-center gap-3 animate-[slideIn_0.5s_ease-out]"
                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
              >
                <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
                {theme}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-3xl p-8 paper-shadow border-2 border-red-400/30 paper-texture">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">💡</span>
            </div>
            <h4 className="text-xl font-serif font-bold text-ink-500">
              You Missed
            </h4>
          </div>
          <ul className="space-y-3">
            {data.themes_missing.map((theme, idx) => (
              <li
                key={idx}
                className="text-base text-ink-500 bg-red-50 px-5 py-3 rounded-xl font-semibold shadow-sm border border-red-200 flex items-center gap-3 animate-pulse"
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
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-echo-glow/20 to-echo-soft/20 rounded-full border-2 border-echo-glow/30 shadow-xl paper-texture">
          <span className="text-2xl">🧩</span>
          <p className="text-base font-bold text-ink-500">
            All the pieces are here—make your final guess!
          </p>
        </div>
      </div>
    </div>
  );
}
