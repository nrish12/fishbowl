import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Logo from '../components/Logo';
import Lives from '../components/Lives';
import PhaseChips from '../components/PhaseChips';
import SentenceCard from '../components/SentenceCard';
import CategoryPicker from '../components/CategoryPicker';
import GuessBar from '../components/GuessBar';
import ShareCard from '../components/ShareCard';
import { Leaderboard } from '../components/Leaderboard';
import Phase4Nudge from '../components/Phase4Nudge';
import Phase5Visual from '../components/Phase5Visual';
import { getSessionId, trackEvent } from '../utils/tracking';

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
  const [lives, setLives] = useState(5);
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
  const [lastGuessResult, setLastGuessResult] = useState<'correct' | 'incorrect' | null>(null);
  const [phase4Nudge, setPhase4Nudge] = useState<string | null>(null);
  const [phase4Keywords, setPhase4Keywords] = useState<string[]>([]);
  const [phase5Data, setPhase5Data] = useState<Phase5Data | null>(null);
  const [playerFingerprint] = useState(() => {
    try {
      return getSessionId();
    } catch {
      return `session_${Math.random().toString(36).slice(2)}`;
    }
  });

  const STORAGE_KEY_PREFIX = 'clueladder_progress_';
  const DAILY_CHALLENGE_DATE_KEY = 'clueladder_daily_date';

  const saveProgress = () => {
    if (!token) return;

    const progress = {
      phase,
      lives,
      guesses,
      wrongGuesses,
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
        setLives(progress.lives);
        setGuesses(progress.guesses);
        setWrongGuesses(progress.wrongGuesses);
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
  }, [gameState, phase, lives, guesses, wrongGuesses, selectedCategory, phase4Nudge, phase5Data]);

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

    const updatedGuessCount = guesses + 1;

    setIsThinking(true);
    setLastGuessResult(null);
    setGuesses(prev => prev + 1);

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

      await trackEvent('attempt', challengeId, {
        guess_text: guess,
        phase_revealed: phase,
        is_correct: isCorrect,
      });

      if (isCorrect) {
        setLastGuessResult('correct');
        setAnswer(data.canonical);
        setRank(phase === 1 ? 'Gold' : phase === 2 ? 'Silver' : 'Bronze');
        setTimeout(() => setGameState('solved'), 800);

        const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
        await trackEvent('completion', challengeId, {
          completed_phase: phase,
          total_attempts: updatedGuessCount,
          time_taken_seconds: timeElapsed,
        });
      } else {
        setLastGuessResult('incorrect');
        setWrongGuesses(prev => [...prev, guess]);
        const remainingLives = lives - 1;
        setLives(prev => prev - 1);

        if (remainingLives <= 0) {
          if (phase === 3) {
            try {
              const answerResponse = await fetch(`${SUPABASE_URL}/functions/v1/check-guess`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ token, guess: '__reveal__', phase }),
              });
              const answerData = await answerResponse.json();
              const targetAnswer = answerData.canonical || 'Unknown';

              const phase4Response = await fetch(`${SUPABASE_URL}/functions/v1/phase4-nudge`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                  target: targetAnswer,
                  type: challengeType,
                  guesses: [...wrongGuesses, guess],
                  hints: hints,
                }),
              });

              if (phase4Response.ok) {
                const nudgeData = await phase4Response.json();
                setPhase4Nudge(nudgeData.nudge);
                setPhase4Keywords(nudgeData.keywords || []);
                setPhase(4);
                setLives(1);
              } else {
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
              }
            } catch (err) {
              console.error('Phase 4 fetch error:', err);
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
            }
          } else if (phase === 4) {
            try {
              const answerResponse = await fetch(`${SUPABASE_URL}/functions/v1/check-guess`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ token, guess: '__reveal__', phase }),
              });
              const answerData = await answerResponse.json();
              const targetAnswer = answerData.canonical || 'Unknown';

              const phase5Response = await fetch(`${SUPABASE_URL}/functions/v1/phase5-visual`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                  target: targetAnswer,
                  type: challengeType,
                  guesses: [...wrongGuesses, guess],
                  hints: {
                    ...hints,
                    phase4_nudge: phase4Nudge,
                  },
                }),
              });

              if (phase5Response.ok) {
                const visualData = await phase5Response.json();
                setPhase5Data(visualData);
                setPhase(5);
                setLives(1);
              } else {
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
              }
            } catch (err) {
              console.error('Phase 5 fetch error:', err);
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
            }
          } else {
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
          }
        } else if (phase < 3) {
          setPhase(prev => (prev + 1) as Phase);
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

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  if (gameState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-gold mx-auto" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-50 via-paper-100 to-paper-200 py-8 px-6 relative overflow-hidden">
      <div className="absolute inset-0 paper-texture opacity-30" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-ink-300 hover:text-ink-500 transition-colors">
            <ArrowLeft size={20} />
            <span className="font-semibold">Back</span>
          </Link>
          <Logo size="sm" showTagline={false} />
          <Lives current={lives} total={5} />
        </div>

        {gameState === 'playing' && hints && (
          <div className="space-y-8">
            <div className="text-center space-y-3 animate-paper-unfold">
              <div className="inline-block px-8 py-4 bg-gradient-to-r from-fold-indigo to-fold-purple rounded-2xl shadow-lg paper-texture relative">
                <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white/30" />
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/30" />
                <p className="text-xs font-semibold text-white/80 uppercase tracking-wider mb-1">The mystery is a</p>
                <p className="text-3xl font-serif font-bold text-white">
                  {challengeType.charAt(0).toUpperCase() + challengeType.slice(1)}
                </p>
              </div>
              <p className="text-sm text-ink-300 font-medium">
                Each guess unfolds another clue...
              </p>
            </div>

            {phase >= 1 && selectedCategory && (
              <div className="animate-paper-unfold">
                <CategoryPicker
                  categories={hints.phase3}
                  revealed={true}
                  selectedCategory={selectedCategory}
                />
              </div>
            )}

            {phase === 1 && !selectedCategory && (
              <div className="animate-paper-unfold">
                <CategoryPicker
                  categories={hints.phase3}
                  revealed={false}
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                />
              </div>
            )}

            {phase >= 2 && (
              <div className="animate-paper-unfold">
                <SentenceCard
                  sentence={hints.phase2}
                  revealed={true}
                  onReveal={undefined}
                />
              </div>
            )}

            {phase >= 3 && (
              <div className="animate-paper-unfold">
                <PhaseChips words={hints.phase1} revealed={true} />
              </div>
            )}

            {phase === 4 && phase4Nudge && (
              <div className="animate-paper-unfold">
                <Phase4Nudge nudge={phase4Nudge} keywords={phase4Keywords} />
              </div>
            )}

            {phase === 5 && phase5Data && (
              <div className="animate-paper-unfold">
                <Phase5Visual data={phase5Data} />
              </div>
            )}

            {isThinking && (
              <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-2xl border-2 border-fold-indigo/30 paper-shadow animate-pulse">
                <Loader2 className="w-5 h-5 animate-spin text-fold-indigo" />
                <p className="text-sm font-bold text-ink-500">Checking your answer...</p>
              </div>
            )}

            {lastGuessResult === 'correct' && !isThinking && (
              <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-2xl border-2 border-green-400 paper-shadow animate-[fadeIn_0.3s_ease-in-out]">
                <span className="text-2xl">✅</span>
                <p className="text-sm font-bold text-green-700">Correct! Well done!</p>
              </div>
            )}

            {lastGuessResult === 'incorrect' && !isThinking && (
              <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-2xl border-2 border-red-400 paper-shadow animate-[fadeIn_0.3s_ease-in-out]">
                <span className="text-2xl">❌</span>
                <p className="text-sm font-bold text-red-700">Not quite! Try again</p>
              </div>
            )}

            {wrongGuesses.length > 0 && (
              <div className="bg-white rounded-2xl p-5 paper-shadow paper-texture border border-ink-200/30">
                <p className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3">Previous Attempts:</p>
                <div className="flex flex-wrap gap-2">
                  {wrongGuesses.map((guess, idx) => (
                    <span key={idx} className="px-4 py-2 bg-paper-100 text-ink-500 rounded-full text-sm font-medium border border-ink-200/50 shadow-sm">
                      {guess}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {((phase === 1 && selectedCategory) || phase > 1) && (
              <div className="space-y-4 animate-fold-open">
                <GuessBar onSubmit={handleGuess} placeholder="What's your guess?" disabled={isThinking} />
                <div className="text-center text-sm text-ink-300 font-medium">
                  Phase {phase} of 5 • {guesses} {guesses === 1 ? 'guess' : 'guesses'} used
                </div>
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
            />
            {challengeId && <Leaderboard challengeId={challengeId} />}
          </>
        )}
      </div>
    </div>
  );
}
