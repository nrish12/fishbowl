interface Phase4NudgeProps {
  nudge: string;
  keywords: string[];
}

export default function Phase4Nudge({ nudge, keywords }: Phase4NudgeProps) {
  const textLength = nudge.length;
  const fontSize = textLength < 60 ? 'text-base sm:text-xl' : textLength < 100 ? 'text-sm sm:text-lg' : textLength < 150 ? 'text-xs sm:text-base' : 'text-xs sm:text-sm';

  return (
    <div className="w-full mx-auto space-y-3 sm:space-y-4">
      <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border-2 border-purple-200/60 shadow-sm">
        <blockquote className="text-center">
          <p className={`${fontSize} font-serif text-ink-700 leading-relaxed italic`}>
            "{nudge}"
          </p>
        </blockquote>
      </div>

      {keywords && keywords.length > 0 && (
        <div className="bg-purple-50/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 border-2 border-purple-200/60 shadow-sm">
          <p className="text-[10px] sm:text-xs font-bold text-purple-700 uppercase tracking-widest mb-2 sm:mb-3 text-center">
            Key Words
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {keywords.map((keyword, idx) => (
              <div
                key={idx}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white border-2 border-purple-300 text-purple-900 rounded-lg text-xs sm:text-sm font-bold shadow-sm"
                style={{ animation: 'fadeIn 0.5s ease-out', animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
              >
                {keyword}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
