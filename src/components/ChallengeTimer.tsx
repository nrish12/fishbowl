import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface ChallengeTimerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export function ChallengeTimer({ expiresAt, onExpired }: ChallengeTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'critical'>('normal');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        onExpired?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours < 1) {
        setUrgency('critical');
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else if (hours < 3) {
        setUrgency('warning');
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setUrgency('normal');
        setTimeLeft(`${hours}h ${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const colors = {
    normal: 'text-green-700 bg-green-50 border-green-200',
    warning: 'text-orange-700 bg-orange-50 border-orange-200',
    critical: 'text-red-700 bg-red-50 border-red-200 animate-pulse',
  };

  const iconColors = {
    normal: 'text-green-600',
    warning: 'text-orange-600',
    critical: 'text-red-600',
  };

  if (isExpired) {
    return null;
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colors[urgency]} font-medium text-sm`}>
      <Clock className={`w-4 h-4 ${iconColors[urgency]}`} />
      <span>{timeLeft} left</span>
    </div>
  );
}
