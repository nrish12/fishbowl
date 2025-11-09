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
    <div className="space-y-8 w-full max-w-5xl mx-auto">
      <div className="relative animate-[unfoldNote_1.4s_ease-out]">
        <div className="absolute -inset-6 bg-gradient-to-br from-purple-200/30 via-pink-200/30 to-rose-200/30 rounded-[3rem] blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />

        <div className="relative">
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 600 400" preserveAspectRatio="none">
            <line x1="300" y1="0" x2="300" y2="400" stroke="#9333ea" strokeWidth="2" opacity="0.3" strokeDasharray="8,8"/>
            <line x1="0" y1="200" x2="600" y2="200" stroke="#9333ea" strokeWidth="2" opacity="0.3" strokeDasharray="8,8"/>

            <line x1="150" y1="0" x2="150" y2="400" stroke="#ec4899" strokeWidth="1" opacity="0.2" strokeDasharray="4,4"/>
            <line x1="450" y1="0" x2="450" y2="400" stroke="#ec4899" strokeWidth="1" opacity="0.2" strokeDasharray="4,4"/>
            <line x1="0" y1="100" x2="600" y2="100" stroke="#ec4899" strokeWidth="1" opacity="0.2" strokeDasharray="4,4"/>
            <line x1="0" y1="300" x2="600" y2="300" stroke="#ec4899" strokeWidth="1" opacity="0.2" strokeDasharray="4,4"/>
          </svg>

          <div
            className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-[3rem] p-12 shadow-2xl border-2 border-purple-300/60"
            style={{
              boxShadow: '0 30px 80px rgba(147,51,234,0.2), inset 0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(236,72,153,0.3)',
            }}
          >
            <div className="absolute top-8 left-8 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg" />
            <div className="absolute top-8 right-8 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg" />
            <div className="absolute bottom-8 left-8 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg" />
            <div className="absolute bottom-8 right-8 w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg" />

            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-2xl relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/50 to-transparent" />
                <span className="text-5xl relative z-10">🔮</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-3xl font-serif font-bold text-purple-900 tracking-tight">
                  The Complete Picture
                </h3>
                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                  <p className="text-xs uppercase tracking-[0.25em] text-purple-700 font-bold">
                    Phase 5 • Final Revelation
                  </p>
                  <div className="h-px w-16 bg-gradient-to-l from-transparent via-purple-500 to-transparent" />
                </div>
              </div>

              <div className="relative py-10">
                <div className="absolute left-0 top-0 text-7xl text-purple-400/20 font-serif leading-none select-none">"</div>
                <div className="absolute right-0 bottom-0 text-7xl text-purple-400/20 font-serif leading-none select-none">"</div>

                <div
                  className="relative bg-white/80 backdrop-blur-lg rounded-3xl p-10 shadow-inner border-2 border-purple-300/60"
                  style={{
                    boxShadow: 'inset 0 3px 12px rgba(147,51,234,0.1), 0 3px 6px rgba(0,0,0,0.06)',
                  }}
                >
                  <p className="text-2xl text-purple-950 leading-relaxed italic font-semibold px-4">
                    {data.synthesis}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-purple-50/50 rounded-3xl p-8 shadow-xl border-2 border-purple-200/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-lg">
            <span className="text-2xl">📊</span>
          </div>
          <h4 className="text-2xl font-serif font-bold text-purple-900">Your Path to the Answer</h4>
        </div>

        <div className="space-y-4">
          {data.semantic_scores.map((item, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] ${
                item.score >= 70
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400/60'
                  : item.score >= 50
                  ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400/60'
                  : 'bg-gradient-to-r from-red-100 to-rose-100 border-2 border-red-400/60'
              }`}
              style={{
                animation: `fadeIn 0.6s ease-out ${idx * 100}ms both`,
              }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-forest text-2xl">{item.guess}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-forest/60">Closeness Score</span>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-md opacity-50" />
                      <span className="relative block text-lg font-bold px-5 py-2 rounded-full bg-white shadow-lg border-2 border-purple-300">
                        {item.score}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="relative w-full bg-neutral-200 rounded-full h-4 mb-4 overflow-hidden shadow-inner">
                  <div
                    className={`h-4 rounded-full transition-all duration-[1500ms] shadow-md ${
                      item.score >= 70
                        ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600'
                        : item.score >= 50
                        ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600'
                        : 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600'
                    }`}
                    style={{
                      width: `${item.score}%`,
                      animationDelay: `${idx * 200}ms`,
                    }}
                  />
                </div>

                <p className="text-base text-forest/80 italic leading-relaxed font-medium">
                  {item.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8 shadow-xl border-2 border-green-400/60">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">✅</span>
            </div>
            <h4 className="text-xl font-serif font-bold text-green-900">
              Themes You Discovered
            </h4>
          </div>
          <ul className="space-y-3">
            {data.themes_identified.map((theme, idx) => (
              <li
                key={idx}
                className="text-base text-green-900 bg-white/70 backdrop-blur-sm px-5 py-3 rounded-xl font-semibold shadow-md border border-green-300/50 flex items-center gap-3 animate-[slideIn_0.5s_ease-out]"
                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'both' }}
              >
                <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
                {theme}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-red-100 to-rose-100 rounded-3xl p-8 shadow-xl border-2 border-red-400/60">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
              <span className="text-2xl">💡</span>
            </div>
            <h4 className="text-xl font-serif font-bold text-red-900">
              The Missing Pieces
            </h4>
          </div>
          <ul className="space-y-3">
            {data.themes_missing.map((theme, idx) => (
              <li
                key={idx}
                className="text-base text-red-900 bg-white/70 backdrop-blur-sm px-5 py-3 rounded-xl font-semibold shadow-md border border-red-300/50 flex items-center gap-3 animate-pulse"
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
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-200 via-pink-200 to-rose-200 rounded-full border-2 border-purple-400/60 shadow-xl">
          <span className="text-2xl animate-bounce">🧩</span>
          <p className="text-base font-bold text-purple-900">
            All the pieces are here—make your final guess!
          </p>
        </div>
      </div>
    </div>
  );
}
