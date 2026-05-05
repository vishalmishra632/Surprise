import FilmStrip from '../components/FilmStrip';
import MemoryPanel from '../components/MemoryPanel';
import SceneWrapper from '../components/SceneWrapper';
import { filmReelScene } from '../data/loveStory';

type Props = { active: boolean };

export default function FilmReelScene({ active }: Props) {
  return (
    <SceneWrapper id="film-reel" ariaLabel="Film Reel">
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse at 50% 30%, #1c1418 0%, #0a0810 60%, #050409 100%)',
        }}
      />

      <div className="relative z-10 flex h-screen flex-col justify-center px-8 py-10">
        <div className="text-center">
          <MemoryPanel
            eyebrow="Chapter VII · The Reel"
            title={filmReelScene.topLine}
            scriptTitle={filmReelScene.bottomLine}
            align="center"
            className="mx-auto"
          />
        </div>

        <div className="mt-10">
          <FilmStrip images={filmReelScene.images} active={active} />
        </div>

        <p
          className="mt-4 text-center font-mono uppercase"
          style={{
            fontSize: 11,
            letterSpacing: 5,
            color: 'var(--champagne)',
          }}
        >
          {filmReelScene.closing}
        </p>
      </div>
    </SceneWrapper>
  );
}
