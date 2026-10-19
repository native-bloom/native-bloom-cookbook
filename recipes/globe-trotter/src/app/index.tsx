import { Backdrop } from "@/components/globe/backdrop";
import { GlobeStage } from "@/components/globe/globe-stage";
import { ModeStrip } from "@/components/globe/mode-strip";
import { MorphingText } from "@/components/globe/morphing-text";
import { useGlobeTilt } from "@/components/globe/use-globe-tilt";
import { useModeCarousel } from "@/components/globe/use-mode-carousel";
import { MODES, TRIP } from "@/constants/modes";
import * as Haptics from "expo-haptics";
import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const WORDS = MODES.map((mode) => mode.word);
const GROUNDS = MODES.map((mode) => mode.ground);
// Where the globe's centre sits, as a fraction of the screen height
const GLOBE_CENTER_FRACTION = 0.46;
// The 3D view is taller than wide so nothing clips when the camera tilts
const STAGE_ASPECT = 1.5;
const WORDMARK_FRACTION = 0.22;
const WORDMARK_MAX = 92;

export default function Index() {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { offset, panGesture, preview, selectSlot } = useModeCarousel(MODES.length);
  const { tilt, tiltGesture } = useGlobeTilt(reducedMotion);
  const gesture = useMemo(() => Gesture.Race(panGesture, tiltGesture), [panGesture, tiltGesture]);
  const mode = MODES[preview];

  const stageWidth = Math.min(width * 1.1, 480);
  const stageHeight = stageWidth * STAGE_ASPECT;
  const stageTop = height * GLOBE_CENTER_FRACTION - stageHeight / 2;
  const wordSize = Math.min(WORDMARK_MAX, width * WORDMARK_FRACTION);

  useEffect(() => {
    Haptics.selectionAsync();
  }, [preview]);

  return (
    <View style={styles.screen}>
      <Backdrop colors={GROUNDS} height={height} offset={offset} />

      <GestureDetector gesture={gesture}>
        <View style={StyleSheet.absoluteFill}>
          <View
            pointerEvents="none"
            style={[styles.header, { paddingTop: Math.max(insets.top, 12) + 4 }]}
          >
            <Text style={styles.eyebrow}>
              {TRIP.from} → {TRIP.to}
            </Text>
            <Text style={styles.count}>
              {String(preview + 1).padStart(2, "0")} / {String(MODES.length).padStart(2, "0")}
            </Text>
          </View>

          <View
            pointerEvents="none"
            style={[styles.wordmark, { top: Math.max(insets.top, 12) + 36 }]}
          >
            <MorphingText
              color="#FFFFFF"
              fitTexts={WORDS}
              fontSize={wordSize}
              height={wordSize * 1.34}
              paddingLeft={18}
              reducedMotion={reducedMotion}
              text={mode.word}
              tracking={-wordSize * 0.037}
              width={width}
            />
            <Text style={[styles.tail, { fontSize: wordSize * 0.62, marginTop: -wordSize * 0.3 }]}>
              TO {TRIP.to}
            </Text>
          </View>

          <View
            pointerEvents="none"
            style={[styles.stage, { top: stageTop, width: stageWidth, height: stageHeight }]}
          >
            <GlobeStage
              offset={offset}
              reducedMotion={reducedMotion}
              width={stageWidth}
              height={stageHeight}
              tilt={tilt}
            />
          </View>

          <View
            pointerEvents="box-none"
            style={[styles.foot, { paddingBottom: Math.max(insets.bottom, 14) }]}
          >
            <View style={styles.chips}>
              {mode.facts.map((fact) => (
                <View key={fact} style={styles.chip}>
                  <Text style={styles.chipText}>{fact}</Text>
                </View>
              ))}
            </View>

            <Pressable style={styles.cta}>
              <Text style={styles.ctaText}>TAKE THE {mode.vehicle.toUpperCase()}</Text>
              <Text style={styles.ctaArrow}>→</Text>
            </Pressable>

            <View style={styles.stripSlot}>
              <ModeStrip offset={offset} onPick={selectSlot} />
            </View>
          </View>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#06080C",
    flex: 1,
  },
  header: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    paddingHorizontal: 18,
    position: "absolute",
    right: 0,
    top: 0,
  },
  eyebrow: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.9,
  },
  count: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 10,
    fontVariant: ["tabular-nums"],
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  wordmark: {
    left: 0,
    position: "absolute",
    right: 0,
  },
  tail: {
    color: "rgba(255,255,255,0.22)",
    fontWeight: "900",
    letterSpacing: -2,
    paddingLeft: 18,
  },
  stage: {
    alignSelf: "center",
    position: "absolute",
  },
  foot: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
  chips: {
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
  },
  chip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.9,
  },
  cta: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    flexDirection: "row",
    height: 54,
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginTop: 16,
    paddingHorizontal: 24,
  },
  ctaText: {
    color: "#06080C",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  ctaArrow: {
    color: "#06080C",
    fontSize: 20,
    fontWeight: "700",
  },
  stripSlot: {
    height: 46,
    marginTop: 18,
  },
});
