import React from 'react';

interface OrbiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  animate?: boolean;
}

export const OrbiLogo: React.FC<OrbiLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    sm: { box: 28, text: 'text-base font-bold' },
    md: { box: 38, text: 'text-xl font-extrabold' },
    lg: { box: 52, text: 'text-2xl font-black' },
    xl: { box: 72, text: 'text-3xl font-black' },
  };

  const current = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: current.box, height: current.box }}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-600/30 to-violet-500/30 blur-[6px]" />

        <svg
          viewBox="0 0 100 100"
          className={`w-full h-full relative z-10 ${animate ? 'transition-transform duration-700' : ''}`}
        >
          <defs>
            <linearGradient id="orbiGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
            <linearGradient id="orbiGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Outer Orbital Ring 1 */}
          <ellipse
            cx="50"
            cy="50"
            rx="42"
            ry="24"
            fill="none"
            stroke="url(#orbiGrad1)"
            strokeWidth="4"
            strokeDasharray="140 30"
            transform="rotate(-28 50 50)"
            className={animate ? 'animate-spin' : ''}
            style={{ animationDuration: '18s', animationTimingFunction: 'linear' }}
          />

          {/* Secondary Counter Orbital Ring */}
          <ellipse
            cx="50"
            cy="50"
            rx="40"
            ry="20"
            fill="none"
            stroke="url(#orbiGrad2)"
            strokeWidth="2.5"
            transform="rotate(35 50 50)"
            className={animate ? 'animate-spin' : ''}
            style={{ animationDuration: '24s', animationDirection: 'reverse', animationTimingFunction: 'linear' }}
          />

          {/* Core Central Dot (The User at the Center of Orbit) */}
          <circle cx="50" cy="50" r="9.5" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="14" fill="#6366F1" fillOpacity="0.35" />

          {/* Orbiting intelligent node */}
          <circle cx="82" cy="38" r="4.5" fill="#38BDF8" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`tracking-tight text-white ${current.text}`}>
              ORBI
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-indigo-500 to-purple-600 text-white uppercase tracking-wider">
              AI
            </span>
          </div>
          <span className="text-[9px] text-slate-400 font-medium tracking-wide mt-0.5">
            Equilíbrio Inteligente
          </span>
        </div>
      )}
    </div>
  );
};
