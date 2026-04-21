import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getSessionId, trackEvent } from '../utils/tracking';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface Hints {
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

export interface Phase5Data {
  semantic_scores: Array<{ guess: string; score: number; reason: string }>;
  connections: Array<{ guess: string; hint: string; pattern: string }>;
  synthesis: string;
  themes_identified?: string[];
  themes_missing?: string[];
  narrowing_questions?: Array<{ question: string; why: string }>;
}

export type GameState = 'loading' | 'playing' | 'solved' | 'failed';
export type Phase = 1 | 2 | 3 | 4 | 5;
export type FirstClueKey = 'geography' | 'history' | 'culture' | 'stats' | 'visual';

const DAILY_FIRST_CLUE_CATEGORIES: Record<string, FirstClueKey[]> = {
  pop_culture: ['geography', 'history', 'stats'],
  history_science: ['culture', 'geography', 'stats'],
  sports: ['culture', 'history', 'stats'],
  geography: ['culture', 'geography', 'visual'],
};

const STORAGE_KEY_PREFIX = 'mystle_progress_';
const DAILY_PROGRESS_PREFIX = 'mystle_daily_progress_';
const DAILY_CHALLENGE_DATE_KEY = 'mystle_daily_date';
const DAILY_PLAYED_PREFIX = 'mystle_daily_played_';

export function useChallengeGame(token: string | null) {
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
  const phase4PrefetchRef = useRef<Promise<{ nudge: string | null; keywords: string[] } | null> | null>(null);

  const saveProgress = useCallback(() => {
    if (!token) return;
    const progress = {
      phase, guesses, wrongGuesses, guessScores, guessPhases, startTime, selectedCategory,
      phase4Nudge, phase4Keywords, phase5Data, timestamp: Date.now(), challengeId,
      isDaily: !!dailyCategory,
    };
    try {
      const prefix = dailyCategory ? DAILY_PROGRESS_PREFIX : STORAGE_KEY_PREFIX;
      localStorage.setItem(`${prefix}${token}`, JSON.stringify(progress));
    } catch (err) {
      console.warn('Failed to save progress:', err);
    }
  }, [token, phase, guesses, wrongGuesses, guessScores, guessPhases, startTime, selectedCategory, phase4Nudge, phase4Keywords, phase5Data, challengeId, dailyCategory]);

  const loadProgress = useCallback(() => {
    if (!token) return null;
    try {
      let saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${token}`);
      if (!saved) saved = localStorage.getItem(`${DAILY_PROGRESS_PREFIX}${token}`);
      if (!saved) return null;
      const progress = JSON.parse(saved);
      const hoursSinceSave = (Date.now() - progress.timestamp) / (1000 * 60 * 60);
      if (hoursSinceSave > 24) {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${token}`);
        localStorage.removeItem(`${DAILY_PROGRESS_PREFIX}${token}`);
        return null;
      }
      return progress;
    } catch (err) {
      console.warn('Failed to load progress:', err);
      return null;
    }
  }, [token]);

  const clearProgress = useCallback(() => {
    if (!token) return;
    try {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${token}`);
      localStorage.removeItem(`${DAILY_PROGRESS_PREFIX}${token}`);
    } catch (err) {
      console.warn('Failed to clear progress:', err);
    }
  }, [token]);

  const checkAndClearDailyChallenge = useCallback(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastDaily = localStorage.getItem(DAILY_CHALLENGE_DATE_KEY);
      if (lastDaily !== today) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(DAILY_PROGRESS_PREFIX)) localStorage.removeItem(key);
          if (key.startsWith(DAILY_PLAYED_PREFIX) && key !== `${DAILY_PLAYED_PREFIX}${today}`) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem(DAILY_CHALLENGE_DATE_KEY, today);
      }
    } catch (err) {
      console.warn('Failed to check daily challenge:', err);
    }
  }, []);

  const markDailyPlayed = useCallback((status: 'solved' | 'failed') => {
    if (!dailyCategory) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = `${DAILY_PLAYED_PREFIX}${today}`;
      const existing = localStorage.getItem(key);
      const played = existing ? JSON.parse(existing) : {};
      played[dailyCategory] = status;
      localStorage.setItem(key, JSON.stringify(played));
    } catch (err) {
      console.warn('Failed to mark daily played:', err);
    }
  }, [dailyCategory]);

  const revealAnswer = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/check-guess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ token, guess: '__reveal__', phase }),
      });
      if (!response.ok) throw new Error('Failed to reveal answer');
      const data = await response.json();
      setAnswer(data.canonical || 'Unknown');
    } catch (err) {
      console.error('Failed to reveal answer:', err);
      setAnswer('Unknown');
    }
    setGameState('failed');
  }, [token, phase]);

  const fetchPhase4Nudge = useCallback(async (allWrongGuesses: string[]): Promise<{ nudge: string | null; keywords: string[] } | null> => {
    try {
      const res = await fetchWithTimeout(`${SUPABASE_URL}/functions/v1/phase4-nudge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ token, guesses: allWrongGuesses, hints, similarity_scores: guessScores }),
        timeout: 45000,
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { nudge: data.nudge ?? null, keywords: data.keywords ?? [] };
    } catch (err) {
      console.error('[Phase 4] prefetch error:', err);
      return null;
    }
  }, [token, hints, guessScores]);

  const advancePhase = useCallback(async (_currentGuess: string, allWrongGuesses: string[]) => {
    if (phase === 1) {
      setPhase(2);
    } else if (phase === 2) {
      setPhase(3);
    } else if (phase === 3) {
      const prefetched = phase4PrefetchRef.current ? await phase4PrefetchRef.current : null;
      const result = prefetched ?? await fetchPhase4Nudge(allWrongGuesses);
      if (result) {
        setPhase4Nudge(result.nudge);
        setPhase4Keywords(result.keywords);
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
            hints: { ...hints, phase4_nudge: phase4Nudge },
          }),
          timeout: 45000,
        });
        if (phase5Response.ok) {
          const visualData = await phase5Response.json();
          if (visualData?.semantic_scores) {
            visualData.semantic_scores = visualData.semantic_scores.map((item: any) => ({
              ...item,
              score: guessScores[item.guess] !== undefined ? guessScores[item.guess] : item.score,
            }));
          }
          setPhase5Data(visualData);
        }
      } catch (err) {
        console.error('[Phase 5] Error:', err);
      }
      setPhase(5);
    }
  }, [token, hints, phase, phase4Nudge, guessScores, fetchPhase4Nudge]);

  useEffect(() => {
    if (phase === 2 && hints && !phase4PrefetchRef.current) {
      phase4PrefetchRef.current = fetchPhase4Nudge(wrongGuesses);
    }
  }, [phase, hints, wrongGuesses, fetchPhase4Nudge]);

  const loadChallenge = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/resolve-challenge?t=${token}`, {
        headers: { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
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
  }, [token]);

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
  }, [token, checkAndClearDailyChallenge, loadChallenge]);

  useEffect(() => {
    if (token !== lastTokenRef.current) {
      progressLoadedRef.current = false;
      lastTokenRef.current = token;
      phase4PrefetchRef.current = null;
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
      } else {
        progressLoadedRef.current = true;
      }
    }
  }, [challengeId, gameState, token, loadProgress]);

  useEffect(() => {
    if (gameState === 'playing' && progressLoadedRef.current) {
      saveProgress();
    } else if (gameState === 'solved' || gameState === 'failed') {
      clearProgress();
      markDailyPlayed(gameState === 'solved' ? 'solved' : 'failed');
    }
  }, [gameState, phase, guesses, wrongGuesses, guessPhases, selectedCategory, phase4Nudge, phase5Data, saveProgress, clearProgress, markDailyPlayed]);

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
        body: JSON.stringify({ token, guess: trimmedGuess, phase, player_fingerprint: playerFingerprint }),
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

  const acceptSuggestion = useCallback(() => {
    if (!suggestedCorrection) return;
    suggestionPendingRef.current = false;
    const accepted = suggestedCorrection;
    setSuggestedCorrection(null);
    if (pendingGuess) handleGuess(accepted);
    setPendingGuess(null);
  }, [suggestedCorrection, pendingGuess, handleGuess]);

  const rejectSuggestion = useCallback(async () => {
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
  }, [pendingGuess, wrongGuesses, phase, revealAnswer, advancePhase]);

  const giveUp = useCallback(async () => {
    if (challengeId) {
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
      trackEvent('completion', challengeId, {
        completed_phase: phase,
        total_attempts: guesses,
        time_taken_seconds: timeElapsed,
        category: dailyCategory,
        gave_up: true,
      }).catch(() => {});
    }
    await revealAnswer();
  }, [challengeId, startTime, phase, guesses, dailyCategory, revealAnswer]);

  const handleSelectCategory = useCallback((category: string) => setSelectedCategory(category), []);
  const handleExpired = useCallback(() => setIsExpired(true), []);
  const handlePhaseClick = useCallback((p: number) => setViewingPhase(p), []);
  const handleCloseModal = useCallback(() => setViewingPhase(null), []);
  const showNextPhase = useCallback(() => setViewingPhase(v => (v ? v + 1 : v)), []);
  const showPrevPhase = useCallback(() => setViewingPhase(v => (v && v > 1 ? v - 1 : v)), []);

  const allowedFirstClueCategories = useMemo(
    () => (dailyCategory ? DAILY_FIRST_CLUE_CATEGORIES[dailyCategory] : undefined),
    [dailyCategory]
  );

  const mappedWrongGuesses = useMemo(
    () => wrongGuesses.map(guess => ({
      guess,
      score: guessScores[guess] ?? null,
      phaseGuessed: guessPhases[guess] ?? 1,
    })),
    [wrongGuesses, guessScores, guessPhases]
  );

  return {
    gameState, hints, challengeType, phase, guesses, answer, rank, selectedCategory, error, challengeId,
    isThinking, wrongGuesses, guessScores, guessPhases, suggestedCorrection, pendingGuess, lastGuessResult,
    phase4Nudge, phase4Keywords, phase5Data, shouldShake, guessError, viewingPhase, expiresAt, isExpired,
    dailyCategory, mappedWrongGuesses, allowedFirstClueCategories,
    handleGuess, handleSelectCategory, handleExpired, handlePhaseClick, handleCloseModal,
    showNextPhase, showPrevPhase, acceptSuggestion, rejectSuggestion, giveUp,
  };
}
