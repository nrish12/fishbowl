import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
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
  const [viewingPhase, setViewingPhase] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [playerFingerprint] = useState(() => {
    try {
      return getSessionId();
    } catch {
      return `session_${Math.random().toString(36).slice(2)}`;
    }
  });

  const STORAGE_KEY_PREFIX = 'mystle_progress_';
  const DAILY_CHALLENGE_DATE_KEY = 'mystle_daily_date';

  const saveProgress = () => {
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
      phase5Data,
      timestamp: Date.now(),
      challengeId,
    };

    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${token}`, JSON.stringify(progress));
    } catch (error) {
      console.warn('Failed to save progress:', error);
    }
  };

  const loadProgress = () => {
    if (!token) return null;

    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${token}`);
      if (!saved) return null;

      const progress = JSON.parse(saved);

      if (gameState === 'solved' || gameState === 'failed') {
        return null;
      }

      const hoursSinceSave = (Date.now() - progress.timestamp) / (1000 * 60 * 60);
      if (hoursSinceSave > 24) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${token}`);
        return null;
      }

      return progress;
    } catch (error) {
      console.warn('Failed to load progress:', error);
      return null;
    }
  };

  const clearProgress = () => {
    if (!token) return;
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}${token}`);
  };

  const checkAndClearDailyChallenge = () => {
    const today = new Date().toISOString().split('T')[0];
    const lastDaily = localStorage.getItem(DAILY_CHALLENGE_DATE_KEY);

    if (lastDaily !== today) {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem(DAILY_CHALLENGE_DATE_KEY, today);
    }
  };

  useEffect(() => {
    if (!token) {
      setError('No challenge token provided');
      setGameState('failed');
      return;
    }

    checkAndClearDailyChallenge();
    loadChallenge();
  }, [token]);

  useEffect(() => {
    if (token && gameState === 'playing' && challengeId) {
      const progress = loadProgress();
      if (progress) {
        setPhase(progress.phase);
        setGuesses(progress.guesses);
        setWrongGuesses(progress.wrongGuesses);
        if (progress.guessScores) setGuessScores(progress.guessScores);
        if (progress.guessPhases) setGuessPhases(progress.guessPhases);
        setStartTime(progress.startTime);
        setSelectedCategory(progress.selectedCategory);
        if (progress.phase4Nudge) setPhase4Nudge(progress.phase4Nudge);
        if (progress.phase5Data) setPhase5Data(progress.phase5Data);
      }
    }
  }, [challengeId]);

  useEffect(() => {
    if (gameState === 'playing') {
      saveProgress();
    } else if (gameState === 'solved' || gameState === 'failed') {
      clearProgress();
    }
  }, [gameState, phase, guesses, wrongGuesses, guessPhases, selectedCategory, phase4Nudge, phase5Data]);

  const loadChallenge = async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/resolve-challenge?t=${token}`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
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
      setGameState('playing');
      setStartTime(Date.now());

      if (data.id) {
        await trackEvent('visit', data.id, {
          referrer: document.referrer || 'direct',
        });
      }
    } catch (err: any) {
      setError(err.message);
      setGameState('failed');
    }
  };

  const handleGuess = async (guess: string) => {
    if (!token || !hints || !challengeId) return;

    setIsThinking(true);
    setLastGuessResult(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/check-guess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          token,
          guess,
          phase,
          player_fingerprint: playerFingerprint,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to validate guess');
      }

      const data = await response.json();
      const isCorrect = data.result === 'correct';

      if (data.suggestion && data.suggestion !== guess) {
        setPendingGuess(guess);
        setSuggestedCorrection(data.suggestion);
        setIsThinking(false);
        return;
      }

      if (data.similarity_score !== undefined) {
        console.log(`Setting similarity score for "${guess}": ${data.similarity_score}%`);
        setGuessScores(prev => ({ ...prev, [guess]: data.similarity_score }));
      }

      await trackEvent('attempt', challengeId, {
        guess_text: guess,
        phase_revealed: phase,
        is_correct: isCorrect,
      });

      if (isCorrect) {
        setLastGuessResult('correct');
        setAnswer(data.canonical);
        setRank(phase === 1 ? 'Gold' : phase === 2 ? 'Silver' : 'Bronze');
        setGuesses(prev => prev + 1);
        setTimeout(() => setGameState('solved'), 800);

        const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
        await trackEvent('completion', challengeId, {
          completed_phase: phase,
          total_attempts: guesses + 1,
          time_taken_seconds: timeElapsed,
        });
      } else {
        setLastGuessResult('incorrect');
        setWrongGuesses(prev => [...prev, guess]);
        setGuessPhases(prev => ({ ...prev, [guess]: phase }));
        setGuesses(prev => prev + 1);
        setShouldShake(true);
        setTimeout(() => setShouldShake(false), 400);

        console.log('[Phase Logic] Wrong guess. Current phase:', phase, 'Wrong guess count:', wrongGuesses.length + 1);

        if (wrongGuesses.length + 1 >= 5 && phase >= 5) {
          console.log('[Game Over] Reached 5 wrong guesses at phase 5, revealing answer');
          const answerResponse = await fetch(`${SUPABASE_URL}/functions/v1/check-guess`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ token, guess: '__reveal__', phase }),
          });
          const answerData = await answerResponse.json();
          setAnswer(answerData.canonical || 'Unknown');
          setGameState('failed');
        } else {
          if (phase === 1) {
            console.log('[Advancing] Phase 1 → Phase 2');
            setPhase(2);
          } else if (phase === 2) {
            console.log('[Advancing] Phase 2 → Phase 3');
            setPhase(3);
          } else if (phase === 3) {
            console.log('[Advancing] Phase 3 → Phase 4 (Fetching AI nudge...)');
            try {
              const phase4Response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/phase4-nudge`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                  token,
                  guesses: [...wrongGuesses, guess],
                  hints: hints,
                }),
                timeout: 45000, // 45 second timeout for OpenAI call
              });

              if (phase4Response.ok) {
                const nudgeData = await phase4Response.json();
                console.log('[Phase 4] Success! Nudge data:', nudgeData);
                setPhase4Nudge(nudgeData.nudge);
                setPhase4Keywords(nudgeData.keywords || []);
                setPhase(4);
              } else {
                const errorText = await phase4Response.text();
                console.error('[Phase 4] Failed to fetch nudge. Status:', phase4Response.status, 'Response:', errorText);
                setPhase(4);
              }
            } catch (err) {
              console.error('[Phase 4] Error:', err);
              setPhase(4);
            }
          } else if (phase === 4) {
            console.log('[Advancing] Phase 4 → Phase 5 (Fetching visual...)');
            try {
              const phase5Response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/phase5-visual`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                  token,
                  guesses: [...wrongGuesses, guess],
                  hints: {
                    ...hints,
                    phase4_nudge: phase4Nudge,
                  },
                }),
                timeout: 45000, // 45 second timeout for OpenAI call
              });

              if (phase5Response.ok) {
                const visualData = await phase5Response.json();
                // Merge existing scores with phase5 analysis
                if (visualData?.semantic_scores) {
                  const mergedScores = visualData.semantic_scores.map((item: any) => ({
                    ...item,
                    score: guessScores[item.guess] !== undefined ? guessScores[item.guess] : item.score,
                  }));
                  visualData.semantic_scores = mergedScores;
                }
                setPhase5Data(visualData);
                setPhase(5);
              } else {
                const errorText = await phase5Response.text();
                console.error('[Phase 5] Failed to fetch visual. Status:', phase5Response.status, 'Response:', errorText);
                setPhase(5);
              }
            } catch (err) {
              console.error('[Phase 5] Error:', err);
              setPhase(5);
            }
          }
        }
      }
    } catch (err) {
      console.error('Guess error:', err);
    } finally {
      setTimeout(() => {
        setIsThinking(false);
        setLastGuessResult(null);
      }, 1500);
    }
  };

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

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

        {gameState === 'playing' && hints && (() => {
          const phaseContent = [
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
                  <div className="text-5xl animate-pulse">💡</div>
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
                  <div className="text-5xl animate-pulse">🔮</div>
                  <h3 className="text-2xl font-serif font-bold text-ink-500">Phase 5: Final Chance</h3>
                  <p className="text-ink-400">Loading complete visual breakdown...</p>
                </div>
              )}
            </div>,
          ];

          return (
          <>
            {/* Header - Centered Logo */}
            <div className="flex justify-center mb-2 sm:mb-3">
              <div className="hidden sm:block">
                <Logo size="lg" showTagline={false} />
              </div>
              <div className="block sm:hidden scale-90">
                <Logo size="md" showTagline={false} />
              </div>
            </div>

            {/* Tagline and Timer */}
            <div className="mb-3 space-y-2">
              <div className="flex flex-col items-center gap-2">
                <p className="text-[11px] sm:text-sm text-forest-700 font-medium italic text-center">
                  Each guess reveals another clue...
                </p>
                {expiresAt && !isExpired && (
                  <div className="flex flex-col items-center gap-1">
                    <ChallengeTimer expiresAt={expiresAt} onExpired={() => setIsExpired(true)} />
                    <p className="text-[10px] sm:text-xs text-ink-300 text-center">
                      Send to friends before time runs out!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mystery Clues with aligned guesses */}
            <FoldedLetter
              phase={selectedCategory ? phase : Math.max(1, phase)}
              wrongGuessShake={shouldShake}
              onPhaseClick={(p) => setViewingPhase(p)}
              wrongGuesses={wrongGuesses.map(guess => ({
                guess,
                score: guessScores[guess] ?? null,
                phaseGuessed: guessPhases[guess] ?? 1
              }))}
              mysteryContent={
                <div className="relative px-3 py-1.5 sm:px-4 sm:py-2 bg-forest-700 rounded-lg secret-note-shadow paper-texture border-2 border-forest-800 min-w-[120px] max-w-[180px]">
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                  <p className="text-[9px] sm:text-[10px] font-bold text-gold-200 uppercase tracking-wide text-center relative z-10 leading-tight">The mystery is a</p>
                  <p className="text-sm sm:text-base font-serif font-bold text-white drop-shadow-lg text-center whitespace-nowrap relative z-10">
                    {challengeType.charAt(0).toUpperCase() + challengeType.slice(1)}
                  </p>
                </div>
              }
            >
              {phaseContent}
            </FoldedLetter>

            {/* Phase Review Modal */}
            {viewingPhase && viewingPhase < phase && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
                onClick={() => setViewingPhase(null)}
              >
                <div
                  className="bg-paper-cream rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-8 max-w-3xl w-full max-h-[80vh] overflow-y-auto border-2 sm:border-4 border-amber-200/50 paper-texture relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setViewingPhase(null)}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-forest-600 hover:bg-forest-700 text-white rounded-full transition-colors shadow-lg z-10 text-sm sm:text-base"
                  >
                    ✕
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
                    >
                      ←
                    </button>
                  )}

                  {viewingPhase < phase - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingPhase(viewingPhase + 1);
                      }}
                      className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-forest-700 hover:bg-forest-800 text-gold-300 rounded-full transition-all shadow-lg z-10 text-lg sm:text-xl font-bold border-2 border-gold-300/50 hover:scale-105 hover:border-gold-400"
                    >
                      →
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
          );
        })()}

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
                      setSuggestedCorrection(null);
                      setLastGuessResult('incorrect');
                      if (pendingGuess) {
                        setWrongGuesses(prev => [...prev, pendingGuess]);
                        setGuessPhases(prev => ({ ...prev, [pendingGuess]: phase }));
                        setGuesses(prev => prev + 1);
                        if (guessScores[pendingGuess]) {
                          setGuessScores(prev => ({ ...prev, [pendingGuess]: guessScores[pendingGuess] }));
                        }

                        const currentWrongGuessCount = wrongGuesses.length + 1;
                        console.log('[Phase Logic] Wrong guess rejected. Current phase:', phase, 'Wrong guess count:', currentWrongGuessCount);

                        if (phase >= 5) {
                          console.log('[Game Over] Reached phase 5, revealing answer');
                          const answerResponse = await fetch(`${SUPABASE_URL}/functions/v1/check-guess`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                            },
                            body: JSON.stringify({ token, guess: '__reveal__', phase }),
                          });
                          const answerData = await answerResponse.json();
                          setAnswer(answerData.canonical || 'Unknown');
                          setGameState('failed');
                        } else if (phase === 1) {
                          console.log('[Advancing] Phase 1 → Phase 2');
                          setPhase(2);
                        } else if (phase === 2) {
                          console.log('[Advancing] Phase 2 → Phase 3');
                          setPhase(3);
                        } else if (phase === 3) {
                          console.log('[Advancing] Phase 3 → Phase 4');
                          try {
                            const phase4Response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/phase4-nudge`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                              },
                              body: JSON.stringify({
                                token,
                                guesses: wrongGuesses,
                                hints: hints,
                              }),
                              timeout: 45000,
                            });

                            if (phase4Response.ok) {
                              const phase4Data = await phase4Response.json();
                              setPhase4Nudge(phase4Data.nudge);
                              setPhase4Keywords(phase4Data.keywords || []);
                            }
                          } catch (err) {
                            console.error('[Phase 4] Error fetching nudge:', err);
                          }
                          setPhase(4);
                        } else if (phase === 4) {
                          console.log('[Advancing] Phase 4 → Phase 5');
                          try {
                            const phase5Response = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/phase5-visual`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                              },
                              body: JSON.stringify({
                                token,
                                guesses: wrongGuesses,
                                hints: {
                                  ...hints,
                                  phase4_nudge: phase4Nudge,
                                },
                              }),
                              timeout: 45000,
                            });

                            if (phase5Response.ok) {
                              const phase5Resp = await phase5Response.json();
                              // Merge existing scores with phase5 analysis
                              if (phase5Resp?.semantic_scores) {
                                const mergedScores = phase5Resp.semantic_scores.map((item: any) => ({
                                  ...item,
                                  score: guessScores[item.guess] !== undefined ? guessScores[item.guess] : item.score,
                                }));
                                phase5Resp.semantic_scores = mergedScores;
                              }
                              setPhase5Data(phase5Resp);
                            }
                          } catch (err) {
                            console.error('[Phase 5] Error fetching visual:', err);
                          }
                          setPhase(5);
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
            />
            {challengeId && <Leaderboard challengeId={challengeId} />}
          </>
        )}
      </div>
    </div>
  );
}
