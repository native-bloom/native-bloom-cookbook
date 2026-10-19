import { useCallback, useMemo, useState } from "react";
import { Gesture, type PanGesture } from "react-native-gesture-handler";
import {
  cancelAnimation,
  useAnimatedReaction,
  useSharedValue,
  withSpring,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

// Points of finger travel for one mode
const ITEM_STRIDE = 128;
// Settles in ~0.44 s and overshoots once, so the landing reads
const SNAP_SPRING = { damping: 18, mass: 1, stiffness: 130 } as const;
// One swipe moves at most one mode; past that the drag resists
const PAN_REACH = 1;
const PAN_RESIST = 6;
// How much release velocity carries into the landing slot, in seconds
const FLING_PROJECTION_S = 0.18;

export function wrapIndex(slot: number, total: number): number {
  "worklet";
  if (total <= 0) return 0;
  return ((slot % total) + total) % total;
}

/** Shortest signed distance from `offset` to `index` around the loop. */
export function cyclicDelta(index: number, offset: number, total: number): number {
  "worklet";
  if (total <= 0) return 0;
  const half = total / 2;
  let delta = (((index - offset) % total) + total) % total;
  if (delta >= half) delta -= total;
  return delta;
}

export type ModeCarousel = {
  offset: SharedValue<number>;
  panGesture: PanGesture;
  preview: number;
  selectSlot: (slot: number) => void;
};

export function useModeCarousel(total: number): ModeCarousel {
  const offset = useSharedValue(0);
  const panStart = useSharedValue(0);
  const panHome = useSharedValue(0);
  const panActivated = useSharedValue(0);
  const [preview, setPreview] = useState(0);

  useAnimatedReaction(
    () => wrapIndex(Math.round(offset.get()), total),
    (index, previous) => {
      if (index !== previous) scheduleOnRN(setPreview, index);
    }
  );

  const settleOn = useCallback(
    (target: number) => {
      offset.set(withSpring(target, SNAP_SPRING));
    },
    [offset]
  );

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-10, 10])
        .failOffsetY([-28, 28])
        .maxPointers(1)
        .onBegin(() => {
          cancelAnimation(offset);
          panActivated.set(0);
          panStart.set(offset.get());
          panHome.set(Math.round(offset.get()));
        })
        .onStart(() => {
          panActivated.set(1);
        })
        .onUpdate((event) => {
          const home = panHome.get();
          const drift = panStart.get() - event.translationX / ITEM_STRIDE - home;
          const over = Math.abs(drift) - PAN_REACH;
          offset.set(
            over <= 0
              ? home + drift
              : home + Math.sign(drift) * (PAN_REACH + over / (1 + over * PAN_RESIST))
          );
        })
        .onEnd((event) => {
          const slotsPerSecond = -event.velocityX / ITEM_STRIDE;
          const projected = offset.get() + slotsPerSecond * FLING_PROJECTION_S;
          const home = panHome.get();
          const target = Math.max(home - PAN_REACH, Math.min(home + PAN_REACH, projected));
          scheduleOnRN(settleOn, Math.round(target));
        })
        .onFinalize((_event, success) => {
          if (!success && panActivated.get() === 1) {
            scheduleOnRN(settleOn, Math.round(offset.get()));
          }
        }),
    [offset, panActivated, panHome, panStart, settleOn]
  );

  const selectSlot = useCallback(
    (slot: number) => {
      cancelAnimation(offset);
      const here = Math.round(offset.get());
      settleOn(here + cyclicDelta(slot, here, total));
    },
    [offset, settleOn, total]
  );

  return { offset, panGesture, preview, selectSlot };
}
