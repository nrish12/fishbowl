import { motion, MotionProps } from 'framer-motion';
import { PropsWithChildren } from 'react';
import PaperSurface from './PaperSurface';

interface EnvelopePanelProps extends PropsWithChildren {
  title?: string;
  delay?: number;
}

export default function EnvelopePanel({
  children,
  title,
  delay = 0,
}: EnvelopePanelProps) {
  const containerProps: MotionProps = {
    initial: { y: 24, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: {
      duration: 0.35,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  };

  const flapProps: MotionProps = {
    initial: { rotateX: 15, transformOrigin: 'top center' },
    animate: { rotateX: 0 },
    transition: {
      duration: 0.35,
      delay: delay + 0.1,
      ease: [0.34, 1.26, 0.64, 1],
    },
  };

  return (
    <motion.div {...containerProps} className="relative">
      {/* Envelope flap */}
      <motion.div
        {...flapProps}
        className="absolute -top-6 left-1/2 h-8 w-48 -translate-x-1/2 rounded-t-xl bg-paper-cream border-2 border-b-0 border-forest-300/20"
        style={{
          transformStyle: 'preserve-3d',
          boxShadow: '0 -2px 8px rgba(45, 139, 95, 0.08)',
        }}
      >
        <div className="absolute left-1/2 top-2 w-16 h-0.5 bg-forest-500/20 -translate-x-1/2 rounded-full" />
      </motion.div>

      <PaperSurface className="relative pt-8">
        {title && (
          <h2 className="text-2xl font-serif font-bold text-forest-800 mb-4 text-center">
            {title}
          </h2>
        )}
        {children}
      </PaperSurface>
    </motion.div>
  );
}
