interface Phase4NudgeProps {
  nudge: string;
  keywords: string[];
}

export default function Phase4Nudge({ nudge, keywords }: Phase4NudgeProps) {
  return (
    <div className="w-full mx-auto space-y-3">
      <div className="text-center space-y-1.5">
        <div className="inline-block px-4 py-1 bg-purple-100 rounded-full border border-purple-300/30">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">Phase 4 • AI Nudge</span>
        </div>
        <h2 className="text-xl font-serif font-bold text-ink-500">
          A Whispered Hint
        </h2>
        <p className="text-xs text-ink-300">The AI sees your pattern</p>
      </div>

      <div className="relative">
        <div className="relative bg-paper-100/50 rounded-2xl p-6 border-2 border-purple-300/30 backdrop-blur-sm">
          <div className="text-center space-y-4 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg">
              <span className="text-2xl">💭</span>
            </div>

            <div className="relative">
              <div className="relative bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-purple-200/50">
                <p className="text-base text-ink-500 leading-relaxed font-script">
                  {nudge}
                </p>
              </div>
            </div>

            {keywords && keywords.length > 0 && (
              <div className="pt-1">
                <p className="text-xs text-ink-300 mb-2 uppercase tracking-widest font-bold">Key Words</p>
                <div className="flex justify-center flex-wrap gap-2">
                  {keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-purple-100 border border-purple-300/50 text-ink-500 rounded-full text-xs font-bold"
                      style={{ animation: 'fadeIn 0.5s ease-out', animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
