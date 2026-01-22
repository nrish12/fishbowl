import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface FoldedLetterProps {
  phase: number;
  children: React.ReactNode[];
  wrongGuessShake?: boolean;
  onPhaseClick?: (phase: number) => void;
  mysteryContent?: React.ReactNode;
  wrongGuesses?: Array<{ guess: string; score: number | null; phaseGuessed: number }>;
}

export default function FoldedLetter({ phase, children, wrongGuessShake, onPhaseClick, mysteryContent, wrongGuesses = [] }: FoldedLetterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentPanelRef = useRef<HTMLDivElement>(null);
  const prevPhaseRef = useRef(phase);

  const phaseLabels = ['Choose Category', 'The Essence', 'Key Words', 'AI Nudge', 'Final Clue'];

  useEffect(() => {
    if (wrongGuessShake && currentPanelRef.current) {
      gsap.to(currentPanelRef.current, {
        keyframes: [
          { x: -8, rotation: -0.5 },
          { x: 8, rotation: 0.5 },
          { x: -6, rotation: -0.3 },
          { x: 6, rotation: 0.3 },
          { x: -4, rotation: 0 },
          { x: 4, rotation: 0 },
          { x: 0, rotation: 0 },
        ],
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, [wrongGuessShake]);

  useEffect(() => {
    if (phase > prevPhaseRef.current && currentPanelRef.current) {
      gsap.fromTo(
        currentPanelRef.current,
        {
          rotateX: 90,
          opacity: 0,
          y: 100,
          transformOrigin: 'bottom center',
        },
        {
          rotateX: 0,
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );
    }

    prevPhaseRef.current = phase;
  }, [phase]);

  const currentChild = children[phase - 1];
  if (!currentChild) {
    return null;
  }

  return (
    <div ref={containerRef} className="relative w-full" style={{ perspective: '1500px' }}>
      {/* Previous clues breadcrumb */}
      {phase > 1 && (
        <div className="mb-3">
          {/* Mystery badge - centered and prominent */}
          {mysteryContent && (
            <div className="mb-4 flex justify-center">
              {mysteryContent}
            </div>
          )}

          {/* Wrong guesses - centered below mystery badge */}
          {wrongGuesses.length > 0 && (
            <div className="mb-4 flex flex-col items-center gap-2">
              <span className="text-[10px] sm:text-xs font-semibold text-ink-400 uppercase tracking-wider">
                Your Guesses
              </span>
              <div className="flex gap-2 flex-wrap justify-center max-w-lg">
                {wrongGuesses.map((wg, idx) => (
                  <div key={idx} className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold border-2 shadow-md flex items-center gap-2 ${
                    wg.score && wg.score >= 75 ? 'bg-green-50 border-green-400 text-green-800' :
                    wg.score && wg.score >= 50 ? 'bg-amber-50 border-amber-400 text-amber-800' :
                    wg.score && wg.score >= 25 ? 'bg-orange-50 border-orange-400 text-orange-800' :
                    'bg-red-50 border-red-400 text-red-800'
                  }`}>
                    <span className="truncate max-w-[140px]">{wg.guess}</span>
                    {wg.score !== null && (
                      <span className={`text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded ${
                        wg.score >= 75 ? 'bg-green-200 text-green-900' :
                        wg.score >= 50 ? 'bg-amber-200 text-amber-900' :
                        wg.score >= 25 ? 'bg-orange-200 text-orange-900' :
                        'bg-red-200 text-red-900'
                      }`}>
                        {wg.score}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase tabs row */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-bold text-forest-600 uppercase tracking-wider whitespace-nowrap">
              Previous:
            </span>
            <div className="flex gap-2 flex-wrap justify-center">
              {Array.from({ length: phase - 1 }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => onPhaseClick?.(p)}
                  className="px-3 py-1.5 bg-forest-100 hover:bg-forest-200 text-forest-700 rounded-lg text-xs font-medium transition-all border border-forest-300/30 hover:border-forest-400 hover:shadow-md whitespace-nowrap"
                >
                  <span className="font-bold">{p}</span>
                  <span className="hidden sm:inline ml-1 text-[10px] opacity-70">· {phaseLabels[p - 1]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Show mystery content when phase === 1 */}
      {phase === 1 && mysteryContent && (
        <div className="mb-4 flex justify-center">
          {mysteryContent}
        </div>
      )}

      {/* Current clue panel */}
      <div className="relative z-10 flex items-start justify-center">
        <div
          ref={currentPanelRef}
          className="w-full bg-paper-cream rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.2)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.2)] p-3 sm:p-6 border-2 sm:border-4 border-amber-200/50 paper-texture relative"
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            willChange: 'transform',
          }}
        >
          {/* Decorative lines */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-forest-300/20 to-transparent" />
          <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-forest-300/20 to-transparent" />

          {/* Phase badge */}
          <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 bg-forest-700 text-gold-100 px-3 py-1 sm:px-6 sm:py-2 rounded-full shadow-lg border-2 border-gold-300/40">
            <span className="text-[10px] sm:text-sm font-bold uppercase tracking-wider">
              <span className="hidden sm:inline">Phase {phase}: {phaseLabels[phase - 1]}</span>
              <span className="sm:hidden">P{phase}: {phaseLabels[phase - 1]}</span>
            </span>
          </div>

          {/* Current content */}
          <div className="relative z-10 mt-6 sm:mt-8">{currentChild}</div>

          {/* Paper texture overlay */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-amber-100/20 pointer-events-none" />

          {/* Corner decoration */}
          <div
            className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-amber-200 to-amber-300 opacity-60"
            style={{
              clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
            }}
          />
        </div>
      </div>


      {/* Desk surface ambiance */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-100 via-stone-100 to-amber-50 opacity-30 blur-3xl pointer-events-none" />
    </div>
  );
}
