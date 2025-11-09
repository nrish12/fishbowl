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
    <div className="space-y-6 animate-[unfoldNote_1s_ease-out]">
      <div className="relative w-full max-w-3xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/30 to-pink-100/30 rounded-3xl blur-2xl" />

        <div className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-cream rounded-3xl p-8 shadow-[0_12px_40px_rgb(0,0,0,0.15)] border-2 border-purple-200/50">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 shadow-md">
              <span className="text-3xl">🔮</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold text-forest/90">
                The Full Picture
              </h3>
              <p className="text-xs uppercase tracking-widest text-forest/50 font-semibold">
                Phase 5 • Final Chance
              </p>
            </div>

            <div className="relative mt-6">
              <div className="absolute -left-3 top-0 text-5xl text-purple-300/30 font-serif leading-none">"</div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-inner border border-purple-200/50">
                <p className="text-xl text-forest font-medium leading-relaxed italic">
                  {data.synthesis}
                </p>
              </div>
              <div className="absolute -right-3 bottom-0 text-5xl text-purple-300/30 font-serif leading-none">"</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-neutral-200">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-2xl">📊</span>
          <h4 className="text-lg font-serif font-bold text-forest">Your Guesses, Ranked</h4>
        </div>

        <div className="space-y-3">
          {data.semantic_scores.map((item, idx) => (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-[1.01] ${
                item.score >= 70
                  ? 'bg-green-50 border-green-300 shadow-sm'
                  : item.score >= 50
                  ? 'bg-yellow-50 border-yellow-300 shadow-sm'
                  : 'bg-red-50 border-red-300 shadow-sm'
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-forest text-lg">{item.guess}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-forest/60">Closeness:</span>
                    <span className="text-base font-bold px-3 py-1 rounded-full bg-white shadow-sm border border-neutral-200">
                      {item.score}%
                    </span>
                  </div>
                </div>

                <div className="relative w-full bg-neutral-200 rounded-full h-2.5 mb-3 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-1000 ${
                      item.score >= 70
                        ? 'bg-gradient-to-r from-green-400 to-green-600'
                        : item.score >= 50
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                        : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    style={{
                      width: `${item.score}%`,
                      animationDelay: `${idx * 150}ms`,
                    }}
                  />
                </div>

                <p className="text-sm text-forest/70 italic leading-relaxed">
                  {item.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border-2 border-green-300">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✅</span>
            <h4 className="text-base font-serif font-bold text-green-900">
              Themes You Found
            </h4>
          </div>
          <ul className="space-y-2">
            {data.themes_identified.map((theme, idx) => (
              <li
                key={idx}
                className="text-sm text-green-900 bg-white/60 backdrop-blur-sm px-4 py-2.5 rounded-lg font-medium shadow-sm border border-green-200/50 flex items-center gap-2"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                {theme}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 shadow-lg border-2 border-red-300">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💡</span>
            <h4 className="text-base font-serif font-bold text-red-900">
              What You Missed
            </h4>
          </div>
          <ul className="space-y-2">
            {data.themes_missing.map((theme, idx) => (
              <li
                key={idx}
                className="text-sm text-red-900 bg-white/60 backdrop-blur-sm px-4 py-2.5 rounded-lg font-medium shadow-sm border border-red-200/50 flex items-center gap-2 animate-pulse"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {theme}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border-2 border-purple-300/50 shadow-sm">
          <span className="text-lg">🧩</span>
          <p className="text-sm font-semibold text-purple-900">
            Connect the dots... this is your final chance
          </p>
        </div>
      </div>
    </div>
  );
}
