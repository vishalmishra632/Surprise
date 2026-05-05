import type { LandmarkKind } from '../types';

/**
 * Each chapter's monument is drawn as a flat-illustration SVG with
 * multiple colors (sandstone for India Gate, white + gold for the City
 * Palace, red + gold for the wedding mandap, peach + gold for Varanasi).
 * Abstract concepts — home, ring, two-hearts, infinity — are rendered as
 * Twemoji so they read as universal icons rather than custom drawings.
 */

const TWEMOJI_BASE = 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/';

function TwemojiIcon({ code, alt }: { code: string; alt: string }) {
  return (
    <img
      src={`${TWEMOJI_BASE}${code}.svg`}
      alt={alt}
      width={200}
      height={200}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}

function IndiaGate() {
  return (
    <svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="240" width="200" height="10" fill="#a07840" opacity="0.3" />
      <rect x="6" y="220" width="188" height="20" fill="#a07840" />
      <rect x="14" y="206" width="172" height="14" fill="#c89854" />
      <rect x="20" y="74" width="160" height="132" fill="#d4a06a" />
      <path d="M 70 206 V 130 Q 70 96 100 96 Q 130 96 130 130 V 206 Z" fill="#fbd9cb" />
      <path
        d="M 76 206 V 132 Q 76 104 100 104 Q 124 104 124 132 V 206 Z"
        fill="#e8a8b9"
        opacity="0.45"
      />
      <circle cx="48" cy="125" r="6" fill="#a07840" />
      <circle cx="48" cy="125" r="3" fill="#d4af37" />
      <circle cx="152" cy="125" r="6" fill="#a07840" />
      <circle cx="152" cy="125" r="3" fill="#d4af37" />
      <rect x="26" y="148" width="32" height="44" fill="#c89854" />
      <rect x="142" y="148" width="32" height="44" fill="#c89854" />
      <g stroke="#7a5230" strokeWidth="1" opacity="0.5">
        <line x1="32" y1="158" x2="52" y2="158" />
        <line x1="32" y1="168" x2="52" y2="168" />
        <line x1="32" y1="178" x2="52" y2="178" />
        <line x1="148" y1="158" x2="168" y2="158" />
        <line x1="148" y1="168" x2="168" y2="168" />
        <line x1="148" y1="178" x2="168" y2="178" />
      </g>
      <rect x="14" y="62" width="172" height="14" fill="#c89854" />
      <rect x="20" y="58" width="160" height="6" fill="#a07840" />
      <rect x="40" y="44" width="120" height="14" fill="#d4a06a" />
      <rect x="60" y="32" width="80" height="12" fill="#c89854" />
      <rect x="80" y="20" width="40" height="12" fill="#a07840" />
      <ellipse cx="100" cy="14" rx="14" ry="6" fill="#c89854" />
      <rect x="96" y="6" width="8" height="8" fill="#a07840" />
      <circle cx="100" cy="6" r="5" fill="#d4af37" />
      <rect x="20" y="74" width="3" height="132" fill="#e8c896" opacity="0.7" />
      <rect x="174" y="74" width="6" height="132" fill="#a07840" opacity="0.5" />
    </svg>
  );
}

function CityPalace() {
  return (
    <svg viewBox="0 0 280 200" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="190" width="280" height="10" fill="#5a8aa0" opacity="0.4" />
      <rect x="10" y="100" width="260" height="92" fill="#fff8ec" />
      <rect x="10" y="92" width="260" height="10" fill="#e8d8c0" />
      <rect x="14" y="86" width="252" height="6" fill="#d4af37" />
      <g fill="#5a8aa0">
        <path d="M 26 188 V 130 Q 26 116 40 116 Q 54 116 54 130 V 188 Z" />
        <path d="M 70 188 V 130 Q 70 116 84 116 Q 98 116 98 130 V 188 Z" />
        <path d="M 114 188 V 130 Q 114 116 128 116 Q 142 116 142 130 V 188 Z" />
        <path d="M 158 188 V 130 Q 158 116 172 116 Q 186 116 186 130 V 188 Z" />
        <path d="M 202 188 V 130 Q 202 116 216 116 Q 230 116 230 130 V 188 Z" />
        <path d="M 246 188 V 130 Q 246 116 260 116 Q 268 116 268 130 V 188 Z" />
      </g>
      <g fill="none" stroke="#d4af37" strokeWidth="1.5">
        <path d="M 26 130 Q 26 116 40 116 Q 54 116 54 130" />
        <path d="M 70 130 Q 70 116 84 116 Q 98 116 98 130" />
        <path d="M 114 130 Q 114 116 128 116 Q 142 116 142 130" />
        <path d="M 158 130 Q 158 116 172 116 Q 186 116 186 130" />
        <path d="M 202 130 Q 202 116 216 116 Q 230 116 230 130" />
      </g>
      <rect x="120" y="58" width="40" height="28" fill="#fff8ec" />
      <rect x="116" y="56" width="48" height="6" fill="#d4af37" />
      <path d="M 120 56 Q 110 36 140 28 Q 170 36 160 56 Z" fill="#d4af37" />
      <ellipse cx="140" cy="56" rx="20" ry="4" fill="#a07840" />
      <rect x="138" y="14" width="4" height="14" fill="#a07840" />
      <circle cx="140" cy="12" r="4" fill="#d4af37" />
      <rect x="44" y="74" width="28" height="14" fill="#fff8ec" />
      <rect x="40" y="72" width="36" height="4" fill="#d4af37" />
      <path d="M 44 72 Q 38 56 58 50 Q 78 56 72 72 Z" fill="#d4af37" />
      <ellipse cx="58" cy="72" rx="14" ry="3" fill="#a07840" />
      <rect x="56" y="40" width="4" height="10" fill="#a07840" />
      <circle cx="58" cy="38" r="3" fill="#d4af37" />
      <rect x="208" y="74" width="28" height="14" fill="#fff8ec" />
      <rect x="204" y="72" width="36" height="4" fill="#d4af37" />
      <path d="M 208 72 Q 202 56 222 50 Q 242 56 236 72 Z" fill="#d4af37" />
      <ellipse cx="222" cy="72" rx="14" ry="3" fill="#a07840" />
      <rect x="220" y="40" width="4" height="10" fill="#a07840" />
      <circle cx="222" cy="38" r="3" fill="#d4af37" />
      <rect x="10" y="100" width="3" height="92" fill="#fff" opacity="0.8" />
    </svg>
  );
}

function Mandap() {
  return (
    <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="210" width="220" height="10" fill="#7a2828" opacity="0.4" />
      <rect x="14" y="186" width="192" height="22" fill="#a83838" />
      <rect x="20" y="178" width="180" height="8" fill="#7a2828" />
      <rect x="40" y="100" width="14" height="78" fill="#fff8ec" />
      <rect x="76" y="100" width="14" height="78" fill="#fff8ec" />
      <rect x="130" y="100" width="14" height="78" fill="#fff8ec" />
      <rect x="166" y="100" width="14" height="78" fill="#fff8ec" />
      <rect x="38" y="100" width="18" height="6" fill="#d4af37" />
      <rect x="74" y="100" width="18" height="6" fill="#d4af37" />
      <rect x="128" y="100" width="18" height="6" fill="#d4af37" />
      <rect x="164" y="100" width="18" height="6" fill="#d4af37" />
      <rect x="38" y="172" width="18" height="6" fill="#d4af37" />
      <rect x="74" y="172" width="18" height="6" fill="#d4af37" />
      <rect x="128" y="172" width="18" height="6" fill="#d4af37" />
      <rect x="164" y="172" width="18" height="6" fill="#d4af37" />
      <rect x="14" y="92" width="192" height="14" fill="#d4af37" />
      <path d="M 30 92 Q 110 8 190 92 Z" fill="#a83838" />
      <path d="M 30 92 Q 110 8 190 92" fill="none" stroke="#d4af37" strokeWidth="3" />
      <path d="M 60 90 Q 110 30 160 90" fill="#c44848" stroke="none" />
      <rect x="106" y="22" width="8" height="10" fill="#7a2828" />
      <path d="M 102 22 L 110 8 L 118 22 Z" fill="#d4af37" />
      <circle cx="110" cy="6" r="4" fill="#d4af37" />
      <g fill="#e8a8b9">
        <circle cx="50" cy="100" r="3.5" />
        <circle cx="80" cy="100" r="3.5" />
        <circle cx="110" cy="100" r="3.5" />
        <circle cx="140" cy="100" r="3.5" />
        <circle cx="170" cy="100" r="3.5" />
      </g>
      <g fill="#fff" opacity="0.7">
        <circle cx="50" cy="100" r="1.5" />
        <circle cx="80" cy="100" r="1.5" />
        <circle cx="110" cy="100" r="1.5" />
        <circle cx="140" cy="100" r="1.5" />
        <circle cx="170" cy="100" r="1.5" />
      </g>
    </svg>
  );
}

function Ghat() {
  return (
    <svg viewBox="0 0 280 210" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="200" width="280" height="10" fill="#5a8aa0" opacity="0.6" />
      <rect x="0" y="184" width="280" height="16" fill="#d97560" />
      <rect x="20" y="168" width="240" height="16" fill="#c46555" />
      <rect x="40" y="152" width="200" height="16" fill="#b25a4a" />
      <rect x="60" y="136" width="160" height="16" fill="#a04f3f" />
      <rect x="100" y="108" width="80" height="28" fill="#e8c896" />
      <rect x="100" y="102" width="80" height="6" fill="#c89854" />
      <g fill="#5a3520">
        <path d="M 110 136 V 120 Q 110 114 116 114 Q 122 114 122 120 V 136 Z" />
        <path d="M 134 136 V 120 Q 134 114 140 114 Q 146 114 146 120 V 136 Z" />
        <path d="M 158 136 V 120 Q 158 114 164 114 Q 170 114 170 120 V 136 Z" />
      </g>
      <path d="M 102 102 L 130 36 L 150 36 L 178 102 Z" fill="#e8a87c" />
      <path d="M 102 102 L 130 36 L 130 102 Z" fill="#c89854" opacity="0.5" />
      <g fill="#a05030">
        <rect x="116" y="64" width="48" height="2" />
        <rect x="120" y="76" width="40" height="2" />
        <rect x="124" y="86" width="32" height="2" />
      </g>
      <ellipse cx="140" cy="36" rx="16" ry="3" fill="#c89854" />
      <rect x="135" y="22" width="10" height="14" fill="#d4af37" />
      <rect x="138" y="14" width="4" height="8" fill="#a07840" />
      <circle cx="140" cy="10" r="4" fill="#d4af37" />
      <g fill="#d4af37">
        <circle cx="40" cy="176" r="2" />
        <circle cx="80" cy="160" r="2" />
        <circle cx="200" cy="160" r="2" />
        <circle cx="240" cy="176" r="2" />
      </g>
    </svg>
  );
}

function Mahakal() {
  /* Mahakaleshwar Jyotirlinga, Ujjain — north-Indian shikhara temple,
     gold finial + trident, lamp-lit base. Saffron + ivory + gold to
     read as Shiva's seat without leaning kitsch. */
  return (
    <svg viewBox="0 0 240 260" xmlns="http://www.w3.org/2000/svg">
      {/* ground shadow */}
      <rect x="0" y="248" width="240" height="12" fill="#7a4a2a" opacity="0.35" />
      {/* base platform */}
      <rect x="14" y="220" width="212" height="28" fill="#c89854" />
      <rect x="22" y="212" width="196" height="10" fill="#a07840" />
      <rect x="28" y="208" width="184" height="6" fill="#d4a06a" />
      {/* sanctum walls */}
      <rect x="50" y="148" width="140" height="64" fill="#fbeed5" />
      <rect x="50" y="148" width="140" height="6" fill="#d4af37" />
      {/* sanctum doorway, arched */}
      <path
        d="M 100 212 V 178 Q 100 166 120 166 Q 140 166 140 178 V 212 Z"
        fill="#7a3018"
      />
      <path
        d="M 104 212 V 180 Q 104 170 120 170 Q 136 170 136 180 V 212 Z"
        fill="#a8451f"
        opacity="0.55"
      />
      {/* OM medallion above the doorway */}
      <circle cx="120" cy="160" r="6" fill="#d4af37" />
      <text
        x="120"
        y="163.5"
        textAnchor="middle"
        fontSize="9"
        fontFamily="serif"
        fill="#7a3018"
      >ॐ</text>
      {/* side niches */}
      <rect x="62" y="170" width="22" height="34" fill="#e8c896" />
      <rect x="156" y="170" width="22" height="34" fill="#e8c896" />
      <path d="M 62 170 Q 62 160 73 160 Q 84 160 84 170 Z" fill="#d4af37" opacity="0.6" />
      <path d="M 156 170 Q 156 160 167 160 Q 178 160 178 170 Z" fill="#d4af37" opacity="0.6" />
      {/* main shikhara — curved tower stepping up to a finial */}
      <path
        d="M 60 148 L 64 130 L 70 112 L 78 94 L 88 76 L 100 60 L 110 48
           L 120 38 L 130 48 L 140 60 L 152 76 L 162 94 L 170 112
           L 176 130 L 180 148 Z"
        fill="#fbeed5"
        stroke="#d4af37"
        strokeWidth="1.2"
      />
      {/* shikhara horizontal striations — give it stone texture */}
      <g stroke="#c89854" strokeWidth="1" opacity="0.55" fill="none">
        <path d="M 64 132 Q 120 124 176 132" />
        <path d="M 70 116 Q 120 108 170 116" />
        <path d="M 78 98 Q 120 92 162 98" />
        <path d="M 88 80 Q 120 76 152 80" />
        <path d="M 100 64 Q 120 60 140 64" />
      </g>
      {/* shikhara saffron mid-band — Shiva's color */}
      <path
        d="M 78 96 L 88 78 L 100 62 L 110 50 L 120 40 L 130 50 L 140 62 L 152 78 L 162 96 L 152 96 L 144 86 L 130 70 L 120 58 L 110 70 L 96 86 L 88 96 Z"
        fill="#e8a04a"
        opacity="0.85"
      />
      {/* amalaka (ribbed disc) below finial */}
      <ellipse cx="120" cy="38" rx="14" ry="4" fill="#c89854" />
      <ellipse cx="120" cy="36" rx="14" ry="3" fill="#a07840" />
      {/* kalash + trident finial */}
      <rect x="116" y="22" width="8" height="14" fill="#d4af37" />
      <ellipse cx="120" cy="22" rx="6" ry="3" fill="#fff8ec" stroke="#d4af37" strokeWidth="0.8" />
      {/* trishul (trident) on top */}
      <line x1="120" y1="22" x2="120" y2="6" stroke="#d4af37" strokeWidth="2" />
      <path
        d="M 112 8 L 120 18 L 128 8"
        fill="none"
        stroke="#d4af37"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line x1="112" y1="8" x2="112" y2="2" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
      <line x1="120" y1="6" x2="120" y2="0" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
      <line x1="128" y1="8" x2="128" y2="2" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" />
      {/* small flanking sub-shikharas */}
      <path
        d="M 32 212 L 34 192 L 38 174 L 42 158 L 46 174 L 50 192 L 52 212 Z"
        fill="#fbeed5"
        stroke="#d4af37"
        strokeWidth="1"
      />
      <path
        d="M 188 212 L 190 192 L 194 174 L 198 158 L 202 174 L 206 192 L 208 212 Z"
        fill="#fbeed5"
        stroke="#d4af37"
        strokeWidth="1"
      />
      <rect x="40" y="156" width="4" height="3" fill="#d4af37" />
      <rect x="196" y="156" width="4" height="3" fill="#d4af37" />
      {/* lamp diyas at the base */}
      <g fill="#d4af37">
        <ellipse cx="38" cy="234" rx="5" ry="2.5" />
        <ellipse cx="202" cy="234" rx="5" ry="2.5" />
      </g>
      <g fill="#ff9a3a">
        <path d="M 38 226 Q 36 230 38 234 Q 40 230 38 226 Z" />
        <path d="M 202 226 Q 200 230 202 234 Q 204 230 202 226 Z" />
      </g>
      {/* highlight on left edge of sanctum, like the others */}
      <rect x="50" y="148" width="3" height="64" fill="#fff" opacity="0.7" />
    </svg>
  );
}

const HAND_DRAWN: Partial<Record<LandmarkKind, () => JSX.Element>> = {
  'india-gate': IndiaGate,
  'city-palace': CityPalace,
  mandap: Mandap,
  ghat: Ghat,
  mahakal: Mahakal,
};

const TWEMOJI: Partial<Record<LandmarkKind, { code: string; alt: string }>> = {
  ring: { code: '1f48d', alt: 'Ring' },
  rings: { code: '1f495', alt: 'Two hearts' },
  infinity: { code: '267e', alt: 'Infinity' },
  home: { code: '1f3e0', alt: 'Home' },
};

export function LandmarkSvg({ kind }: { kind: LandmarkKind }) {
  const Hand = HAND_DRAWN[kind];
  if (Hand) return <Hand />;
  const emoji = TWEMOJI[kind];
  if (emoji) return <TwemojiIcon code={emoji.code} alt={emoji.alt} />;
  return null;
}
