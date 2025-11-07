interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const sizes = {
    sm: { img: 50, text: 'text-xl', tagline: 'text-xs' },
    md: { img: 70, text: 'text-3xl', tagline: 'text-sm' },
    lg: { img: 100, text: 'text-5xl', tagline: 'text-base' },
  };

  const current = sizes[size];

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-3">
        <div
          style={{
            width: current.img,
            height: current.img,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src="/ChatGPT Image Nov 7, 2025, 12_41_34 PM.png"
            alt="Five Fold Logo"
            style={{
              width: current.img * 1.8,
              height: current.img * 1.8,
              objectFit: 'cover',
              objectPosition: '50% 30%'
            }}
          />
        </div>
        <h1 className={`${current.text} font-serif font-bold tracking-tight text-forest`}>
          Five Fold
        </h1>
      </div>
      {showTagline && (
        <p className={`${current.tagline} text-forest/70 mt-2 tracking-wide`}>
          Unlock the mystery in 5 clues
        </p>
      )}
    </div>
  );
}
