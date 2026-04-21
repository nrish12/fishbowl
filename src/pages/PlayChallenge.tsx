import { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Flag } from 'lucide-react';
import Logo from '../components/Logo';
import PhaseChips from '../components/PhaseChips';
import SentenceCard from '../components/SentenceCard';
import CategoryPicker from '../components/CategoryPicker';
import GuessBar from '../components/GuessBar';
import ShareCard from '../components/ShareCard';
import { Leaderboard } from '../components/Leaderboard';
import Phase4Nudge from '../components/Phase4Nudge';
import Phase5Visual from '../components/Phase5Visual';
import FoldedLetter from '../components/FoldedLetter';
import Confetti from '../components/Confetti';
import { ChallengeTimer } from '../components/ChallengeTimer';
import { useChallengeGame } from '../hooks/useChallengeGame';

export default function PlayChallenge() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');

  const {
    gameState, hints, challengeType, phase, guesses, answer, rank, selectedCategory, error, challengeId,
    isThinking, suggestedCorrection, pendingGuess, lastGuessResult,
    phase4Nudge, phase4Keywords, phase5Data, shouldShake, guessError, viewingPhase, expiresAt, isExpired,
    dailyCategory, mappedWrongGuesses, allowedFirstClueCategories,
    handleGuess, handleSelectCategory, handleExpired, handlePhaseClick, handleCloseModal,
    showNextPhase, showPrevPhase, acceptSuggestion, rejectSuggestion, giveUp,
  } = useChallengeGame(token);

  const phaseContent = useMemo(() => {
    if (!hints) return [];
    return [
      <div key="phase1">
        {selectedCategory ? (
          <CategoryPicker
            categories={hints.phase3}
            revealed={true}
            selectedCategory={selectedCategory}
            allowedCategories={allowedFirstClueCategories}
          />
        ) : (
          <CategoryPicker
            categories={hints.phase3}
            revealed={false}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            allowedCategories={allowedFirstClueCategories}
          />
        )}
      </div>,
      <div key="phase2">
        <SentenceCard sentence={hints.phase2} revealed={true} onReveal={undefined} />
      </div>,
      <div key="phase3">
        <PhaseChips words={hints.phase1} revealed={true} />
      </div>,
      <div key="phase4">
        {phase4Nudge ? (
          <Phase4Nudge nudge={phase4Nudge} keywords={phase4Keywords} />
        ) : (
          <div className="text-center space-y-4">
            <div className="text-5xl animate-pulse">!</div>
            <h3 className="text-2xl font-serif font-bold text-ink-500">Phase 4: AI Reflection</h3>
            <p className="text-ink-400">Loading personalized nudge...</p>
          </div>
        )}
      </div>,
      <div key="phase5">
        {phase5Data ? (
          <Phase5Visual data={phase5Data} />
        ) : (
          <div className="text-center space-y-4">
            <div className="text-5xl animate-pulse">?</div>
            <h3 className="text-2xl font-serif font-bold text-ink-500">Phase 5: Final Chance</h3>
            <p className="text-ink-400">Loading complete visual breakdown...</p>
          </div>
        )}
      </div>,
    ];
  }, [hints, selectedCategory, handleSelectCategory, phase4Nudge, phase4Keywords, phase5Data, allowedFirstClueCategories]);

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Logo loading={true} />
          <p className="text-forest/70">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border-2 border-red-200 text-center space-y-4">
          <div className="text-5xl">X</div>
          <h2 className="text-2xl font-serif font-bold text-forest">Challenge Error</h2>
          <p className="text-forest/70">{error}</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-forest text-white rounded-full font-medium hover:bg-gold hover:text-forest transition-colors"
          >
            Back Home
          </Link>
        </div>
      </div>
    );
  }

  if (isExpired && gameState === 'playing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-lg border-2 border-orange-200 text-center space-y-4">
          <div className="text-5xl">!</div>
          <h2 className="text-2xl font-serif font-bold text-forest">Challenge Expired</h2>
          <p className="text-forest/70">
            This challenge's 24-hour time limit has expired. Create a new challenge to share with friends!
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-forest text-white rounded-full font-medium hover:bg-gold hover:text-forest transition-colors"
          >
            Create New Challenge
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen desk-surface relative overflow-x-hidden">
      <Confetti trigger={gameState === 'solved'} />

      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-forest-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gold-200 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="w-full max-w-6xl px-3 sm:px-6 lg:px-8 py-2 sm:py-4 mx-auto space-y-2 sm:space-y-2.5 relative z-10">
        <div className="flex items-start justify-start mb-1 sm:mb-2">
          <Link to="/" className="flex items-center gap-1 text-ink-300 hover:text-ink-500 transition-colors">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-semibold">Back</span>
          </Link>
        </div>

        {gameState === 'playing' && hints && (
          <>
            <div className="flex justify-center mb-2 sm:mb-3">
              <div className="hidden sm:block">
                <Logo size="lg" showTagline={false} />
              </div>
              <div className="block sm:hidden scale-90">
                <Logo size="md" showTagline={false} />
              </div>
            </div>

            <div className="mb-3 space-y-2">
              <div className="flex flex-col items-center gap-2">
                <p className="text-[11px] sm:text-sm text-forest-700 font-medium italic text-center">
                  Each guess reveals another clue...
                </p>
                {expiresAt && !isExpired && (
                  <div className="flex flex-col items-center gap-1">
                    <ChallengeTimer expiresAt={expiresAt} onExpired={handleExpired} />
                    <p className="text-[10px] sm:text-xs text-ink-300 text-center">
                      Send to friends before time runs out!
                    </p>
                  </div>
                )}
              </div>
            </div>

            <FoldedLetter
              phase={selectedCategory ? phase : Math.max(1, phase)}
              wrongGuessShake={shouldShake}
              onPhaseClick={handlePhaseClick}
              wrongGuesses={mappedWrongGuesses}
              mysteryContent={
                <div className="relative px-6 py-3 sm:px-8 sm:py-4 bg-forest-700 rounded-xl secret-note-shadow paper-texture border-2 border-forest-800 inline-flex items-center gap-3 sm:gap-4 shadow-xl">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                  <span className="text-xs sm:text-sm font-semibold text-gold-200/90 uppercase tracking-widest relative z-10 whitespace-nowrap">Mystery:</span>
                  <span className="text-xl sm:text-2xl font-serif font-bold text-white relative z-10 whitespace-nowrap">
                    {challengeType.charAt(0).toUpperCase() + challengeType.slice(1)}
                  </span>
                </div>
              }
            >
              {phaseContent}
            </FoldedLetter>

            {viewingPhase && viewingPhase < phase && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
                onClick={handleCloseModal}
              >
                <div
                  className="bg-paper-cream rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto border-2 sm:border-4 border-amber-200/50 paper-texture relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleCloseModal}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-forest-600 hover:bg-forest-700 text-white rounded-full transition-colors shadow-lg z-10 text-sm sm:text-base"
                    aria-label="Close modal"
                  >
                    X
                  </button>

                  <div className="mb-3 sm:mb-4">
                    <span className="inline-block px-3 py-1 sm:px-4 sm:py-2 bg-forest-600 text-gold-100 rounded-full text-xs sm:text-sm font-bold">
                      Phase {viewingPhase}
                    </span>
                  </div>
                  {phaseContent[viewingPhase - 1]}

                  {viewingPhase > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); showPrevPhase(); }}
                      className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-forest-700 hover:bg-forest-800 text-gold-300 rounded-full transition-all shadow-lg z-10 text-lg sm:text-xl font-bold border-2 border-gold-300/50 hover:scale-105 hover:border-gold-400"
                      aria-label="Previous phase"
                    >
                      &larr;
                    </button>
                  )}

                  {viewingPhase < phase - 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); showNextPhase(); }}
                      className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-forest-700 hover:bg-forest-800 text-gold-300 rounded-full transition-all shadow-lg z-10 text-lg sm:text-xl font-bold border-2 border-gold-300/50 hover:scale-105 hover:border-gold-400"
                      aria-label="Next phase"
                    >
                      &rarr;
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {gameState === 'playing' && hints && ((phase === 1 && selectedCategory) || phase > 1) && (
          <div className="space-y-1.5 sm:space-y-2">
            {isThinking && (
              <div className="flex items-center justify-center gap-2 p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border-2 border-fold-indigo/30 paper-shadow animate-pulse">
                <Logo loading={true} />
                <p className="text-xs sm:text-sm font-bold text-ink-500">Checking your answer...</p>
              </div>
            )}

            {lastGuessResult === 'correct' && !isThinking && (
              <div className="flex items-center justify-center gap-2 p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border-2 border-green-400 paper-shadow animate-success-glow">
                <span className="text-lg sm:text-xl">+</span>
                <p className="text-xs sm:text-sm font-bold text-green-700">Correct! Well done!</p>
              </div>
            )}

            {lastGuessResult === 'incorrect' && !isThinking && !suggestedCorrection && (
              <div className="flex items-center justify-center gap-2 p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border-2 border-red-400 paper-shadow animate-[fadeIn_0.3s_ease-in-out]">
                <span className="text-lg sm:text-xl">X</span>
                <p className="text-xs sm:text-sm font-bold text-red-700">Not quite! Try again</p>
              </div>
            )}

            {suggestedCorrection && (
              <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-blue-400 paper-shadow p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-bold text-ink-600 mb-2 sm:mb-3 text-center">Did you mean:</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={acceptSuggestion}
                    className="px-6 py-2 bg-forest-600 text-white rounded-full font-bold hover:bg-forest-700 transition-colors"
                  >
                    {suggestedCorrection}
                  </button>
                  <button
                    onClick={rejectSuggestion}
                    className="px-6 py-2 bg-gray-300 text-ink-700 rounded-full font-bold hover:bg-gray-400 transition-colors"
                  >
                    No, use "{pendingGuess}"
                  </button>
                </div>
              </div>
            )}

            {guessError && (
              <div className="mb-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center animate-pulse">
                {guessError}
              </div>
            )}

            <div className="mb-2 sm:mb-3 pb-safe">
              <GuessBar onSubmit={handleGuess} placeholder="What's your guess?" disabled={isThinking || !!suggestedCorrection} />
            </div>
            <div className="text-center text-[11px] sm:text-sm text-ink-300 font-medium pb-1 sm:pb-0">
              Phase {phase} of 5 &bull; {guesses} {guesses === 1 ? 'guess' : 'guesses'} used
            </div>

            {(phase === 4 || phase === 5) && (
              <div className="flex justify-center pb-2 sm:pb-0">
                <button
                  onClick={() => {
                    if (window.confirm('Give up and reveal the answer?')) {
                      giveUp();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] sm:text-xs font-semibold text-ink-400 hover:text-ink-600 bg-white/60 hover:bg-white border border-ink-200 rounded-full transition-colors"
                >
                  <Flag className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Give up and reveal
                </button>
              </div>
            )}
          </div>
        )}

        {(gameState === 'solved' || gameState === 'failed') && (
          <>
            <ShareCard
              rank={rank}
              solved={gameState === 'solved'}
              answer={answer}
              guesses={guesses}
              phase={phase}
              shareUrl={token ? window.location.href : undefined}
              challengeId={challengeId || undefined}
              category={dailyCategory}
            />
            {challengeId && <Leaderboard challengeId={challengeId} />}
          </>
        )}
      </div>
    </div>
  );
}
