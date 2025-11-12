import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ConfettiProps {
  trigger: boolean;
}

export default function Confetti({ trigger }: ConfettiProps) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; color: string; delay: number; rotation: number }>>([]);

  useEffect(() => {
    if (trigger) {
      const newPieces = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: ['#2D8B5F', '#F59E0B', '#FCD34D', '#4AA67E', '#FBBF24'][Math.floor(Math.random() * 5)],
        delay: Math.random() * 0.2,
        rotation: Math.random() * 360,
      }));
      setPieces(newPieces);

      const timer = setTimeout(() => setPieces([]), 3000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.x}vw`,
            y: '-10vh',
            rotate: piece.rotation,
            opacity: 1,
          }}
          animate={{
            y: '110vh',
            rotate: piece.rotation + 360,
            opacity: 0,
          }}
          transition={{
            duration: 2 + Math.random(),
            delay: piece.delay,
            ease: 'easeIn',
          }}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            backgroundColor: piece.color,
            boxShadow: `0 0 4px ${piece.color}`,
          }}
        />
      ))}
    </div>
  );
}
