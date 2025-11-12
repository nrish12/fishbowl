import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface FoldedLetterProps {
  phase: number;
  children: React.ReactNode[];
  wrongGuessShake?: boolean;
}

export default function FoldedLetter({ phase, children, wrongGuessShake }: FoldedLetterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const currentPanelRef = useRef<HTMLDivElement>(null);
  const previousPanelsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const prevPhaseRef = useRef(phase);

  // Animate wrong guess shake
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

  // Animate phase transitions
  useEffect(() => {
    if (phase > prevPhaseRef.current && currentPanelRef.current) {
      // Unfold the new panel from bottom to top
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

      // Move previous panel to the side
      const prevPanelIndex = prevPhaseRef.current - 1;
      const prevPanel = previousPanelsRefs.current[prevPanelIndex];
      if (prevPanel) {
        gsap.to(prevPanel, {
          x: -20,
          y: prevPanelIndex * -8,
          scale: 0.9 - prevPanelIndex * 0.05,
          opacity: 0.7,
          rotation: -2 - prevPanelIndex * 0.5,
          duration: 0.8,
          ease: 'power2.inOut',
        });
      }
    }

    prevPhaseRef.current = phase;
  }, [phase]);

  // Drawer animation
  useEffect(() => {
    const drawer = containerRef.current?.querySelector('.hint-drawer') as HTMLElement;
    if (drawer) {
      gsap.to(drawer, {
        x: drawerOpen ? 0 : -400,
        duration: 0.6,
        ease: 'power3.inOut',
      });
    }
  }, [drawerOpen]);

  const phaseLabels = ['Choose Category', 'The Essence', 'Key Words', 'AI Nudge', 'Final Clue'];

  return (
    <div ref={containerRef} className="relative w-full min-h-[600px]" style={{ perspective: '1500px' }}>
      {/* Drawer for reviewing previous hints */}
      <div
        className="hint-drawer fixed left-0 top-0 bottom-0 w-[400px] bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100 shadow-2xl z-50 overflow-y-auto"
        style={{ transform: 'translateX(-400px)' }}
      >
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-serif font-bold text-forest-700">Story So Far</h3>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-2 hover:bg-forest-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-forest-600" />
            </button>
          </div>

          {children.slice(0, phase).map((child, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 shadow-md border-2 border-forest-200/50"
            >
              <div className="text-xs font-bold text-forest-500 uppercase tracking-wider mb-2">
                Phase {idx + 1}: {phaseLabels[idx]}
              </div>
              <div className="text-sm">{child}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Drawer toggle button */}
      {phase > 1 && (
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-br from-forest-600 to-forest-700 text-white px-4 py-6 rounded-r-2xl shadow-2xl hover:from-forest-500 hover:to-forest-600 transition-all group"
          style={{ transform: drawerOpen ? 'translateX(400px) translateY(-50%)' : 'translateY(-50%)' }}
        >
          <div className="flex items-center gap-2">
            {drawerOpen ? (
              <ChevronLeft size={20} />
            ) : (
              <>
                <ChevronRight size={20} />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-bold uppercase tracking-wider">Review</span>
                  <span className="text-xs opacity-90">{phase} hints</span>
                </div>
              </>
            )}
          </div>
        </button>
      )}

      {/* Previous panels stacked on left */}
      <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
        {children.slice(0, phase - 1).map((child, idx) => (
          <div
            key={idx}
            ref={(el) => (previousPanelsRefs.current[idx] = el)}
            className="absolute left-20 top-20 w-[600px] bg-paper-cream rounded-2xl shadow-2xl p-8 border-4 border-amber-200/50"
            style={{
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              willChange: 'transform',
            }}
          >
            <div className="opacity-50 pointer-events-none">{child}</div>
            <div className="absolute top-4 right-4 bg-forest-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Phase {idx + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Current unfolding panel (center) */}
      <div className="relative z-10 flex items-center justify-center min-h-[600px]">
        <div
          ref={currentPanelRef}
          className="w-full max-w-3xl bg-paper-cream rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.25)] p-12 border-4 border-amber-200/50 paper-texture relative"
          style={{
            transformStyle: 'preserve-3d',
            backfaceVisibility: 'hidden',
            willChange: 'transform',
          }}
        >
          {/* Fold crease marks */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-forest-300/20 to-transparent" />
          <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-forest-300/20 to-transparent" />

          {/* Phase badge */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-br from-forest-600 to-forest-700 text-gold-200 px-6 py-2 rounded-full shadow-lg border-2 border-gold-300/30">
            <span className="text-sm font-bold uppercase tracking-wider">
              Phase {phase}: {phaseLabels[phase - 1]}
            </span>
          </div>

          {/* Current content */}
          <div className="relative z-10">{children[phase - 1]}</div>

          {/* Paper texture overlay */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-amber-100/20 pointer-events-none" />

          {/* Corner fold effect */}
          <div
            className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-300 opacity-60"
            style={{
              clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
              transform: 'rotateZ(0deg)',
            }}
          />
        </div>
      </div>

      {/* Phase indicators */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
        {[1, 2, 3, 4, 5].map((p) => (
          <div
            key={p}
            className={`w-3 h-12 rounded-full transition-all duration-500 ${
              p <= phase
                ? 'bg-gradient-to-b from-forest-500 to-forest-700 shadow-lg'
                : 'bg-stone-300 opacity-40'
            }`}
            style={{
              transform: p <= phase ? 'scaleY(1)' : 'scaleY(0.5)',
            }}
          />
        ))}
      </div>

      {/* Desk surface ambiance */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-amber-100 via-stone-100 to-amber-50 opacity-40 blur-3xl" />
    </div>
  );
}
