import { useState } from 'react';
import { trackEvent } from '../utils/tracking';
import { shareResults } from '../utils/shareResults';
import { Share2, Check, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ShareCardProps {
  rank: 'Gold' | 'Silver' | 'Bronze' | null;
  solved: boolean;
  answer: string;
  guesses: number;
  phase: number;
  shareUrl?: string;
  challengeId?: string;
  isDaily?: boolean;
}

export default function ShareCard({ rank, solved, answer, guesses, phase, shareUrl, challengeId, isDaily = false }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const rankColors = {
    Gold: 'from-yellow-400 to-yellow-600',
    Silver: 'from-gray-300 to-gray-500',
    Bronze: 'from-orange-400 to-orange-600',
  };

  const handleShare = async () => {
    const success = await shareResults(rank, solved, guesses, phase, isDaily, shareUrl);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (challengeId) {
        await trackEvent('share', challengeId, {
          share_method: navigator.share ? 'native' : 'clipboard',
          rank,
          solved,
        });
      }
    }
  };

  return (
    <div className="space-y-6 animate-paper-unfold">
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-br from-fold-indigo/20 to-fold-purple/20 rounded-3xl blur-xl" />
        <div className="relative bg-white rounded-3xl p-10 paper-shadow paper-texture border border-ink-200/30">
          <div className="absolute top-6 left-6 w-4 h-4 rounded-full bg-fold-indigo/20" />
          <div className="absolute top-6 right-6 w-4 h-4 rounded-full bg-fold-indigo/20" />
          <div className="absolute bottom-6 left-6 w-4 h-4 rounded-full bg-fold-indigo/20" />
          <div className="absolute bottom-6 right-6 w-4 h-4 rounded-full bg-fold-indigo/20" />
        {solved ? (
          <div className="space-y-6 text-center">
            {rank && (
              <div className={`inline-block px-10 py-4 bg-gradient-to-r ${rankColors[rank]} text-white rounded-full font-serif text-3xl font-bold shadow-xl relative`}>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent" />
                <span className="relative z-10">{rank} Rank</span>
              </div>
            )}
            <div>
              <p className="text-sm text-ink-300 uppercase tracking-wider font-bold mb-2">The Answer</p>
              <h2 className="text-5xl font-serif font-bold text-ink-500">{answer}</h2>
            </div>
            <p className="text-ink-400 text-lg">
              Solved in <span className="font-bold text-fold-indigo">{guesses}</span> {guesses === 1 ? 'guess' : 'guesses'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="text-6xl">💭</div>
            <h2 className="text-3xl font-serif font-bold text-ink-500">Almost there!</h2>
            <div>
              <p className="text-sm text-ink-300 uppercase tracking-wider font-bold mb-2">The Answer Was</p>
              <p className="text-4xl font-serif font-bold text-ink-500">{answer}</p>
            </div>
            <p className="text-ink-400 text-lg">
              {guesses} {guesses === 1 ? 'guess' : 'guesses'} used
            </p>
          </div>
        )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-fold-indigo to-fold-purple text-white rounded-full font-semibold hover:shadow-xl transition-all duration-200 transform hover:scale-105 paper-shadow"
        >
          {copied ? (
            <>
              <Check size={18} />
              Copied!
            </>
          ) : (
            <>
              {navigator.share ? <Share2 size={18} /> : <Copy size={18} />}
              {navigator.share ? 'Share Result' : 'Copy Result'}
            </>
          )}
        </button>
        <Link
          to="/"
          className="flex-1 flex items-center justify-center px-6 py-3 bg-neutral-100 text-neutral-900 rounded-full font-medium hover:bg-neutral-200 transition-colors duration-200"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}
