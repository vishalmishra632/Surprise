import { useFrame } from '@react-three/fiber';
import { useJourneyStore } from '../store';

export function ProgressDriver() {
  useFrame(() => {
    const { progress, targetProgress, setProgress } = useJourneyStore.getState();
    const next = progress + (targetProgress - progress) * 0.08;
    if (Math.abs(next - progress) > 1e-5) {
      setProgress(next);
    }
  });
  return null;
}
