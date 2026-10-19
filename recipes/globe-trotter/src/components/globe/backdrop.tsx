import { Canvas, LinearGradient, Rect, vec } from "@shopify/react-native-skia";
import { useMemo } from "react";
import { StyleSheet } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

const INK = "#06080C";

/** The ground colour follows the carousel, blending between modes mid-swipe. */
export function Backdrop({
  colors,
  height,
  offset,
}: {
  colors: readonly string[];
  height: number;
  offset: SharedValue<number>;
}) {
  const total = colors.length;
  const ramp = useMemo(() => [...colors, colors[0] ?? INK], [colors]);
  const stops = useMemo(() => ramp.map((_, index) => index), [ramp]);

  const tintStyle = useAnimatedStyle(() => {
    const position = total > 0 ? ((offset.get() % total) + total) % total : 0;
    return { backgroundColor: interpolateColor(position, stops, ramp) };
  });

  return (
    <Animated.View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, tintStyle]} />
      <Canvas pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Rect height={height} width={4000} x={0} y={0}>
          <LinearGradient
            colors={["rgba(6,8,12,0.12)", "rgba(6,8,12,0)", "rgba(6,8,12,0.2)", INK, INK]}
            end={vec(0, height)}
            positions={[0, 0.32, 0.72, 0.93, 1]}
            start={vec(0, 0)}
          />
        </Rect>
      </Canvas>
    </Animated.View>
  );
}
