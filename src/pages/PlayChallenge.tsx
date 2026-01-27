import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
import { getSessionId, trackEvent } from '../utils/tracking';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface Hints {
  phase1: string[];
  phase2: string;
  phase3: {
    geography: string;
    history: string;
    culture: string;
    stats: string;
    visual: string;
  };
  phase4_nudge?: string;
}

interface Phase5Data {
  semantic_scores: Array<{
    guess: string;
    score: number;
    reason: string;
  }>;
  connections: Array<{
    guess: string;
    hint: string;
    pattern: string;
  }>;
  synthesis: string;
  themes_identified: string[];
  themes_missing: string[];
}

type GameState = 'loading' | 'playing' | 'solved' | 'failed';
type Phase = 1 | 2 | 3 | 4 | 5;

export default function PlayChallenge() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');

  const [gameState, setGameState] = useState<GameState>('loading');
  const [hints, setHints] = useState<Hints | null>(null);
  const [challengeType, setChallengeType] = useState<string>('');
  const [phase, setPhase] = useState<Phase>(1);
  const [guesses, setGuesses] = useState(0);
  const [answer, setAnswer] = useState('');
  const [rank, setRank] = useState<'Gold' | 'Silver' | 'Bronze' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isThinking, setIsThinking] = useState(false);
  const [wrongGuesses, setWrongGuesses] = useState<string[]>([]);
  const [guessScores, setGuessScores] = useState<Record<string, number>>({});
  const [guessPhases, setGuessPhases] = useState<Record<string, number>>({});
  const [suggestedCorrection, setSuggestedCorrection] = useState<string | null>(null);
  const [pendingGuess, setPendingGuess] = useState<string | null>(null);
  const [lastGuessResult, setLastGuessResult] = useState<'correct' | 'incorrect' | null>(null);
  const [phase4Nudge, setPhase4Nudge] = useState<string | null>(null);
  const [phase4Keywords, setPhase4Keywords] = useState<string[]>([]);
  const [phase5Data, setPhase5Data] = useState<Phase5Data | null>(null);
  const [shouldShake, setShouldShake] = useState(false);
  const [guessError, setGuessError] = useState<string | null>(null);
  const [viewingPhase, setViewingPhase] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [dailyCategory, setDailyCategory] = useState<string | null>(null);
  const [playerFingerprint] = useState(() => {
    try {
      return getSessionId();
    } catch {
      return `session_${Math.random().toString(36).slice(2)}`;
    }
  });

  const isSubmittingRef = useRef(false);
  const suggestionPendingRef = useRef(false);
  const progressLoadedRef = useRef(false);
  const lastTokenRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const STORAGE_KEY_PREFIX = 'mystle_progress_';
  const DAILY_PROGRESS_PREFIX = 'mystle_daily_progress_';
  const DAILY_CHALLENGE_DATE_KEY = 'mystle_daily_date';

  const saveProgress = useCallback(() => {
    if (!token) return;

    const progress = {
      phase,
      guesses,
      wrongGuesses,
      guessScores,
      guessPhases,
      startTime,
      selectedCategory,
      phase4Nudge,
      phase4Keywords,
      phase5Data,
      timestamp: Date.now(),
      challengeId,
      isDaily: !!dailyCategory,
    };

    try {
      const prefix = dailyCategory ? DAILY_PROGRESS_PREFIX : STORAGE_KEY_PREFIX;
      localStorage.setItem(`${prefix}${token}`, JSON.stringify(progress));
    } catch (error) {
      console.warn('Failed to save progress:', error);
    }
  }, [token, phase, guesses, wrongGuesses, guessScores, guessPhases, startTime, selectedCategory, phase4Nudge, phase4Keywords, phase5Data, challengeId, dailyCategory]);

  const loadProgress = useCallback(() => {
    if (!token) return null;

    try {
      let saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${token}`);
      if (!saved) {
        saved = localStorage.getItem(`${DAILY_PROGRESS_PREFIX}${token}`);
      }
      if (!saved) return null;

      const progress = JSON.parse(saved);

      const hoursSinceSave = (Date.now() - progress.timestamp) / (1000 * 60 * 60);
      if (hoursSinceSave > 24) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${token}`);
        localStorage.removeItem(`${DAILY_PROGRESS_PREFIX}${token}`);
        return null;
      }

      return progress;
    } catch (error) {
      console.warn('Failed to load progress:', error);
      return null;
    }
  }, [token]);

  const clearProgress = useCallback(() => {
    if (!token) return;
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${token}`);
      localStorage.removeItem(`${DAILY_PROGRESS_PREFIX}${token}`);
    } catch (error) {
      console.warn('Failed to clear progress:', error);
    }
  }, [token]);

  const checkAndClearDailyChallenge = useCallback(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastDaily = localStorage.getItem(DAILY_CHALLENGE_DATE_KEY);

      if (lastDaily !== today) {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(DAILY_PROGRESS_PREFIX)) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem(DAILY_CHALLENGE_DATE_KEY, today);
      }
    } catch (error) {
      console.warn('Failed to check daily challenge:', error);
    }
  }, []);

  const revealAnswer = useCallback(async () => {
    try {
      const answerResponse = await fetch(`${SUPABASE_URL}/functions/v1/check-guess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ token, guess: '__reveal__', phase }),
      });
      if (!answerResponse.ok) {
        throw new Error('Failed to reveal answer');
      }
      const answerData = await answerResponse.json();
      setAnswer(answerData.canonical || 'Unknown');
    } catch (err) {
      console.error('Failed to reveal answer:', err);
      setAnswer('Unknown');
    }
    setGameState('failed');
  }, [token, phase]);

  const advancePhase = useCallback(async (_currentGuess: string, allWrongGuesses: string[]) => {
    if (phase === 1) {
      setPhase(2);
    } else if (phase === 2) {
      setPhase(3);
    } else if (phase === 3) {
      try {
        const phase4Response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/phase4-nudge`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            token,
            guesses: allWrongGuesses,
            hints: hints,
          }),
          timeout: 45000,
        });

        if (phase4Response.ok) {
          const nudgeData = await phase4Response.json();
          setPhase4Nudge(nudgeData.nudge);
          setPhase4Keywords(nudgeData.keywords || []);
        }
      } catch (err) {
        console.error('[Phase 4] Error:', err);
      }
      setPhase(4);
    } else if (phase === 4) {
      try {
        const phase5Response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/phase5-visual`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            token,
            guesses: allWrongGuesses,
            hints: {
              ...hints,
              phase4_nudge: phase4Nudge,
            },
          }),
          timeout: 45000,
        });

        if (phase5Response.ok) {
          const visualData = await phase5Response.json();
          if (visualData?.semantic_scores) {
            const mergedScores = visualData.semantic_scores.map((item: any) => ({
              ...item,
              score: guessScores[item.guess] !== undefined ? guessScores[item.guess] : item.score,
            }));
            visualData.semantic_scores = mergedScores;
          }
          setPhase5Data(visualData);
        }
      } catch (err) {
        console.error('[Phase 5] Error:', err);
      }
      setPhase(5);
    }
  }, [token, hints, phase, phase4Nudge, guessScores]);

  useEffect(() => {
    if (!token) {
      setError('No challenge token provided');
      setGameState('failed');
      return;
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    checkAndClearDailyChallenge();
    loadChallenge();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [token, checkAndClearDailyChallenge]);

  useEffect(() => {
    if (token !== lastTokenRef.current) {
      progressLoadedRef.current = false;
      lastTokenRef.current = token;
    }
  }, [token]);

  useEffect(() => {
    if (token && gameState === 'playing' && challengeId && !progressLoadedRef.current) {
      const progress = loadProgress();
      if (progress && progress.challengeId === challengeId) {
        progressLoadedRef.current = true;
        setPhase(progress.phase);
        setGuesses(progress.guesses);
        setWrongGuesses(progress.wrongGuesses || []);
        if (progress.guessScores) setGuessScores(progress.guessScores);
        if (progress.guessPhases) setGuessPhases(progress.guessPhases);
        if (progress.startTime) setStartTime(progress.startTime);
        setSelectedCategory(progress.selectedCategory);
        if (progress.phase4Nudge) setPhase4Nudge(progress.phase4Nudge);
        if (progress.phase4Keywords) setPhase4Keywords(progress.phase4Keywords);
        if (progress.phase5Data) setPhase5Data(progress.phase5Data);
      }
    }
  }, [challengeId, gameState, token, loadProgress]);

  useEffect(() => {
    if (gameState === 'playing' && progressLoadedRef.current) {
      saveProgress();
    } else if (gameState === 'solved' || gameState === 'failed') {
      clearProgress();
    }
  }, [gameState, phase, guesses, wrongGuesses, guessPhases, selectedCategory, phase4Nudge, phase5Data, saveProgress, clearProgress]);

  const loadChallenge = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/resolve-challenge?t=${token}`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load challenge');
      }

      const data = await response.json();
      setHints(data.hints);
      setChallengeType(data.type);
      setChallengeId(data.id);
      setExpiresAt(data.expires_at);
      setDailyCategory(data.category || null);
      setGameState('playing');
      setStartTime(Date.now());

      if (data.id) {
        await trackEvent('visit', data.id, {
          referrer: document.referrer || 'direct',
          category: data.category || null,
        });
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      setError(err.message);
      setGameState('failed');
    }
  };

  const handleGuess = useCallback(async (guess: string) => {
    if (!token || !hints || !challengeId) return;
    if (isSubmittingRef.current || suggestionPendingRef.current) return;

    const trimmedGuess = guess.trim();
    if (!trimmedGuess) return;

    isSubmittingRef.current = true;
    setIsThinking(true);
    setLastGuessResult(null);

    try {
      const response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/check-guess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          token,
          guess: trimmedGuess,
          phase,
          player_fingerprint: playerFingerprint,
        }),
        timeout: 30000,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to validate guess');
      }

      const data = await response.json();
      const isCorrect = data.result === 'correct';

      if (data.suggestion && data.suggestion !== trimmedGuess) {
        suggestionPendingRef.current = true;
        setPendingGuess(trimmedGuess);
        setSuggestedCorrection(data.suggestion);
        setIsThinking(false);
        isSubmittingRef.current = false;
        return;
      }

      if (data.similarity_score !== undefined) {
        setGuessScores(prev => ({ ...prev, [trimmedGuess]: data.similarity_score }));
      }

      trackEvent('attempt', challengeId, {
        guess_text: trimmedGuess,
        phase_revealed: phase,
        is_correct: isCorrect,
        category: dailyCategory,
      }).catch(() => {});

      if (isCorrect) {
        setLastGuessResult('correct');
        setAnswer(data.canonical);
        setRank(phase === 1 ? 'Gold' : phase === 2 ? 'Silver' : 'Bronze');
        setGuesses(prev => prev + 1);
        setTimeout(() => setGameState('solved'), 800);

        const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
        trackEvent('completion', challengeId, {
          completed_phase: phase,
          total_attempts: guesses + 1,
          time_taken_seconds: timeElapsed,
          category: dailyCategory,
        }).catch(() => {});
      } else {
        setLastGuessResult('incorrect');
        const newWrongGuesses = [...wrongGuesses, trimmedGuess];
        setWrongGuesses(newWrongGuesses);
        setGuessPhases(prev => ({ ...prev, [trimmedGuess]: phase }));
        setGuesses(prev => prev + 1);
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 400);

        if (newWrongGuesses.length >= 5 && phase === 5) {
          await revealAnswer();
        } else if (phase < 5) {
          await advancePhase(trimmedGuess, newWrongGuesses);
        }
      }
    } catch (err) {
      console.error('Guess error:', err);
      setGuessError('Something went wrong. Please try again.');
      setTimeout(() => setGuessError(null), 4000);
    } finally {
      setTimeout(() => {
        setIsThinking(false);
        setLastGuessResult(null);
        isSubmittingRef.current = false;
      }, 1500);
    }
  }, [token, hints, challengeId, phase, playerFingerprint, wrongGuesses, guesses, startTime, dailyCategory, revealAnswer, advancePhase]);

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleExpired = useCallback(() => setIsExpired(true), []);
  const handlePhaseClick = useCallback((p: number) => setViewingPhase(p), []);
  const handleCloseModal = useCallback(() => setViewingPhase(null), []);

  const phaseContent = useMemo(() => {
    if (!hints) return [];
    return [
      <div key="phase1">
        {selectedCategory ? (
          <CategoryPicker
            categories={hints.phase3}
            revealed={true}
            selectedCategory={selectedCategory}
          />
        ) : (
          <CategoryPicker
            categories={hints.phase3}
            revealed={false}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        )}
      </div>,
      <div key="phase2">
        <SentenceCard
          sentence={hints.phase2}
          revealed={true}
          onReveal={undefined}
        />
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
  }, [hints, selectedCategory, handleSelectCategory, phase4Nudge, phase4Keywords, phase5Data]);

  const mappedWrongGuesses = useMemo(() =>
    wrongGuesses.map(guess => ({
      guess,
      score: guessScores[guess] ?? null,
      phaseGuessed: guessPhases[guess] ?? 1
    })),
  [wrongGuesses, guessScores, guessPhases]);

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
          <div className="text-5xl">❌</div>
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
          <div className="text-5xl">⏰</div>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingPhase(viewingPhase - 1);
                      }}
                      className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-forest-700 hover:bg-forest-800 text-gold-300 rounded-full transition-all shadow-lg z-10 text-lg sm:text-xl font-bold border-2 border-gold-300/50 hover:scale-105 hover:border-gold-400"
                      aria-label="Previous phase"
                    >
                      &larr;
                    </button>
                  )}

                  {viewingPhase < phase - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingPhase(viewingPhase + 1);
                      }}
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
                <span className="text-lg sm:text-xl">✅</span>
                <p className="text-xs sm:text-sm font-bold text-green-700">Correct! Well done!</p>
              </div>
            )}

            {lastGuessResult === 'incorrect' && !isThinking && !suggestedCorrection && (
              <div className="flex items-center justify-center gap-2 p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border-2 border-red-400 paper-shadow animate-[fadeIn_0.3s_ease-in-out]">
                <span className="text-lg sm:text-xl">❌</span>
                <p className="text-xs sm:text-sm font-bold text-red-700">Not quite! Try again</p>
              </div>
            )}

            {suggestedCorrection && (
              <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-blue-400 paper-shadow p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-bold text-ink-600 mb-2 sm:mb-3 text-center">Did you mean:</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => {
                      suggestionPendingRef.current = false;
                      setSuggestedCorrection(null);
                      if (pendingGuess) {
                        handleGuess(suggestedCorrection);
                      }
                      setPendingGuess(null);
                    }}
                    className="px-6 py-2 bg-forest-600 text-white rounded-full font-bold hover:bg-forest-700 transition-colors"
                  >
                    {suggestedCorrection}
                  </button>
                  <button
                    onClick={async () => {
                      suggestionPendingRef.current = false;
                      setSuggestedCorrection(null);
                      setLastGuessResult('incorrect');
                      if (pendingGuess) {
                        const newWrongGuesses = [...wrongGuesses, pendingGuess];
                        setWrongGuesses(newWrongGuesses);
                        setGuessPhases(prev => ({ ...prev, [pendingGuess]: phase }));
                        setGuesses(prev => prev + 1);
                        setShouldShake(true);
                        setTimeout(() => setShouldShake(false), 400);

                        if (newWrongGuesses.length >= 5 && phase === 5) {
                          await revealAnswer();
                        } else if (phase < 5) {
                          await advancePhase(pendingGuess, newWrongGuesses);
                        }
                      }
                      setPendingGuess(null);
                    }}
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
            <div className="text-center text-[11px] sm:text-sm text-ink-300 font-medium pb-2 sm:pb-0">
              Phase {phase} of 5 • {guesses} {guesses === 1 ? 'guess' : 'guesses'} used
            </div>
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
