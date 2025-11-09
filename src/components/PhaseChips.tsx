interface PhaseChipsProps {
  words: string[];
  revealed: boolean;
}

export default function PhaseChips({ words, revealed }: PhaseChipsProps) {
  if (!revealed) return null;

  return (
    <div className="space-y-5 animate-[unfoldNote_0.6s_ease-out]">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-serif font-bold text-forest/90">
          The Note Opens Further
        </h2>
        <p className="text-sm text-forest/60">Five revealing words</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {words.map((word, index) => (
          <div
            key={index}
            className="px-6 py-3 bg-gradient-to-br from-white to-cream rounded-2xl text-forest font-semibold text-lg shadow-md border-2 border-neutral-200 hover:border-gold hover:scale-105 hover:shadow-xl transition-all duration-200"
            style={{
              animation: `fadeIn 0.4s ease-out ${index * 100}ms both`,
            }}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
}
