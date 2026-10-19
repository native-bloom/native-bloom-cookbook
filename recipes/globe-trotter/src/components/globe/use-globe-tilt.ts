import { useMemo } from "react";
import { Gesture, type PanGesture } from "react-native-gesture-handler";
import { useSharedValue, withSpring, type SharedValue } from "react-native-reanimated";

// Points of vertical drag for the full tilt, and how hard it resists past that
const TILT_REACH = 190;
const TILT_RESIST = 2.6;
const TILT_HOME_SPRING = { damping: 17, mass: 0.9, stiffness: 150 };

export type GlobeTilt = {
  /** −1 … 1. A downward drag flies the camera up over the globe. */
  tilt: SharedValue<number>;
  tiltGesture: PanGesture;
};

/** Drag up or down to look around the globe; it springs home on release. */
export function useGlobeTilt(reducedMotion: boolean): GlobeTilt {
  const tilt = useSharedValue(0);

  const tiltGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetY([-10, 10])
        .failOffsetX([-28, 28])
        .maxPointers(1)
        .enabled(!reducedMotion)
        .onUpdate((event) => {
          const reach = event.translationY / TILT_REACH;
          const over = Math.abs(reach) - 1;
          tilt.set(over <= 0 ? reach : Math.sign(reach) * (1 + over / (1 + over * TILT_RESIST)));
        })
        .onFinalize(() => {
          tilt.set(withSpring(0, TILT_HOME_SPRING));
        }),
    [reducedMotion, tilt]
  );

  return { tilt, tiltGesture };
}
