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
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-in-out]">
      <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-neutral-200">
        {solved ? (
          <div className="space-y-6 text-center">
            {rank && (
              <div className={`inline-block px-8 py-3 bg-gradient-to-r ${rankColors[rank]} text-white rounded-full font-serif text-2xl font-bold shadow-md`}>
                {rank} Rank
              </div>
            )}
            <div>
              <p className="text-sm text-neutral-600 uppercase tracking-wider mb-2">The Answer</p>
              <h2 className="text-4xl font-serif font-bold text-neutral-900">{answer}</h2>
            </div>
            <p className="text-neutral-700">
              Solved in <span className="font-semibold text-gold">{guesses}</span> {guesses === 1 ? 'guess' : 'guesses'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="text-6xl">💭</div>
            <h2 className="text-2xl font-serif font-bold text-neutral-900">Almost there!</h2>
            <div>
              <p className="text-sm text-neutral-600 uppercase tracking-wider mb-2">The Answer Was</p>
              <p className="text-3xl font-serif font-semibold text-neutral-900">{answer}</p>
            </div>
            <p className="text-neutral-600">
              {guesses} {guesses === 1 ? 'guess' : 'guesses'} used
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-gold hover:text-neutral-900 transition-colors duration-200"
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
