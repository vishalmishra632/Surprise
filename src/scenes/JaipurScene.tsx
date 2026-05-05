import BackgroundMedia from '../components/BackgroundMedia';
import FloatingMediaCard from '../components/FloatingMediaCard';
import MemoryPanel from '../components/MemoryPanel';
import SceneWrapper from '../components/SceneWrapper';
import { jaipurScene } from '../data/loveStory';

type Props = { active: boolean };

const slots = [
  { className: 'left-[4%] top-[14%]', rotate: -6, width: 220 },
  { className: 'left-[6%] bottom-[16%]', rotate: 5, width: 220 },
  { className: 'right-[4%] top-[12%]', rotate: 7, width: 220 },
  { className: 'right-[6%] bottom-[18%]', rotate: -5, width: 220 },
];

export default function JaipurScene({ active }: Props) {
  const fallbackImage = jaipurScene.imageSrcs[0];

  return (
    <SceneWrapper id="jaipur" ariaLabel="Jaipur">
      <BackgroundMedia
        videoSrc={jaipurScene.videoSrc}
        imageSrc={fallbackImage}
        label="Jaipur"
        overlayOpacity={0.78}
        overlayTint="rose"
        active={active}
      />

      <div className="pointer-events-none absolute inset-0 hidden lg:block">
        {slots.map((slot, i) => {
          const src = jaipurScene.imageSrcs[i + 1];
          if (!src) return null;
          return (
            <div key={src} className={`pointer-events-auto absolute ${slot.className}`}>
              <FloatingMediaCard
                src={src}
                caption={jaipurScene.imageCaptions[i + 1]}
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
          eyebrow="Chapter V · Jaipur"
          title={jaipurScene.heading}
          scriptTitle={jaipurScene.scriptHeading}
          body={jaipurScene.lines.join(' ')}
          closing={jaipurScene.closing}
          align="center"
        />
      </div>
    </SceneWrapper>
  );
}
