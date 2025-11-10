import { PropsWithChildren, HTMLAttributes } from 'react';

interface PaperSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'lifted' | 'sticky';
  noPadding?: boolean;
}

export default function PaperSurface({
  children,
  variant = 'default',
  noPadding = false,
  className = '',
  ...props
}: PropsWithChildren<PaperSurfaceProps>) {
  const variantStyles = {
    default: 'bg-paper-cream border-forest-300/20',
    lifted: 'bg-paper-cream border-forest-400/30',
    sticky: 'bg-gold-100 border-gold-300/40',
  };

  const shadowStyles = {
    default: 'shadow-[var(--shadow-paper)]',
    lifted: 'shadow-[var(--shadow-lifted)]',
    sticky: 'shadow-[var(--shadow-sticky)]',
  };

  return (
    <div
      className={`relative rounded-2xl border-2 ${variantStyles[variant]} ${shadowStyles[variant]} paper-texture ${!noPadding ? 'p-6' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
