interface Phase4NudgeProps {
  nudge: string;
  keywords: string[];
}

export default function Phase4Nudge({ nudge, keywords }: Phase4NudgeProps) {
  return (
    <div className="w-full max-w-3xl mx-auto perspective-1000">
      <div className="relative animate-[unfoldNote_1.2s_ease-out]">
        <div className="absolute -inset-4 bg-gradient-to-br from-amber-200/30 via-yellow-200/30 to-orange-200/30 rounded-3xl blur-2xl animate-pulse" />

        <div className="relative">
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 400 300" preserveAspectRatio="none">
            <line x1="200" y1="0" x2="200" y2="300" stroke="#C9A961" strokeWidth="1" opacity="0.4" strokeDasharray="5,5"/>
            <line x1="0" y1="150" x2="400" y2="150" stroke="#C9A961" strokeWidth="1" opacity="0.4" strokeDasharray="5,5"/>

            <circle cx="30" cy="30" r="12" fill="none" stroke="#8B7355" strokeWidth="1.5" opacity="0.3"/>
            <circle cx="370" cy="30" r="12" fill="none" stroke="#8B7355" strokeWidth="1.5" opacity="0.3"/>
            <circle cx="30" cy="270" r="12" fill="none" stroke="#8B7355" strokeWidth="1.5" opacity="0.3"/>
            <circle cx="370" cy="270" r="12" fill="none" stroke="#8B7355" strokeWidth="1.5" opacity="0.3"/>
          </svg>

          <div
            className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-cream rounded-3xl p-10 shadow-2xl border-2 border-amber-300/60"
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 3px rgba(201,169,97,0.3)',
              background: 'linear-gradient(135deg, #FFF8E7 0%, #FFEAA7 50%, #FFF5D7 100%)',
            }}
          >
            <div className="absolute top-6 left-6 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md" />
            <div className="absolute top-6 right-6 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md" />
            <div className="absolute bottom-6 left-6 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md" />
            <div className="absolute bottom-6 right-6 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md" />

            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-300 to-yellow-400 shadow-xl relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/40 to-transparent" />
                <span className="text-4xl relative z-10 animate-bounce">💭</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-bold text-amber-900 tracking-tight">
                  A Whispered Clue
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400" />
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-700 font-semibold">
                    Phase 4
                  </p>
                  <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400" />
                </div>
              </div>

              <div className="relative py-8">
                <div className="absolute left-0 top-0 text-6xl text-amber-400/30 font-serif leading-none select-none">"</div>
                <div className="absolute right-0 bottom-0 text-6xl text-amber-400/30 font-serif leading-none select-none">"</div>

                <div
                  className="relative bg-white/70 backdrop-blur-md rounded-2xl p-8 shadow-inner border border-amber-300/50"
                  style={{
                    boxShadow: 'inset 0 2px 8px rgba(201,169,97,0.1), 0 2px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <p className="text-xl text-amber-950 leading-relaxed italic font-medium px-6">
                    {nudge}
                  </p>
                </div>
              </div>

              {keywords && keywords.length > 0 && (
                <div className="pt-4">
                  <p className="text-xs text-amber-700/70 mb-3 uppercase tracking-widest font-bold">Key Threads</p>
                  <div className="flex justify-center flex-wrap gap-3">
                    {keywords.map((keyword, idx) => (
                      <div
                        key={idx}
                        className="group relative animate-[fadeIn_0.5s_ease-out]"
                        style={{ animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-300 to-yellow-300 rounded-full blur-sm group-hover:blur-md transition-all" />
                        <span className="relative block px-6 py-2 bg-gradient-to-r from-amber-200 to-yellow-200 text-amber-900 rounded-full text-sm font-bold border-2 border-amber-400/60 shadow-md hover:scale-105 transition-transform">
                          {keyword}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t-2 border-dashed border-amber-300/50">
                <p className="text-sm text-amber-800 flex items-center justify-center gap-2 font-medium">
                  <span className="text-lg">🎯</span>
                  <span>You're closer than you think...</span>
                </p>
              </div>
            </div>

            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
