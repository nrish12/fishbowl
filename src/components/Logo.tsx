interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const sizes = {
    sm: { img: 90, tagline: 'text-sm' },
    md: { img: 130, tagline: 'text-base' },
    lg: { img: 240, tagline: 'text-lg' },
  };

  const current = sizes[size];

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src="/Adobe Express - file.png"
        alt="Five Fold Logo"
        style={{ width: current.img, height: current.img }}
        className="object-contain"
      />
      {showTagline && (
        <p className={`${current.tagline} text-forest/70 tracking-wide font-medium`}>
          Unlock the mystery in 5 clues
        </p>
      )}
    </div>
  );
}
