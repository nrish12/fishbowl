import { motion } from 'framer-motion';

interface LivesProps {
  lives: number;
  maxLives?: number;
}

export default function Lives({ lives, maxLives = 5 }: LivesProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-2 bg-paper-cream px-4 py-2 rounded-full shadow-[var(--shadow-paper)] border-2 border-forest-300/20"
      role="status"
      aria-label={`${lives} of ${maxLives} guesses remaining`}
    >
      <span className="text-xs font-bold text-forest-600 uppercase tracking-wider" aria-hidden="true">Guesses</span>
      <div
        className="flex items-center gap-1"
        role="progressbar"
        aria-valuenow={lives}
        aria-valuemin={0}
        aria-valuemax={maxLives}
        aria-label="Guesses remaining"
      >
        {Array.from({ length: maxLives }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 1 }}
            animate={{
              scale: i < lives ? 1 : 0.8,
              opacity: i < lives ? 1 : 0.3
            }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`w-2.5 h-2.5 rounded-full ${
              i < lives
                ? 'bg-forest-600'
                : 'bg-ink-200'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="text-sm font-bold text-forest-800 tabular-nums" aria-hidden="true">{lives}/{maxLives}</span>
    </motion.div>
  );
}
