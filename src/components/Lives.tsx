import { Heart } from 'lucide-react';

interface LivesProps {
  current: number;
  total: number;
}

export default function Lives({ current, total }: LivesProps) {
  return (
    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full paper-shadow border border-ink-200/30">
      {Array.from({ length: total }).map((_, i) => (
        <Heart
          key={i}
          size={20}
          className={`${
            i < current
              ? 'fill-red-500 text-red-500 animate-pulse'
              : 'text-ink-200'
          } transition-all duration-300`}
        />
      ))}
    </div>
  );
}
