import { type ReactNode, type Ref } from 'react';

type SmoothScrollContainerProps = {
  children: ReactNode;
  containerRef: Ref<HTMLDivElement>;
};

/**
 * The actual scroll container. CSS scroll-snap on a y-mandatory column,
 * one scene per snap point. Native scroll keeps it reliable on a projector.
 */
export default function SmoothScrollContainer({
  children,
  containerRef,
}: SmoothScrollContainerProps) {
  return (
    <div
      ref={containerRef}
      className="h-screen w-screen overflow-y-scroll overflow-x-hidden"
      style={{
        scrollSnapType: 'y mandatory',
        scrollBehavior: 'smooth',
      }}
    >
      {children}
    </div>
  );
}
