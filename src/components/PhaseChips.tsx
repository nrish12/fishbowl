interface PhaseChipsProps {
  words: string[];
  revealed: boolean;
}

export default function PhaseChips({ words, revealed }: PhaseChipsProps) {
  if (!revealed) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-neutral-700 text-center">
        Five words. Build the picture.
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {words.map((word, index) => (
          <div
            key={index}
            className="px-6 py-3 bg-white border-2 border-neutral-200 rounded-full text-neutral-900 font-medium text-lg shadow-sm animate-[fadeIn_0.3s_ease-in-out] hover:border-gold hover:scale-105 transition-all duration-200"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
}
