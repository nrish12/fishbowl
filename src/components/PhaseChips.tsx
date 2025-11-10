interface PhaseChipsProps {
  words: string[];
  revealed: boolean;
}

export default function PhaseChips({ words, revealed }: PhaseChipsProps) {
  if (!revealed) return null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 animate-fade-in">
        <div className="inline-block px-4 py-1 bg-gold-100 rounded-full mb-2 border border-gold-300/30">
          <span className="text-xs font-bold text-gold-700 uppercase tracking-widest">Phase 3</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-forest-800">
          Five Revealing Words
        </h2>
        <p className="text-sm text-forest-600 italic">The note opens further</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
        {words.map((word, index) => (
          <div
            key={index}
            className="relative group animate-[fadeInUp_0.7s_cubic-bezier(0.34,1.26,0.64,1)]"
            style={{ animationDelay: `${index * 0.12 + 0.3}s`, animationFillMode: 'both' }}
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-forest-300/40 to-gold-300/40 rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity" />

            <div className="relative px-6 py-3 bg-paper-cream rounded-2xl secret-note-shadow paper-texture transform hover:scale-105 transition-all duration-300 border border-forest-300/20">
              <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-forest-500/40" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-gold-500/50" />

              <span className="text-lg font-bold text-forest-800">{word}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
