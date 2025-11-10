interface SentenceCardProps {
  sentence: string;
  revealed: boolean;
  onReveal?: () => void;
}

export default function SentenceCard({ sentence, revealed }: SentenceCardProps) {
  if (!revealed) return null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 animate-fade-in">
        <div className="inline-block px-4 py-1 bg-forest-100 rounded-full mb-2 border border-forest-300/30">
          <span className="text-xs font-bold text-forest-700 uppercase tracking-widest">Phase 2</span>
        </div>
        <h2 className="text-2xl font-serif font-bold text-forest-800">
          The Second Fold Opens
        </h2>
        <p className="text-sm text-forest-600 italic">One revealing sentence</p>
      </div>

      <div className="relative max-w-2xl mx-auto animate-paper-settles">
        <div className="absolute -inset-4 bg-gradient-to-br from-forest-200/40 to-gold-200/30 rounded-2xl blur-xl animate-pulse" style={{ animationDuration: '3s' }} />

        <div className="relative bg-paper-cream rounded-2xl p-8 secret-note-shadow paper-texture border border-gold-300/30">
          <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-forest-400/30" />
          <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gold-400/40" />
          <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-gold-400/40" />
          <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-forest-400/30" />

          <div className="fold-crease absolute top-0 bottom-0 left-2/3 w-px" />

          <div className="relative">
            <div className="absolute -left-3 -top-2 text-5xl text-forest-400/30 font-serif leading-none select-none">"</div>
            <p className="text-xl text-ink-charcoal leading-relaxed font-medium text-center px-6">
              {sentence}
            </p>
            <div className="absolute -right-3 -bottom-2 text-5xl text-forest-400/30 font-serif leading-none select-none">"</div>
          </div>
        </div>
      </div>
    </div>
  );
}
