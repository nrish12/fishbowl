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
        x: [-8, 8, -6, 6, -4, 4, 0],
        rotation: [-0.5, 0.5, -0.3, 0.3, 0],
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
        <div className="relative mb-3" style={{ paddingTop: wrongGuesses.length > 0 ? '36px' : '0' }}>
          {/* Absolutely positioned guess pills overlay - doesn't affect tab sizing */}
          {wrongGuesses.length > 0 && (
            <div className="absolute left-0 right-0 top-0 flex items-center gap-2 z-10">
              <div className="text-xs font-bold text-forest-600 uppercase tracking-wider whitespace-nowrap opacity-0 pointer-events-none" aria-hidden="true">
                Previous:
              </div>
              <div className="flex gap-2 flex-wrap">
                {wrongGuesses.map((wg, idx) => (
                  <div key={idx} className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold border sm:border-2 shadow-sm flex items-center gap-1 whitespace-nowrap ${
                    wg.score && wg.score >= 75 ? 'bg-green-100 border-green-400 text-green-800' :
                    wg.score && wg.score >= 55 ? 'bg-amber-100 border-amber-400 text-amber-800' :
                    'bg-red-100 border-red-400 text-red-800'
                  }`}>
                    <span className="truncate max-w-[120px]">{wg.guess}</span>
                    {wg.score !== null && <span className="opacity-80">{wg.score}%</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase tabs row - natural sizing, not forced to stretch */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-forest-600 uppercase tracking-wider whitespace-nowrap">
              Previous:
            </span>
            <div className="flex gap-2">
              {Array.from({ length: phase - 1 }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => onPhaseClick?.(p)}
                  className="px-3 py-1.5 bg-forest-100 hover:bg-forest-200 text-forest-700 rounded-lg text-xs font-medium transition-all border border-forest-300/30 hover:border-forest-400 hover:shadow-md whitespace-nowrap min-w-[120px] max-w-[200px]"
                >
                  <span className="font-bold">{p}</span>
                  <span className="hidden sm:inline ml-1 text-[10px] opacity-70">· {phaseLabels[p - 1]}</span>
                </button>
              ))}
            </div>
            {mysteryContent && (
              <div className="flex-shrink-0 ml-auto">
                {mysteryContent}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show mystery content when phase === 1 */}
      {phase === 1 && mysteryContent && (
        <div className="mb-3 flex justify-end">
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

      {/* Clickable phase indicators */}
      <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 sm:gap-3 z-20">
        {[1, 2, 3, 4, 5].map((p) => {
          const isCompleted = p < phase;
          const isCurrent = p === phase;
          const isClickable = p < phase;

          return (
            <button
              key={p}
              onClick={() => isClickable && onPhaseClick?.(p)}
              disabled={!isClickable}
              className={`relative group transition-all duration-300 ${
                isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-default'
              }`}
              title={isClickable ? `View Phase ${p}: ${phaseLabels[p - 1]}` : undefined}
            >
              <div
                className={`w-2 h-8 sm:w-3 sm:h-12 rounded-full transition-all duration-500 ${
                  isCurrent
                    ? 'bg-gradient-to-b from-gold-400 to-gold-600 shadow-lg ring-2 ring-gold-300/50'
                    : isCompleted
                    ? 'bg-gradient-to-b from-forest-500 to-forest-700 shadow-md hover:shadow-lg'
                    : 'bg-stone-300 opacity-30'
                }`}
                style={{
                  transform: p <= phase ? 'scaleY(1)' : 'scaleY(0.5)',
                }}
              />

              {isClickable && (
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  <div className="bg-forest-700 text-white text-xs px-2 py-1 rounded shadow-lg">
                    {phaseLabels[p - 1]}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Desk surface ambiance */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-100 via-stone-100 to-amber-50 opacity-30 blur-3xl pointer-events-none" />
    </div>
  );
}
