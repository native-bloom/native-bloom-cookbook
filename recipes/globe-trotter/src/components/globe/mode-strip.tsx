import { MODES, type Mode } from "@/constants/modes";
import { memo, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { cyclicDelta } from "./use-mode-carousel";

const STRIDE = 56;
const THUMB = 34;
const SELECTED = 46;

/**
 * Thumbnails under the CTA; tap one to spin the globe straight to it.
 * They stay put and only the highlight follows the globe: with four modes a
 * scrolling loop would have to teleport a thumbnail from one end to the other.
 */
export function ModeStrip({
  offset,
  onPick,
}: {
  offset: SharedValue<number>;
  onPick: (slot: number) => void;
}) {
  return (
    <View pointerEvents="box-none" style={styles.host}>
      {MODES.map((mode, index) => (
        <Thumb key={mode.id} index={index} mode={mode} offset={offset} onPick={onPick} />
      ))}
    </View>
  );
}

const Thumb = memo(function Thumb({
  index,
  mode,
  offset,
  onPick,
}: {
  index: number;
  mode: Mode;
  offset: SharedValue<number>;
  onPick: (slot: number) => void;
}) {
  const handlePress = useCallback(() => onPick(index), [index, onPick]);

  const style = useAnimatedStyle(() => {
    const distance = Math.abs(cyclicDelta(index, offset.get(), MODES.length));
    return {
      opacity: interpolate(distance, [0, 1], [1, 0.5], "clamp"),
      transform: [
        { translateX: (index - (MODES.length - 1) / 2) * STRIDE },
        { scale: interpolate(distance, [0, 1], [SELECTED / THUMB, 1], "clamp") },
      ],
    };
  });

  return (
    <Animated.View style={[styles.slot, style]}>
      <Pressable
        accessibilityLabel={mode.vehicle}
        accessibilityRole="button"
        hitSlop={10}
        onPress={handlePress}
        style={styles.thumb}
      >
        <Text style={styles.emoji}>{mode.emoji}</Text>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  host: {
    alignItems: "center",
    height: SELECTED,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
  },
  slot: {
    height: THUMB,
    position: "absolute",
    width: THUMB,
  },
  thumb: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: THUMB / 2,
    borderWidth: StyleSheet.hairlineWidth,
    height: THUMB,
    justifyContent: "center",
    width: THUMB,
  },
  emoji: {
    fontSize: 17,
  },
});
