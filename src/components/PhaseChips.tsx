interface PhaseChipsProps {
  words: string[];
  revealed: boolean;
}

export default function PhaseChips({ words, revealed }: PhaseChipsProps) {
  if (!revealed) return null;

  return (
    <div className="space-y-3 sm:space-y-6">
      <div className="text-center space-y-1 sm:space-y-2 animate-fade-in">
        <h2 className="text-lg sm:text-2xl font-serif font-bold text-forest-800">
          Five Key Words
        </h2>
        <p className="text-xs sm:text-sm text-forest-600 italic">The mystery deepens</p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 max-w-3xl mx-auto">
        {words.map((word, index) => (
          <div
            key={index}
            className="relative group"
            style={{ animation: 'fadeInUp 0.7s cubic-bezier(0.34,1.26,0.64,1)', animationDelay: `${index * 0.12 + 0.3}s`, animationFillMode: 'both' }}
          >
            <div className="absolute -inset-1 bg-gradient-to-br from-forest-300/40 to-gold-300/40 rounded-xl sm:rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity" />

            <div className="relative px-3 py-2 sm:px-6 sm:py-3 bg-paper-100/50 rounded-xl sm:rounded-2xl border-2 border-forest-300/30 backdrop-blur-sm transform hover:scale-105 transition-all duration-300">
              <span className="text-sm sm:text-lg font-bold text-forest-800">{word}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
