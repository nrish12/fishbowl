import { Layers } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: 'text-xl', tagline: 'text-xs' },
    md: { icon: 28, text: 'text-3xl', tagline: 'text-sm' },
    lg: { icon: 36, text: 'text-5xl', tagline: 'text-base' },
  };

  const current = sizes[size];

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Layers size={current.icon} className="text-gold" strokeWidth={2.5} />
        </div>
        <h1 className={`${current.text} font-serif font-bold tracking-tight text-neutral-900`}>
          ClueLadder
        </h1>
      </div>
      {showTagline && (
        <p className={`${current.tagline} text-neutral-600 mt-2 tracking-wide`}>
          Premium Daily Deduction
        </p>
      )}
    </div>
  );
}
