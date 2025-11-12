interface SentenceCardProps {
  sentence: string;
  revealed: boolean;
  onReveal?: () => void;
}

export default function SentenceCard({ sentence, revealed }: SentenceCardProps) {
  if (!revealed) return null;

  const textLength = sentence.length;
  const fontSize = textLength < 60 ? 'text-3xl' : textLength < 100 ? 'text-2xl' : textLength < 150 ? 'text-xl' : 'text-lg';

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-serif font-bold text-forest-800">
          The Second Fold Opens
        </h2>
        <p className="text-sm text-forest-600 italic">One revealing sentence</p>
      </div>

      <div className="relative max-w-2xl mx-auto">
        <div className="relative bg-paper-100/40 rounded-2xl p-8 border border-gold-300/30 backdrop-blur-sm">
          <div className="relative">
            <div className="absolute -left-3 -top-2 text-5xl text-forest-400/30 font-serif leading-none select-none pointer-events-none">"</div>
            <p className={`${fontSize} text-ink-charcoal leading-relaxed font-medium text-center px-6 relative z-10`}>
              {sentence}
            </p>
            <div className="absolute -right-3 -bottom-2 text-5xl text-forest-400/30 font-serif leading-none select-none pointer-events-none">"</div>
          </div>
        </div>
      </div>
    </div>
  );
}
