interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  loading?: boolean;
}

export default function Logo({ size = 'md', showTagline = false, loading = false }: LogoProps) {
  const sizes = {
    sm: { width: 160, height: 50, tagline: 'text-sm' },
    md: { width: 200, height: 62, tagline: 'text-base' },
    lg: { width: 256, height: 80, tagline: 'text-lg' },
    xl: { width: 320, height: 100, tagline: 'text-xl' },
  };

  const current = sizes[size];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex items-center justify-center">
          <img
            src="/mystle-loading-animation.svg"
            alt="Mystle Loading"
            style={{ width: 100, height: 80 }}
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center">
        <img
          src="/mystle-logo-v3.svg"
          alt="Mystle Logo"
          className="object-contain"
          style={{ width: current.width, height: current.height }}
        />
      </div>
      {showTagline && (
        <p className={`${current.tagline} text-forest-600 tracking-wide font-semibold`}>
          Solve the Daily Mystery Puzzle
        </p>
      )}
    </div>
  );
}
