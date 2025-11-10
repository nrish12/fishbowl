import { motion, AnimatePresence } from 'framer-motion';
import FoldedCornerCard from './paper/FoldedCornerCard';
import StickyNote from './paper/StickyNote';

interface HintStackProps {
  phase: number;
  selectedCategory?: string | null;
  categoryHint?: string;
  sentenceHint?: string;
  phase3Hints?: Record<string, string>;
  phase4Nudge?: string | null;
  phase4Keywords?: string[];
}

export default function HintStack({
  phase,
  selectedCategory,
  categoryHint,
  sentenceHint,
  phase3Hints,
  phase4Nudge,
  phase4Keywords = [],
}: HintStackProps) {
  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {phase >= 1 && selectedCategory && categoryHint && (
          <motion.div
            key="phase1"
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <FoldedCornerCard title="Phase 1: Category" isNew={phase === 1} delay={0}>
              <div className="space-y-2">
                <StickyNote color="green" size="sm">
                  {selectedCategory}
                </StickyNote>
                <p className="text-base text-ink-secondary leading-relaxed mt-3">
                  {categoryHint}
                </p>
              </div>
            </FoldedCornerCard>
          </motion.div>
        )}

        {phase >= 2 && sentenceHint && (
          <motion.div
            key="phase2"
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <FoldedCornerCard title="Phase 2: The Revealing Sentence" isNew={phase === 2} delay={0.15}>
              <p className="text-lg font-medium text-forest-800 leading-relaxed italic">
                "{sentenceHint}"
              </p>
            </FoldedCornerCard>
          </motion.div>
        )}

        {phase >= 3 && phase3Hints && Object.keys(phase3Hints).length > 0 && (
          <motion.div
            key="phase3"
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <FoldedCornerCard title="Phase 3: Five Words" isNew={phase === 3} delay={0.3}>
              <div className="flex flex-wrap gap-2">
                {Object.entries(phase3Hints).map(([category, hint], idx) => (
                  <motion.div
                    key={category}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1, type: 'spring' }}
                  >
                    <StickyNote color={idx % 2 === 0 ? 'yellow' : 'green'} size="md">
                      <div className="text-xs text-forest-600 uppercase font-bold mb-1 tracking-wider">
                        {category}
                      </div>
                      <div className="text-base font-semibold text-ink-primary">
                        {hint}
                      </div>
                    </StickyNote>
                  </motion.div>
                ))}
              </div>
            </FoldedCornerCard>
          </motion.div>
        )}

        {phase >= 4 && phase4Nudge && (
          <motion.div
            key="phase4"
            layout
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <FoldedCornerCard title="Phase 4: AI Reflection" isNew={phase === 4} delay={0.45}>
              <div className="space-y-3">
                <p className="text-base text-ink-secondary leading-relaxed">
                  {phase4Nudge}
                </p>
                {phase4Keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-forest-300/30">
                    {phase4Keywords.map((keyword, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 + idx * 0.05 }}
                      >
                        <span className="inline-block px-3 py-1 bg-gold-100 text-gold-800 text-xs font-semibold rounded-full border border-gold-300/40">
                          {keyword}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </FoldedCornerCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
