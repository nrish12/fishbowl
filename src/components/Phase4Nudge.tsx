interface Phase4NudgeProps {
  nudge: string;
  keywords: string[];
}

export default function Phase4Nudge({ nudge, keywords }: Phase4NudgeProps) {
  return (
    <div className="w-full mx-auto">
      <div className="text-center mb-4">
        <div className="inline-block px-4 py-1 bg-purple-100 rounded-full border border-purple-300/30">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-widest">Phase 4 • AI Nudge</span>
        </div>
        <h2 className="text-lg font-serif font-bold text-ink-500 mt-2">
          A Whispered Hint
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        <div className="lg:col-span-3">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-200/50 shadow-sm">
            <p className="text-base text-ink-600 leading-relaxed font-script italic">
              "{nudge}"
            </p>
          </div>
        </div>

        {keywords && keywords.length > 0 && (
          <div className="lg:col-span-2">
            <div className="bg-purple-50/70 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-200/50 shadow-sm h-full flex flex-col justify-center">
              <p className="text-xs text-purple-700 mb-3 uppercase tracking-widest font-bold text-center">
                Key Words
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-white border-2 border-purple-300 text-purple-800 rounded-xl text-sm font-bold shadow-sm"
                    style={{ animation: 'fadeIn 0.5s ease-out', animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
