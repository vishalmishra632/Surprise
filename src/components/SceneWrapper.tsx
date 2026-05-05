import type { ReactNode } from 'react';

type SceneWrapperProps = {
  id: string;
  children: ReactNode;
  className?: string;
  ariaLabel: string;
};

/**
 * Each scene is exactly 100vh, snapped, and serves as a scroll target.
 * The whole experience is a vertical column of these.
 */
export default function SceneWrapper({
  id,
  children,
  className = '',
  ariaLabel,
}: SceneWrapperProps) {
  return (
    <section
      id={id}
      data-scene={id}
      aria-label={ariaLabel}
      className={`relative min-h-screen w-full overflow-hidden ${className}`}
      style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
    >
      {children}
    </section>
  );
}
