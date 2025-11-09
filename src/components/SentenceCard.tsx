interface SentenceCardProps {
  sentence: string;
  revealed: boolean;
  onReveal?: () => void;
}

export default function SentenceCard({ sentence, revealed, onReveal }: SentenceCardProps) {
  if (!revealed && !onReveal) return null;

  if (!revealed && onReveal) {
    return (
      <div className="text-center space-y-3">
        <p className="text-sm text-neutral-600">Need more context?</p>
        <button
          onClick={onReveal}
          className="px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-gold hover:text-neutral-900 transition-colors duration-200"
        >
          Reveal Sentence
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-[unfoldNote_0.6s_ease-out]">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-serif font-bold text-forest/90">
          Another Layer Unfolds
        </h2>
        <p className="text-sm text-forest/60">One revealing sentence</p>
      </div>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 to-yellow-100/30 rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-br from-white to-cream border-2 border-gold/40 rounded-2xl p-8 shadow-lg">
          <div className="absolute top-4 left-4 w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
          </div>
          <p className="text-lg text-forest leading-relaxed text-center font-medium">
            {sentence}
          </p>
        </div>
      </div>
    </div>
  );
}
