type MediaFallbackProps = {
  label?: string;
  className?: string;
};

/** Shown whenever a photo or video is missing. Looks intentional, not broken. */
export default function MediaFallback({
  label = 'Memory',
  className = '',
}: MediaFallbackProps) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{
        background:
          'radial-gradient(ellipse at 30% 20%, rgba(212,175,55,0.18), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(232,168,185,0.16), transparent 60%), linear-gradient(135deg, #14141e, #0a0a12)',
        borderRadius: 'inherit',
      }}
      aria-label={`${label} placeholder`}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 0 1px rgba(212,175,55,0.18)',
        }}
      />
      <div className="relative text-center px-4">
        <div
          className="font-display italic"
          style={{ fontSize: 28, color: 'var(--champagne)', lineHeight: 1 }}
        >
          {label}
        </div>
        <div
          className="mt-3 font-mono uppercase"
          style={{ fontSize: 9, letterSpacing: 4, color: 'rgba(244,235,216,0.45)' }}
        >
          memory · pending
        </div>
      </div>
    </div>
  );
}
