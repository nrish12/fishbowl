interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const sizes = {
    sm: { img: 60, tagline: 'text-xs' },
    md: { img: 90, tagline: 'text-sm' },
    lg: { img: 140, tagline: 'text-base' },
  };

  const current = sizes[size];

  return (
    <div className="flex flex-col items-center">
      <img
        src="/Adobe Express - file.png"
        alt="Five Fold Logo"
        style={{ width: current.img, height: current.img }}
        className="object-contain"
      />
      {showTagline && (
        <p className={`${current.tagline} text-forest/70 mt-3 tracking-wide`}>
          Unlock the mystery in 5 clues
        </p>
      )}
    </div>
  );
}
