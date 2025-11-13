interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export default function Logo({ size = 'md', showTagline = false }: LogoProps) {
  const sizes = {
    sm: { img: 90, tagline: 'text-sm' },
    md: { img: 130, tagline: 'text-base' },
    lg: { img: 200, tagline: 'text-base' },
  };

  const current = sizes[size];

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex items-center justify-center" style={{ width: current.img, height: current.img }}>
        <img
          src="/Adobe Express - file.png"
          alt="Five Fold Logo"
          className="object-contain"
          style={{
            width: current.img,
            height: current.img,
            filter: 'brightness(0) saturate(100%) invert(56%) sepia(77%) saturate(446%) hue-rotate(6deg) brightness(95%) contrast(90%)',
          }}
        />
      </div>
      {showTagline && (
        <p className="text-xl text-forest/80 tracking-wide font-medium">
          Five clues. One answer.
        </p>
      )}
    </div>
  );
}
