interface PhaseChipsProps {
  words: string[];
  revealed: boolean;
}

export default function PhaseChips({ words, revealed }: PhaseChipsProps) {
  if (!revealed) return null;

  return (
    <div className="space-y-6 animate-paper-unfold">
      <div className="text-center space-y-2">
        <div className="inline-block px-4 py-1 bg-fold-indigo/10 rounded-full mb-2">
          <span className="text-xs font-bold text-fold-indigo uppercase tracking-widest">Phase 3</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-ink-500">
          Five Revealing Words
        </h2>
        <p className="text-sm text-ink-300">The note opens further</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
        {words.map((word, index) => (
          <div
            key={index}
            className="relative group animate-[fadeIn_0.5s_ease-out]"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-fold-indigo to-fold-purple rounded-2xl blur opacity-25 group-hover:opacity-50 transition-opacity" />

            <div className="relative px-6 py-3 bg-white rounded-2xl paper-shadow paper-texture transform hover:scale-105 transition-all duration-300">
              <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-fold-indigo/30" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-fold-indigo/30" />

              <span className="text-lg font-bold text-ink-500">{word}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
