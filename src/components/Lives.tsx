import { Heart } from 'lucide-react';

interface LivesProps {
  current: number;
  total: number;
}

export default function Lives({ current, total }: LivesProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <Heart
          key={i}
          size={20}
          className={`${
            i < current
              ? 'fill-red-500 text-red-500'
              : 'text-neutral-300'
          } transition-all duration-300`}
        />
      ))}
    </div>
  );
}
