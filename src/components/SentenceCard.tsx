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
    <div className="space-y-3 animate-[fadeIn_0.3s_ease-in-out]">
      <h2 className="text-lg font-semibold text-neutral-700 text-center">
        One sentence. Connect the dots.
      </h2>
      <div className="bg-white border-2 border-gold/30 rounded-2xl p-6 shadow-sm">
        <p className="text-lg text-neutral-900 leading-relaxed text-center">
          {sentence}
        </p>
      </div>
    </div>
  );
}
