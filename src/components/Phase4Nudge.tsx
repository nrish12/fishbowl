interface Phase4NudgeProps {
  nudge: string;
  keywords: string[];
}

export default function Phase4Nudge({ nudge, keywords }: Phase4NudgeProps) {
  return (
    <div className="w-full max-w-2xl mx-auto animate-[unfoldNote_0.8s_ease-out]">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 to-yellow-100/40 rounded-2xl blur-xl" />

        <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-cream rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 border-amber-200/50">
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-amber-300/30 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-400" />
          </div>

          <div className="text-center space-y-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-amber-200 to-yellow-200 shadow-sm">
              <span className="text-2xl">✨</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-forest/90">
                A Helpful Nudge
              </h3>
              <p className="text-xs uppercase tracking-widest text-forest/50 font-semibold">
                Phase 4
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-2 top-0 text-4xl text-amber-300/40 font-serif leading-none">"</div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-inner border border-amber-200/50">
                <p className="text-lg text-forest font-medium leading-relaxed italic px-4">
                  {nudge}
                </p>
              </div>
              <div className="absolute -right-2 bottom-0 text-4xl text-amber-300/40 font-serif leading-none">"</div>
            </div>

            {keywords.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-forest/50 mb-2 uppercase tracking-wide font-semibold">Key Words</p>
                <div className="flex justify-center flex-wrap gap-2">
                  {keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-forest/80 rounded-full text-sm font-semibold border border-amber-300/50 shadow-sm"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <p className="text-sm text-forest/60 flex items-center justify-center gap-2">
                <span>💭</span>
                <span className="font-medium">Think carefully... you're getting close</span>
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
        </div>
      </div>
    </div>
  );
}
