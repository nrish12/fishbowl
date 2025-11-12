import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  trigger: boolean;
}

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
}

export default function Confetti({ trigger }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const colors = ['#2D8B5F', '#F59E0B', '#FFF8E7', '#8B7355', '#4A3C2E'];

  useEffect(() => {
    if (trigger) {
      // Generate confetti pieces
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100, // 0-100% of screen width
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: Math.random() * 0.3,
          duration: 2 + Math.random() * 2,
          rotation: Math.random() * 720,
        });
      }
      setPieces(newPieces);

      // Clear after animation
      const timer = setTimeout(() => setPieces([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!trigger || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            backgroundColor: piece.color,
          }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: '110vh',
            rotate: piece.rotation,
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeIn',
          }}
        />
      ))}
    </div>
  );
}
