import { motion, MotionProps } from 'framer-motion';
import { PropsWithChildren } from 'react';
import PaperSurface from './PaperSurface';

interface FoldedCornerCardProps extends PropsWithChildren {
  title?: string;
  isNew?: boolean;
  delay?: number;
  className?: string;
}

export default function FoldedCornerCard({
  title,
  children,
  isNew = false,
  delay = 0,
  className = '',
}: FoldedCornerCardProps) {
  const motionProps: MotionProps = {
    initial: {
      rotateX: 8,
      scaleY: 0.98,
      opacity: 0,
      transformOrigin: 'top center',
    },
    animate: {
      rotateX: 0,
      scaleY: 1,
      opacity: 1,
    },
    transition: {
      duration: 0.28,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  };

  return (
    <motion.div {...motionProps} className={`relative ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      <PaperSurface variant={isNew ? 'lifted' : 'default'}>
        {title && (
          <h3 className="text-lg font-semibold text-ink-primary mb-3 font-serif">
            {title}
          </h3>
        )}
        <div className="text-ink-secondary">{children}</div>

        {/* Folded corner indicator */}
        {isNew && (
          <div className="absolute right-0 top-0 h-8 w-8 overflow-hidden rounded-tr-2xl">
            <div className="absolute right-0 top-0 h-8 w-8 -rotate-45 translate-x-3 -translate-y-3 bg-gradient-to-br from-forest-500 to-forest-600" />
          </div>
        )}

        {/* Corner dots for visual interest */}
        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-forest-500/30" />
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gold-500/40" />
      </PaperSurface>
    </motion.div>
  );
}
