import { motion, useReducedMotion } from 'framer-motion';
import { PropsWithChildren, useEffect, useState } from 'react';

interface FiveFoldNoteProps extends PropsWithChildren {
  phase: number;
  wrongGuessShake?: boolean;
  gameState?: 'playing' | 'solved' | 'failed';
}

export default function FiveFoldNote({
  phase,
  wrongGuessShake = false,
  gameState = 'playing',
  children
}: FiveFoldNoteProps) {
  const prefersReducedMotion = useReducedMotion();
  const [shaking, setShaking] = useState(false);

  useEffect(() => {
    if (wrongGuessShake) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 400);
      return () => clearTimeout(timer);
    }
  }, [wrongGuessShake]);

  // Animation variants for the main container
  const containerVariants = {
    initial: {
      opacity: 0,
      scale: 0.95,
      rotateX: prefersReducedMotion ? 0 : -5,
    },
    animate: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: prefersReducedMotion ? 0.3 : 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      }
    },
    shake: prefersReducedMotion ? {} : {
      x: [0, -10, 10, -8, 8, -4, 4, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    },
    solved: {
      scale: prefersReducedMotion ? 1 : 1.02,
      rotateZ: prefersReducedMotion ? 0 : [0, -1, 1, 0],
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    failed: {
      scale: prefersReducedMotion ? 1 : 0.98,
      opacity: 0.95,
      transition: {
        duration: 0.4,
      }
    }
  };

  // Determine which animation state
  const getAnimationState = () => {
    if (shaking) return 'shake';
    if (gameState === 'solved') return 'solved';
    if (gameState === 'failed') return 'failed';
    return 'animate';
  };

  return (
    <div className="relative perspective-1200">
      {/* Desk surface subtle hints */}
      <div className="absolute inset-0 -m-8 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-32 bg-forest-300 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-gold-300 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate={getAnimationState()}
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Main paper note container */}
        <div className="relative bg-paper-cream rounded-3xl p-8 md:p-10 paper-texture border-4 border-forest-300/30 shadow-[0_8px_32px_rgba(45,139,95,0.12),0_16px_64px_rgba(45,139,95,0.08),inset_0_2px_4px_rgba(255,248,231,0.8)]">

          {/* Corner fold indicators (subtle origami corners) */}
          <div className="absolute top-0 left-0 w-12 h-12 overflow-hidden rounded-tl-3xl pointer-events-none">
            <div className="absolute top-0 left-0 w-6 h-6 bg-gradient-to-br from-forest-400/10 to-transparent" />
          </div>
          <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden rounded-tr-3xl pointer-events-none">
            <div className="absolute top-0 right-0 w-6 h-6 bg-gradient-to-bl from-gold-400/10 to-transparent" />
          </div>

          {/* Fold crease indicators - appear as phases unlock */}
          <div className="space-y-0 relative z-10">
            {children}
          </div>

          {/* Phase progress indicators as subtle fold marks on the side */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-3 opacity-40">
            {[1, 2, 3, 4, 5].map((p) => (
              <motion.div
                key={p}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{
                  scaleY: p <= phase ? 1 : 0.3,
                  opacity: p <= phase ? 0.6 : 0.2
                }}
                transition={{ delay: p * 0.1, duration: 0.3 }}
                className={`w-1 h-8 rounded-full ${
                  p <= phase
                    ? 'bg-gradient-to-b from-forest-500 to-gold-500'
                    : 'bg-ink-200'
                }`}
                style={{ originY: 0 }}
              />
            ))}
          </div>

          {/* Subtle paper grain overlay */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none opacity-30 -z-10"
            style={{
              backgroundImage: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 1px,
                  rgba(45, 139, 95, 0.015) 1px,
                  rgba(45, 139, 95, 0.015) 2px
                ),
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 1px,
                  rgba(45, 139, 95, 0.015) 1px,
                  rgba(45, 139, 95, 0.015) 2px
                )
              `
            }}
          />
        </div>

        {/* Shadow that lifts slightly on phase advance */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-3xl bg-forest-900/5 blur-xl"
          animate={{
            scale: phase > 1 ? 1.02 : 1,
            y: phase > 1 ? 4 : 8,
          }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
    </div>
  );
}
