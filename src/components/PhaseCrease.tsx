import { motion, useReducedMotion } from 'framer-motion';

interface PhaseCreaseProps {
  visible: boolean;
  delay?: number;
}

export default function PhaseCrease({ visible, delay = 0 }: PhaseCreaseProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!visible) return null;

  return (
    <motion.div
      initial={{
        opacity: 0,
        scaleX: 0,
        height: 0,
      }}
      animate={{
        opacity: 1,
        scaleX: 1,
        height: 'auto',
      }}
      transition={{
        duration: prefersReducedMotion ? 0.2 : 0.6,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="relative my-8 flex items-center justify-center"
    >
      {/* Main crease line */}
      <div className="relative w-full h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-forest-300/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold-300/20 to-transparent blur-sm" />
      </div>

      {/* Center fold indicator */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          delay: delay + 0.3,
          duration: prefersReducedMotion ? 0.2 : 0.4,
          type: 'spring',
          stiffness: 200,
        }}
        className="absolute"
      >
        <div className="relative">
          {/* Subtle paper fold mark */}
          <div className="w-3 h-3 bg-gradient-to-br from-forest-400/30 to-gold-400/20 rounded-full border border-forest-300/30" />
          <div className="absolute inset-0 w-3 h-3 bg-gradient-to-br from-gold-300/20 to-transparent rounded-full blur-sm" />
        </div>
      </motion.div>

      {/* Left and right decorative marks */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.3 }}
        className="absolute left-8 w-8 h-px bg-gradient-to-r from-forest-400/30 to-transparent"
      />
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.3 }}
        className="absolute right-8 w-8 h-px bg-gradient-to-l from-forest-400/30 to-transparent"
      />
    </motion.div>
  );
}
