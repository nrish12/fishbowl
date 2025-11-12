import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface FiveFoldNoteProps {
  phase: 1 | 2 | 3 | 4 | 5;
  children: React.ReactNode[];
  wrongGuessShake?: boolean;
  gameState?: 'playing' | 'solved' | 'failed';
}

export default function FiveFoldNote({
  phase,
  children,
  wrongGuessShake = false,
  gameState = 'playing'
}: FiveFoldNoteProps) {
  const shouldReduceMotion = useReducedMotion();
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Focus management: move focus to newly opened panel
  useEffect(() => {
    if (phase > 1 && panelRefs.current[phase - 1]) {
      const panel = panelRefs.current[phase - 1];
      const firstFocusable = panel?.querySelector('button, input, [tabindex="0"]') as HTMLElement;
      firstFocusable?.focus();
    }
  }, [phase]);

  // Animation variants
  const containerVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      transition: { duration: 0.4, ease: 'easeInOut' }
    },
    confetti: {
      scale: [1, 1.02, 1],
      rotate: [0, 1, -1, 0],
      transition: { duration: 0.8, ease: 'easeOut' }
    },
    crumple: {
      scale: [1, 0.98, 0.98],
      rotateZ: [0, -1, 1, -0.5],
      transition: { duration: 0.6, ease: 'easeInOut' }
    }
  };

  const panelVariants = {
    folded: (custom: number) => ({
      rotateY: shouldReduceMotion ? 0 : -90,
      opacity: shouldReduceMotion ? 0 : 0.3,
      scale: shouldReduceMotion ? 0.95 : 0.98,
      originX: custom % 2 === 0 ? 0 : 1, // Alternate hinge sides
    }),
    unfolding: (custom: number) => ({
      rotateY: shouldReduceMotion ? 0 : [-90, -45, 5, 0],
      opacity: [0.3, 0.6, 0.9, 1],
      scale: [0.98, 0.99, 1.01, 1],
      originX: custom % 2 === 0 ? 0 : 1,
    }),
    unfolded: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
    }
  };

  const getAnimationState = () => {
    if (wrongGuessShake) return 'shake';
    if (gameState === 'solved') return 'confetti';
    if (gameState === 'failed') return 'crumple';
    return 'normal';
  };

  // Spring configuration for natural paper feel
  const springConfig = {
    type: 'spring',
    stiffness: 100,
    damping: 18,
    mass: 0.8,
  };

  return (
    <motion.div
      className="relative w-full"
      variants={containerVariants}
      animate={getAnimationState()}
      style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
    >
      {/* Desktop: Horizontal unfold */}
      <div className="hidden md:grid md:grid-cols-5 gap-4 relative">
        {children.slice(0, 5).map((child, index) => {
          const panelPhase = index + 1;
          const isUnfolded = phase >= panelPhase;

          return (
            <motion.div
              key={`panel-${panelPhase}`}
              ref={(el) => (panelRefs.current[index] = el)}
              custom={index}
              initial="folded"
              animate={isUnfolded ? 'unfolded' : 'folded'}
              variants={panelVariants}
              transition={
                isUnfolded
                  ? { ...springConfig, delay: index * 0.15 }
                  : shouldReduceMotion
                    ? { duration: 0.3 }
                    : springConfig
              }
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
              className={`
                relative min-h-[400px]
                ${isUnfolded ? 'pointer-events-auto' : 'pointer-events-none'}
              `}
              aria-hidden={!isUnfolded}
              role="region"
              aria-label={`Phase ${panelPhase} ${isUnfolded ? 'revealed' : 'locked'}`}
            >
              {/* Crease indicator on left edge (except first panel) */}
              {index > 0 && (
                <div
                  className={`
                    absolute left-0 top-0 bottom-0 w-0.5 fold-crease
                    transition-opacity duration-500
                    ${phase >= panelPhase ? 'opacity-100' : 'opacity-30'}
                  `}
                  aria-hidden="true"
                />
              )}

              {/* Panel content */}
              <div className={`
                h-full w-full rounded-2xl bg-paper-cream paper-texture paper-shadow
                border border-forest-300/20
                ${!isUnfolded && 'blur-sm'}
              `}>
                {child}
              </div>

              {/* Phase indicator badge */}
              <div className={`
                absolute -top-3 left-1/2 -translate-x-1/2 z-20
                px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                transition-all duration-300
                ${isUnfolded
                  ? 'bg-forest-600 text-gold-100 shadow-lg'
                  : 'bg-ink-200 text-ink-400 opacity-50'}
              `}>
                {panelPhase}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile: Vertical stack */}
      <div className="md:hidden space-y-6">
        <AnimatePresence mode="sync">
          {children.slice(0, 5).map((child, index) => {
            const panelPhase = index + 1;
            const isUnfolded = phase >= panelPhase;

            if (!isUnfolded) return null;

            return (
              <motion.div
                key={`panel-mobile-${panelPhase}`}
                ref={(el) => (panelRefs.current[index] = el)}
                initial={shouldReduceMotion ? { opacity: 0, y: 20 } : {
                  opacity: 0,
                  rotateX: -70,
                  y: -30,
                  scale: 0.95
                }}
                animate={{
                  opacity: 1,
                  rotateX: 0,
                  y: 0,
                  scale: 1
                }}
                exit={shouldReduceMotion ? { opacity: 0 } : {
                  opacity: 0,
                  rotateX: 90,
                  scale: 0.95
                }}
                transition={{
                  ...springConfig,
                  delay: index * 0.1,
                }}
                style={{
                  transformStyle: 'preserve-3d',
                  transformOrigin: 'top center',
                }}
                className="relative"
                role="region"
                aria-label={`Phase ${panelPhase} revealed`}
              >
                {/* Crease indicator on top edge (except first panel) */}
                {index > 0 && (
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5 fold-crease mb-2"
                    aria-hidden="true"
                  />
                )}

                {/* Panel content */}
                <div className="rounded-2xl bg-paper-cream paper-texture paper-shadow border border-forest-300/20 p-6">
                  <div className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-bold uppercase tracking-wider bg-forest-600 text-gold-100">
                    Phase {panelPhase}
                  </div>
                  {child}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
