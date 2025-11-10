import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    >
      <AnimatePresence mode="popLayout">
        {Array.from({ length: maxLives }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Heart
              size={18}
              className={`${
                i < lives
                  ? 'fill-forest-600 text-forest-600'
                  : 'text-ink-200 fill-ink-100'
              } transition-all duration-300`}
              strokeWidth={2.5}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
