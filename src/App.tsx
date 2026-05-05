import { Journey } from './journey/Journey';
import { ReelMode } from './journey/overlay/ReelMode';

const isReelInner =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('reel') === '1';

export default function App() {
  if (isReelInner) {
    // Loaded inside the reel-mode iframe — render the experience and
    // nothing else, so the iframe's viewport == the chosen aspect ratio.
    return <Journey />;
  }

  return (
    <>
      <Journey />
      <ReelMode />
    </>
  );
}
