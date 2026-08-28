import React from 'react';

interface EmblemProps {
  className?: string;
  size?: number | string;
}

/**
 * State Emblem of India (Lion Capital of Ashoka)
 * Government-grade SVG emblem designed for national portals.
 */
export const StateEmblemOfIndia: React.FC<EmblemProps> = ({
  className = 'w-10 h-10',
  size,
}) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 125"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="State Emblem of India"
      role="img"
    >
      {/* Outer subtle glow/circle for emblem backdrop */}
      <circle cx="50" cy="50" r="48" fill="currentColor" fillOpacity="0.04" />
      
      {/* Lion Capital Silhouette & Details */}
      {/* Central Lion Head & Crown */}
      <path
        d="M50 8C46 8 43 11 43 15C43 18 45 20 47 21C45 22 43 24 43 27C43 30 45 33 48 34C46 36 45 38 45 41C45 44 47 47 50 48C53 47 55 44 55 41C55 38 54 36 52 34C55 33 57 30 57 27C57 24 55 22 53 21C55 20 57 18 57 15C57 11 54 8 50 8Z"
        fill="currentColor"
      />
      {/* Left Lion Head */}
      <path
        d="M33 16C29 16 26 19 26 23C26 26 28 28 30 29C28 30 26 32 26 35C26 38 28 41 31 42C29 44 28 46 28 49C28 52 30 55 33 56C36 55 38 52 38 49C38 46 37 44 35 42C38 41 40 38 40 35C40 32 38 30 36 29C38 28 40 26 40 23C40 19 37 16 33 16Z"
        fill="currentColor"
      />
      {/* Right Lion Head */}
      <path
        d="M67 16C71 16 74 19 74 23C74 26 72 28 70 29C72 30 74 32 74 35C74 38 72 41 69 42C71 44 72 46 72 49C72 52 70 55 67 56C64 55 62 52 62 49C62 46 63 44 65 42C62 41 60 38 60 35C60 32 62 30 64 29C62 28 60 26 60 23C60 19 63 16 67 16Z"
        fill="currentColor"
      />

      {/* Mane & Chest Structure */}
      <path
        d="M36 50C32 54 30 60 30 66C35 68 42 69 50 69C58 69 65 68 70 66C70 60 68 54 64 50C60 53 55 54 50 54C45 54 40 53 36 50Z"
        fill="currentColor"
      />

      {/* Abacus Capital Top Border */}
      <rect x="22" y="70" width="56" height="4" rx="2" fill="currentColor" />

      {/* Ashoka Chakra in Center of Abacus */}
      <circle cx="50" cy="82" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="50" cy="82" r="2" fill="currentColor" />
      {/* Chakra Spokes */}
      <path
        d="M50 74V90M42 82H58M44.3 76.3L55.7 87.7M55.7 76.3L44.3 87.7M42.3 78.9L57.7 85.1M57.7 78.9L42.3 85.1M47.1 74.3L52.9 89.7M52.9 74.3L47.1 89.7"
        stroke="currentColor"
        strokeWidth="0.8"
      />

      {/* Left Bull / Motif Representation */}
      <path
        d="M26 78C26 76 28 75 30 75C33 75 35 77 35 80C35 84 31 87 27 88C29 86 31 84 31 82C29 82 26 81 26 78Z"
        fill="currentColor"
      />

      {/* Right Horse / Motif Representation */}
      <path
        d="M74 78C74 76 72 75 70 75C67 75 65 77 65 80C65 84 69 87 73 88C71 86 69 84 69 82C71 82 74 81 74 78Z"
        fill="currentColor"
      />

      {/* Abacus Bottom Pedestal Plinth */}
      <rect x="18" y="92" width="64" height="5" rx="2.5" fill="currentColor" />
      <rect x="24" y="98" width="52" height="3" rx="1.5" fill="currentColor" />

      {/* Devanagari Satyameva Jayate - सत्यमेव जयते representation */}
      <text
        x="50"
        y="114"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="800"
        fontFamily="sans-serif"
        fill="currentColor"
        letterSpacing="0.8"
      >
        सत्यमेव जयते
      </text>
    </svg>
  );
};

/**
 * National Informatics Centre (NIC) Official Branding Component
 */
export const NICBranding: React.FC<{ version?: string; className?: string }> = ({
  version = '2.1.0',
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Stylized NIC Logo Badge */}
      <div className="w-9 h-7 rounded-sm bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 flex items-center justify-center text-white font-black text-[11px] tracking-tight shadow-xs px-1">
        <span>NIC</span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200 leading-tight truncate">
          National Informatics Centre
        </p>
        <p className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">
          Government of India
        </p>
        <p className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
          Version {version}
        </p>
      </div>
    </div>
  );
};
