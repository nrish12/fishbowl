interface Phase4NudgeProps {
  nudge: string;
  keywords: string[];
}

export default function Phase4Nudge({ nudge, keywords }: Phase4NudgeProps) {
  return (
    <div className="w-full max-w-5xl mx-auto py-4">
      <div className="text-center mb-6">
        <div className="inline-block px-5 py-2 bg-purple-100 rounded-full border border-purple-300/40 mb-3">
          <span className="text-sm font-bold text-purple-700 uppercase tracking-widest">Phase 4 • AI Nudge</span>
        </div>
        <h2 className="text-3xl font-serif font-bold text-ink-600 mb-2">
          A Whispered Hint
        </h2>
        <p className="text-sm text-ink-400">The AI sees your pattern</p>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl p-10 border-2 border-purple-200/60 shadow-sm mb-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <svg className="w-12 h-12 mx-auto mb-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <blockquote className="text-center">
            <p className="text-2xl font-serif text-ink-700 leading-relaxed italic mb-6">
              "{nudge}"
            </p>
          </blockquote>
        </div>
      </div>

      {keywords && keywords.length > 0 && (
        <div className="text-center">
          <p className="text-sm font-bold text-purple-700 uppercase tracking-widest mb-4">
            Key Words
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="px-6 py-3 bg-white border-2 border-purple-300 text-purple-900 rounded-2xl text-lg font-bold shadow-sm hover:shadow-md transition-shadow"
                style={{ animation: 'fadeIn 0.5s ease-out', animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
