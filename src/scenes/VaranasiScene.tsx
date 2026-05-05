import BackgroundMedia from '../components/BackgroundMedia';
import FloatingMediaCard from '../components/FloatingMediaCard';
import MemoryPanel from '../components/MemoryPanel';
import SceneWrapper from '../components/SceneWrapper';
import { varanasiScene } from '../data/loveStory';

type Props = { active: boolean };

const slots = [
  { className: 'left-[4%] top-[12%]', rotate: -5, width: 220 },
  { className: 'left-[6%] bottom-[14%]', rotate: 4, width: 220 },
  { className: 'right-[4%] top-[10%]', rotate: 6, width: 220 },
  { className: 'right-[6%] bottom-[16%]', rotate: -4, width: 220 },
];

export default function VaranasiScene({ active }: Props) {
  const fallbackImage = varanasiScene.imageSrcs[0];

  return (
    <SceneWrapper id="varanasi" ariaLabel="Varanasi">
      <BackgroundMedia
        videoSrc={varanasiScene.videoSrc}
        imageSrc={fallbackImage}
        label="Varanasi"
        overlayOpacity={0.78}
        overlayTint="gold"
        active={active}
      />

      {/* floating polaroid cards (desktop only) */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {slots.map((slot, i) => {
          const src = varanasiScene.imageSrcs[i + 1];
          if (!src) return null;
          return (
            <div key={src} className={`pointer-events-auto absolute ${slot.className}`}>
              <FloatingMediaCard
                src={src}
                caption={varanasiScene.imageCaptions[i + 1]}
                rotate={slot.rotate}
                width={slot.width}
                delay={0.2 + i * 0.12}
              />
            </div>
          );
        })}
      </div>

      <div className="relative z-10 mx-auto flex h-screen max-w-6xl items-center justify-center px-8 text-center">
        <MemoryPanel
          eyebrow="Chapter IV · Varanasi"
          title={varanasiScene.heading}
          scriptTitle={varanasiScene.scriptHeading}
          body={varanasiScene.lines.join(' ')}
          closing={varanasiScene.closing}
          align="center"
        />
      </div>
    </SceneWrapper>
  );
}
