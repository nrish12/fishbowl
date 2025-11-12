interface Phase4NudgeProps {
  nudge: string;
  keywords: string[];
}

export default function Phase4Nudge({ nudge, keywords }: Phase4NudgeProps) {
  const textLength = nudge.length;
  const fontSize = textLength < 60 ? 'text-2xl' : textLength < 100 ? 'text-xl' : textLength < 150 ? 'text-lg' : 'text-base';

  return (
    <div className="w-full mx-auto py-1">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border-2 border-purple-200/60 shadow-sm h-full flex items-center justify-center">
            <blockquote className="text-center">
              <p className={`${fontSize} font-serif text-ink-700 leading-relaxed italic`}>
                "{nudge}"
              </p>
            </blockquote>
          </div>
        </div>

        {keywords && keywords.length > 0 && (
          <div className="lg:col-span-1">
            <div className="bg-purple-50/80 rounded-2xl p-3 border-2 border-purple-200/60 shadow-sm h-full flex flex-col">
              <p className="text-xs font-bold text-purple-700 uppercase tracking-widest mb-2 text-center">
                Key Words
              </p>
              <div className="flex-1 flex flex-col justify-center gap-2">
                {keywords.map((keyword, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 bg-white border-2 border-purple-300 text-purple-900 rounded-xl text-sm font-bold shadow-sm text-center"
                    style={{ animation: 'fadeIn 0.5s ease-out', animationDelay: `${idx * 150}ms`, animationFillMode: 'both' }}
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
