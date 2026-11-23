import { DevModeEnvContext } from '@codegena/util-dev-mode';
import {
  type MotionValue,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
} from 'motion/react';
import { useContext, useRef } from 'react';

const idleDegreesPerSecond = 8;
const maximumScrollBoost = 120;

/**
 * Keeps the ring moving gently and adds speed while the page scrolls.
 */
export function useOrbitAngle(): MotionValue<number> {
  const { scrollY } = useScroll();
  const angle = useMotionValue(0);
  const direction = useRef(1);
  const shouldReduceMotion = useReducedMotion();
  const { isTestingMode } = useContext(DevModeEnvContext);

  useAnimationFrame((_, delta) => {
    if (shouldReduceMotion || isTestingMode) {
      return;
    }

    const scrollVelocity = scrollY.getVelocity();

    if (Math.abs(scrollVelocity) > 20) {
      direction.current = Math.sign(scrollVelocity);
    }

    const scrollBoost = Math.min(Math.abs(scrollVelocity) / 35, maximumScrollBoost);
    const degreesPerSecond = direction.current * (idleDegreesPerSecond + scrollBoost);

    angle.set((angle.get() + degreesPerSecond * delta / 1000) % 360);
  });

  return angle;
}
