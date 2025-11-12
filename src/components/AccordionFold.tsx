import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

interface AccordionFoldProps {
  phase: number;
  children: ReactNode[];
  wrongGuessShake?: boolean;
}

export default function AccordionFold({ phase, children, wrongGuessShake }: AccordionFoldProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Desk surface */}
      <div className="absolute inset-0 -m-20 -z-20 bg-gradient-to-br from-amber-100 via-amber-50 to-stone-100 opacity-60" />

      {/* Paper shadow */}
      <motion.div
        className="absolute inset-0 -z-10 bg-black/5 blur-2xl rounded-3xl"
        animate={{
          scale: 1 + (phase * 0.02),
          y: 8 + (phase * 2),
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />

      {/* Main accordion container */}
      <motion.div
        className="relative bg-paper-cream rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] paper-texture overflow-hidden"
        animate={wrongGuessShake && !prefersReducedMotion ? {
          x: [0, -8, 8, -6, 6, -4, 4, 0],
          rotate: [0, -0.5, 0.5, -0.3, 0.3, 0],
        } : {}}
        transition={{ duration: 0.5 }}
      >
        {/* Accordion panels */}
        {children.map((child, index) => {
          const isUnfolded = index < phase;
          const panelPhase = index + 1;

          return (
            <motion.div
              key={index}
              initial={{ height: 0, opacity: 0 }}
              animate={{
                height: isUnfolded ? 'auto' : 0,
                opacity: isUnfolded ? 1 : 0,
                rotateX: isUnfolded ? 0 : -15,
              }}
              transition={{
                duration: prefersReducedMotion ? 0.3 : 0.8,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: prefersReducedMotion ? 0 : index * 0.1,
              }}
              style={{
                transformOrigin: 'top',
                transformStyle: 'preserve-3d',
              }}
              className="relative"
            >
              {/* Fold crease line */}
              {index > 0 && (
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-forest-300/30 to-transparent" />
              )}

              {/* Panel content */}
              <div className="p-8">
                {child}
              </div>

              {/* Bottom crease indicator */}
              {index < children.length - 1 && isUnfolded && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full bg-forest-200/40" />
              )}
            </motion.div>
          );
        })}

        {/* Phase indicators on right edge */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((p) => (
            <motion.div
              key={p}
              initial={{ scaleY: 0 }}
              animate={{
                scaleY: p <= phase ? 1 : 0.3,
                opacity: p <= phase ? 0.8 : 0.3,
                backgroundColor: p <= phase ? '#2d8b5f' : '#cbd5e1',
              }}
              transition={{ duration: 0.4, delay: p * 0.05 }}
              className="w-1 h-6 rounded-full"
              style={{ originY: 0 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
