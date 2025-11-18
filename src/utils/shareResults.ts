export function generateShareText(
  rank: 'Gold' | 'Silver' | 'Bronze' | null,
  solved: boolean,
  guesses: number,
  phase: number,
  isDaily: boolean = false
): string {
  const date = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const rankEmoji = rank === 'Gold' ? '🥇' : rank === 'Silver' ? '🥈' : rank === 'Bronze' ? '🥉' : '❌';
  const phaseSquares = ['🟨', '🟧', '🟥'];
  const progressBar = phaseSquares.slice(0, phase).join('') + '⬜'.repeat(3 - phase);

  if (!solved) {
    return `🎯 ClueLadder ${isDaily ? date : 'Custom'}

❌ Unsolved
${progressBar}
${guesses} ${guesses === 1 ? 'guess' : 'guesses'}

Can you solve it?
${window.location.origin}`;
  }

  return `🎯 ClueLadder ${isDaily ? date : 'Custom'}

${rankEmoji} ${rank} Rank
${progressBar}
Phase ${phase} | ${guesses} ${guesses === 1 ? 'guess' : 'guesses'}

${window.location.origin}`;
}

export async function shareResults(
  rank: 'Gold' | 'Silver' | 'Bronze' | null,
  solved: boolean,
  guesses: number,
  phase: number,
  isDaily: boolean = false,
  shareUrl?: string
): Promise<boolean> {
  const shareText = generateShareText(rank, solved, guesses, phase, isDaily);

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'ClueLadder Results',
        text: shareText,
        url: shareUrl || window.location.origin,
      });
      return true;
    } catch (error) {
      // User cancelled share
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    return true;
  } catch (error) {
    return false;
  }
}
