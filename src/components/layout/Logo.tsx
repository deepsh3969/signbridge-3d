interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

export function Logo({ size = 32, withWordmark = true, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        role="img"
        aria-label="SignBridge 3D logo"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="sbLogoGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#sbLogoGrad)" />
        {/* stylised open hand */}
        <g fill="#fff">
          <rect x="14.5" y="20" width="4.2" height="14" rx="2.1" />
          <rect x="19.8" y="15.5" width="4.4" height="18.5" rx="2.2" />
          <rect x="25.3" y="17.5" width="4.3" height="16.5" rx="2.15" />
          <rect x="30.6" y="21.5" width="4" height="12.5" rx="2" />
          <path d="M13.6 25.4c-1.6-2.4-4-4.1-6.6-4.7-.8-.2-1.5.6-1.2 1.3 1.2 3.2 3.3 6.2 6 8.3l1.8-4.9z" />
          <rect x="14.5" y="31" width="20.1" height="7.5" rx="3.4" />
        </g>
        {/* bridge arc */}
        <path
          d="M9 41.5c9-4.6 21-4.6 30 0"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
      </svg>
      {withWordmark && (
        <span className="text-[1.05rem] font-extrabold tracking-tight text-ink dark:text-slate-50">
          SignBridge<span className="text-brand-600 dark:text-accent-400"> 3D</span>
        </span>
      )}
    </span>
  );
}

export default Logo;
