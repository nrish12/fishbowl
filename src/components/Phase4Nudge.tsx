interface Phase4NudgeProps {
  nudge: string;
  keywords: string[];
}

export default function Phase4Nudge({ nudge, keywords }: Phase4NudgeProps) {
  return (
    <div className="w-full max-w-3xl mx-auto perspective-1200 animate-paper-unfold">
      <div className="text-center space-y-2 mb-6">
        <div className="inline-block px-4 py-1 bg-echo-glow/10 rounded-full mb-2">
          <span className="text-xs font-bold text-echo-glow uppercase tracking-widest">Phase 4 • AI Nudge</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-ink-500">
          A Whispered Hint
        </h2>
        <p className="text-sm text-ink-300">The AI sees your pattern</p>
      </div>

      <div className="relative">
        <div className="absolute -inset-6 bg-gradient-to-br from-echo-glow/10 to-echo-soft/10 rounded-3xl blur-2xl animate-pulse" style={{ animationDuration: '3s' }} />

        <div className="relative bg-white rounded-3xl p-10 paper-shadow paper-texture">
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10 rounded-3xl" viewBox="0 0 400 300" preserveAspectRatio="none">
            <line x1="200" y1="0" x2="200" y2="300" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" className="text-echo-glow" />
            <line x1="0" y1="150" x2="400" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="5,5" className="text-echo-glow" />
          </svg>

          <div className="absolute top-6 left-6 w-4 h-4 rounded-full bg-gradient-to-br from-echo-glow to-echo-soft shadow-md" />
          <div className="absolute top-6 right-6 w-4 h-4 rounded-full bg-gradient-to-br from-echo-glow to-echo-soft shadow-md" />
          <div className="absolute bottom-6 left-6 w-4 h-4 rounded-full bg-gradient-to-br from-echo-glow to-echo-soft shadow-md" />
          <div className="absolute bottom-6 right-6 w-4 h-4 rounded-full bg-gradient-to-br from-echo-glow to-echo-soft shadow-md" />

          <div className="text-center space-y-6 relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-echo-glow to-echo-soft shadow-xl relative animate-echo-pulse">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
              <span className="text-4xl relative z-10">💭</span>
            </div>

            <div className="relative py-6">
              <div className="absolute left-0 top-0 text-6xl text-echo-glow/20 font-serif leading-none select-none">"</div>
              <div className="absolute right-0 bottom-0 text-6xl text-echo-glow/20 font-serif leading-none select-none">"</div>

              <div className="relative bg-paper-50 backdrop-blur-md rounded-2xl p-8 shadow-inner border-2 border-echo-glow/20">
                <p className="text-xl text-ink-500 leading-relaxed font-script px-6">
                  {nudge}
                </p>
              </div>
            </div>

            {keywords && keywords.length > 0 && (
              <div className="pt-4">
                <p className="text-xs text-ink-300 mb-3 uppercase tracking-widest font-bold">Key Words</p>
                <div className="flex justify-center flex-wrap gap-3">
                  {keywords.map((keyword, idx) => (
                    <div
                      key={idx}
                      className="group relative animate-[fadeIn_0.5s_ease-out]"
                      style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
                    >
                      <div className="absolute -inset-1 bg-gradient-to-r from-echo-glow to-echo-soft rounded-full blur opacity-30 group-hover:opacity-50 transition-all" />
                      <span className="relative block px-6 py-2 bg-white border-2 border-echo-glow/30 text-ink-500 rounded-full text-sm font-bold shadow-md hover:scale-105 transition-transform">
                        {keyword}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-ink-200/30">
              <p className="text-sm text-ink-300 flex items-center justify-center gap-2 font-medium">
                <span className="text-lg">🎯</span>
                <span>You're closer than you think</span>
              </p>
            </div>
          </div>

          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
