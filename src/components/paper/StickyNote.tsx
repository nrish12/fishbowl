import { PropsWithChildren, HTMLAttributes } from 'react';

interface StickyNoteProps extends HTMLAttributes<HTMLDivElement> {
  color?: 'yellow' | 'green' | 'blue' | 'pink';
  size?: 'sm' | 'md';
}

export default function StickyNote({
  children,
  color = 'yellow',
  size = 'sm',
  className = '',
  ...props
}: PropsWithChildren<StickyNoteProps>) {
  const colorClasses = {
    yellow: 'bg-gold-100 border-gold-300/40',
    green: 'bg-forest-50 border-forest-300/30',
    blue: 'bg-blue-50 border-blue-300/30',
    pink: 'bg-pink-50 border-pink-300/30',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
  };

  return (
    <div
      className={`inline-block rotate-[-0.5deg] rounded-lg border ${colorClasses[color]} ${sizeClasses[size]} shadow-[var(--shadow-sticky)] hover:-translate-y-0.5 hover:rotate-0 transition-all duration-200 ${className}`}
      {...props}
    >
      {/* Sticky note "tape" at top */}
      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-2 bg-white/40 rounded-sm" />

      <div className="relative font-medium text-ink-primary">{children}</div>
    </div>
  );
}
