import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, AlertCircle } from 'lucide-react';
import Logo from '../components/Logo';
import PhaseChips from '../components/PhaseChips';
import SentenceCard from '../components/SentenceCard';
import { getSessionId, logPreview, trackEvent } from '../utils/tracking';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

type ChallengeType = 'person' | 'place' | 'thing';

interface ChallengeData {
  challenge_id: string;
  type: string;
  target: string;
  fame_score: number;
  phase1_options: string[][];
  phase2_options: string[];
  phase3: {
    geography: string;
    history: string;
    culture: string;
    stats: string;
    visual: string;
  };
  aliases: string[];
}

interface ErrorResponse {
  error: string;
  reason?: string;
  suggestion?: string;
}

export default function CreateChallenge() {
  const [type, setType] = useState<ChallengeType>('person');
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [challengeData, setChallengeData] = useState<ChallengeData | null>(null);
  const [selectedPhase1, setSelectedPhase1] = useState(0);
  const [selectedPhase2, setSelectedPhase2] = useState(0);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [difficultyReasoning, setDifficultyReasoning] = useState<string>('');

  const handleGenerate = async () => {
    if (!target.trim()) {
      setError({ error: 'Please enter a person, place, or thing' });
      return;
    }

    setLoading(true);
    setError(null);
    setChallengeData(null);
    setShareUrl(null);
    setSelectedPhase1(0);
    setSelectedPhase2(0);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/create-challenge-fast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, target: target.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 503) {
          setError({
            error: 'Service Temporarily Unavailable',
            reason: data.reason || 'The AI service is currently unavailable. Please try again in a few moments.',
          });
        } else {
          setError({
            error: data.error || 'Challenge Rejected',
            reason: data.reason,
            suggestion: data.suggestion,
          });
        }
        return;
      }

      setChallengeData(data);

      logPreview(
        data.type,
        target.trim(),
        data.phase1_options,
        data.phase2_options,
        data.phase3,
        data.aliases
      ).then(pvId => {
        setPreviewId(pvId);
      }).catch(err => {
        console.error('Preview logging failed:', err);
      });
    } catch (err: any) {
      setError({
        error: 'Connection Error',
        reason: 'Unable to connect to the server. Please check your internet connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function selectOptimalDifficulty() {
      if (!challengeData) return;

      try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/suggest-difficulty`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: challengeData.type,
            fame_score: challengeData.fame_score,
          }),
        });

        if (response.ok) {
          const suggestion = await response.json();
          setSelectedPhase1(suggestion.recommended_phase1_index);
          setSelectedPhase2(suggestion.recommended_phase2_index);
          setDifficultyReasoning(suggestion.reasoning);

          console.log('AI-selected difficulty:', suggestion);
        }
      } catch (error) {
        console.warn('Failed to get difficulty suggestion:', error);
      }
    }

    selectOptimalDifficulty();
  }, [challengeData]);

  const handleFinalize = async () => {
    if (!challengeData) return;

    setFinalizing(true);
    setError(null);

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/finalize-challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          challenge_id: challengeData.challenge_id,
          type: challengeData.type,
          target: challengeData.target,
          fame_score: challengeData.fame_score,
          phase1: challengeData.phase1_options[selectedPhase1],
          phase2: challengeData.phase2_options[selectedPhase2],
          phase3: challengeData.phase3,
          aliases: challengeData.aliases,
          session_id: getSessionId(),
          preview_id: previewId,
          selected_phase1_index: selectedPhase1,
          selected_phase2_index: selectedPhase2,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError({
          error: data.error || 'Failed to finalize challenge',
          reason: data.reason,
        });
        return;
      }

      const url = `${window.location.origin}/play?t=${data.token}`;
      setShareUrl(url);
    } catch (err: any) {
      setError({
        error: 'Connection Error',
        reason: 'Unable to connect to the server. Please check your internet connection and try again.',
      });
    } finally {
      setFinalizing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl || !challengeData) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      await trackEvent('share', challengeData.challenge_id, {
        share_method: 'clipboard',
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 py-8 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors">
            <ArrowLeft size={20} />
            <span>Back</span>
          </Link>
          <Logo size="sm" />
          <div className="w-20" />
        </div>

        <div className="text-center space-y-3">
          <h1 className="text-4xl font-serif font-bold text-neutral-900">Create Challenge</h1>
          <p className="text-neutral-600 max-w-xl mx-auto">
            Choose a famous person, place, or thing. AI will validate and create hints for your custom challenge.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-200 space-y-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Type</span>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {(['person', 'place', 'thing'] as ChallengeType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                      type === t
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                    }`}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-neutral-700 uppercase tracking-wider">Target</span>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder={`e.g., ${type === 'person' ? 'Albert Einstein' : type === 'place' ? 'Eiffel Tower' : 'Mona Lisa'}`}
                className="w-full mt-2 px-4 py-3 border-2 border-neutral-200 rounded-lg focus:border-gold focus:outline-none transition-colors"
                disabled={loading}
              />
            </label>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-semibold text-red-900">{error.error}</p>
                {error.reason && (
                  <p className="text-sm text-red-700">{error.reason}</p>
                )}
                {error.suggestion && (
                  <div className="mt-3 pt-3 border-t border-red-200">
                    <p className="text-sm font-medium text-red-900 mb-1">Suggestion:</p>
                    <p className="text-sm text-red-700">{error.suggestion}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !target.trim()}
            className="w-full px-6 py-4 bg-neutral-900 text-white rounded-full font-semibold text-lg hover:bg-gold hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Validating & Generating...
              </>
            ) : (
              'Generate Challenge'
            )}
          </button>
        </div>

        {challengeData && !shareUrl && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-in-out]">
            <div className="text-center">
              <h2 className="text-2xl font-serif font-bold text-neutral-900">Customize Your Challenge</h2>
              <p className="text-sm text-neutral-600 mt-1">Choose the difficulty level for each phase</p>
            </div>

            {difficultyReasoning && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="text-blue-900">
                  <span className="font-semibold">AI Recommendation:</span> {difficultyReasoning}
                </p>
                <p className="text-blue-700 text-xs mt-1">
                  You can still change the difficulty if you prefer.
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-neutral-200 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-700">Phase 1 - Five Words</h3>
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">Select Difficulty</span>
                </div>
                <div className="space-y-3">
                  {challengeData.phase1_options.map((words, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhase1(index)}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedPhase1 === index
                          ? 'border-gold bg-gold/5'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          {index === 0 ? 'Easier' : index === 1 ? 'Medium' : 'Harder'}
                        </span>
                        {selectedPhase1 === index && (
                          <Check className="text-gold" size={16} />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {words.map((word, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-neutral-100 rounded-full text-sm font-medium text-neutral-900"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-700">Phase 2 - One Sentence</h3>
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">Select Difficulty</span>
                </div>
                <div className="space-y-3">
                  {challengeData.phase2_options.map((sentence, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedPhase2(index)}
                      className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedPhase2 === index
                          ? 'border-gold bg-gold/5'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          {index === 0 ? 'Easier' : index === 1 ? 'Medium' : 'Harder'}
                        </span>
                        {selectedPhase2 === index && (
                          <Check className="text-gold" size={16} />
                        )}
                      </div>
                      <p className="text-sm text-neutral-700 leading-relaxed">{sentence}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-neutral-700 text-center">Phase 3 - Categories</h3>
                <p className="text-xs text-neutral-500 text-center">These categories are fixed and cannot be changed</p>
                <div className="grid gap-3">
                  {Object.entries(challengeData.phase3).map(([key, value]) => (
                    <div key={key} className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <span className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">{key}</span>
                      <p className="text-sm text-neutral-700 mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleFinalize}
                disabled={finalizing}
                className="w-full px-6 py-4 bg-neutral-900 text-white rounded-full font-semibold text-lg hover:bg-gold hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {finalizing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Finalizing Challenge...
                  </>
                ) : (
                  'Create Challenge'
                )}
              </button>
            </div>
          </div>
        )}

        {shareUrl && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gold space-y-4">
            <div className="text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <h3 className="text-2xl font-serif font-bold text-neutral-900">Challenge Ready!</h3>
              <p className="text-neutral-600">Share this link with friends</p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-neutral-700 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-6 py-2 bg-neutral-900 text-white rounded-full font-medium hover:bg-gold hover:text-neutral-900 transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  'Copy Link'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
