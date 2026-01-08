import { useState } from 'react';
import { motion } from 'framer-motion';
import { trackEvent } from '../utils/tracking';
import { shareResults } from '../utils/shareResults';
import { Share2, Check, Copy, Sparkles, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import EnvelopePanel from './paper/EnvelopePanel';
import StickyNote from './paper/StickyNote';

interface ShareCardProps {
  rank: 'Gold' | 'Silver' | 'Bronze' | null;
  solved: boolean;
  answer: string;
  guesses: number;
  phase: number;
  shareUrl?: string;
  challengeId?: string;
  isDaily?: boolean;
  category?: string | null;
}

export default function ShareCard({ rank, solved, answer, guesses, phase, shareUrl, challengeId, isDaily = false, category }: ShareCardProps) {
  const [copied, setCopied] = useState(false);

  const rankConfig = {
    Gold: {
      gradient: 'from-gold-500 to-gold-700',
      shadow: 'shadow-gold-500/40',
      emoji: '🥇',
    },
    Silver: {
      gradient: 'from-gray-300 to-gray-500',
      shadow: 'shadow-gray-500/40',
      emoji: '🥈',
    },
    Bronze: {
      gradient: 'from-amber-600 to-amber-800',
      shadow: 'shadow-amber-600/40',
      emoji: '🥉',
    },
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
          category,
        });
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-6"
    >
      <EnvelopePanel title={solved ? "🎉 You Solved It!" : "💭 So Close!"} delay={0.2}>
        <div className="space-y-8">
          {solved && rank && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: 'spring', bounce: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="text-6xl">{rankConfig[rank].emoji}</div>
              <div className={`inline-block px-8 py-3 bg-gradient-to-r ${rankConfig[rank].gradient} text-white rounded-full font-serif text-2xl font-bold shadow-xl ${rankConfig[rank].shadow}`}>
                <span className="relative z-10">{rank} Rank</span>
              </div>
            </motion.div>
          )}

          <div className="text-center space-y-3">
            <p className="text-xs text-forest-600 uppercase tracking-[0.2em] font-bold">
              {solved ? 'The Answer Was' : 'You Were Looking For'}
            </p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-4xl md:text-5xl font-serif font-bold text-forest-800"
            >
              {answer}
            </motion.h2>
          </div>

          <div className="flex justify-center gap-3 flex-wrap">
            <StickyNote color="yellow" size="md">
              <div className="text-center">
                <div className="text-2xl font-bold text-forest-800">{guesses}</div>
                <div className="text-xs text-ink-muted">{guesses === 1 ? 'guess' : 'guesses'}</div>
              </div>
            </StickyNote>

            <StickyNote color="green" size="md">
              <div className="text-center">
                <div className="text-2xl font-bold text-forest-800">{phase}</div>
                <div className="text-xs text-ink-muted">phase{phase !== 1 ? 's' : ''}</div>
              </div>
            </StickyNote>

            {rank && (
              <StickyNote color={rank === 'Gold' ? 'yellow' : 'blue'} size="md">
                <div className="text-center">
                  <div className="text-2xl font-bold text-forest-800">{rankConfig[rank].emoji}</div>
                  <div className="text-xs text-ink-muted">{rank}</div>
                </div>
              </StickyNote>
            )}
          </div>

          {!solved && (
            <p className="text-sm text-center text-ink-muted leading-relaxed">
              Great effort! Every guess brings you closer to mastering the game.
            </p>
          )}
        </div>
      </EnvelopePanel>

      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          onClick={handleShare}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-forest-600 to-forest-700 text-gold-50 rounded-2xl font-bold hover:shadow-xl transition-all duration-200 shadow-lg"
        >
          {copied ? (
            <>
              <Check size={20} />
              Copied to Clipboard!
            </>
          ) : (
            <>
              {navigator.share ? <Share2 size={20} /> : <Copy size={20} />}
              {navigator.share ? 'Share Result' : 'Copy Result'}
            </>
          )}
        </motion.button>

        <Link to="/" className="flex-1">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-paper-cream border-2 border-forest-300/30 text-forest-800 rounded-2xl font-bold hover:bg-paper-200 transition-all duration-200 shadow-md h-full"
          >
            <Home size={20} />
            Back Home
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
