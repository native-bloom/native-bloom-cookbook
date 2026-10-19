import { BotAvatar, botAvatarPresets, type BotAvatarHandle } from "@/components/bot-avatars";
import { CREW, type Agent } from "@/constants/crew";
import React, { useEffect, useRef, type ReactNode } from "react";
import { Dimensions, StyleSheet, View, type GestureResponderEvent, type HostInstance } from "react-native";
import Animated, {
  clamp,
  Easing,
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const SCREEN_WIDTH = Dimensions.get("window").width;
const RING_RADIUS = SCREEN_WIDTH * 0.3;
const RING_DIAMETER = RING_RADIUS * 2;
const BOT_SIZE = 66;
const BOT_COUNT = CREW.length;

// Animation durations
const INITIAL_DELAY = 200;
const DEAL_DURATION = 800;
const SPIN_DURATION = 30000;
const UNFAN_DURATION = 900;
const GLANCE_DURATION = 900;

interface CrewRingProps {
  picked: number[];
  launched: boolean;
  onPick: (index: number) => void;
  animationDelay?: number;
  /** Rendered in the middle of the ring, upright. */
  children?: ReactNode;
}

export const CrewRing: React.FC<CrewRingProps> = ({
  picked,
  launched,
  onPick,
  animationDelay = 1200,
  children,
}) => {
  const isDealing = useSharedValue(false);
  const progress = useSharedValue(0);
  const spin = useSharedValue(0);
  const scale = useSharedValue(1.5);
  const top = useSharedValue(100);
  const centerOpacity = useSharedValue(0);

  const stage = useRef<HostInstance>(null);
  const frame = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const bots = useRef<(BotAvatarHandle | null)[]>([]);
  const glance = useRef<ReturnType<typeof setTimeout>>(undefined);

  const animatedRing = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${spin.value * 360}deg` }, { scale: scale.value }],
      top: top.value,
    };
  });

  // Absolutely positioned, so it follows the ring with a translate instead of `top`
  const animatedCenter = useAnimatedStyle(() => ({
    opacity: centerOpacity.value,
    transform: [{ translateY: top.value }],
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      isDealing.value = true;
      scale.value = withTiming(1, { duration: 350 });
      top.value = withTiming(-60, { duration: 350 });
      progress.value = withDelay(
        INITIAL_DELAY,
        withTiming(
          1,
          {
            duration: DEAL_DURATION,
            easing: Easing.bezier(0.65, 0.05, 0.36, 1),
          },
          () => {
            isDealing.value = false;
            centerOpacity.value = withTiming(1, { duration: 400 });
            progress.value = 0;
            spin.value = withRepeat(
              withTiming(1, {
                duration: SPIN_DURATION,
                easing: Easing.linear,
              }),
              -1,
              false
            );
          }
        )
      );
    }, animationDelay);
    return () => clearTimeout(timer);
  }, []);

  // Where a bot sits on screen right now: its slot on the ring plus the ring's spin
  const botCenter = (index: number) => {
    const { x, y, width, height } = frame.current;
    const angle =
      -Math.PI / 2 + ((index + 1) / BOT_COUNT) * 2 * Math.PI + spin.value * 2 * Math.PI;
    return {
      x: x + width / 2 + RING_RADIUS * Math.cos(angle),
      y: y + height / 2 + top.value + RING_RADIUS * Math.sin(angle),
    };
  };

  // Every bot turns its head toward a point in window coordinates
  const lookAt = (pageX: number, pageY: number, except?: number) => {
    bots.current.forEach((bot, index) => {
      if (!bot || index === except) return;
      const center = botCenter(index);
      const dx = (pageX - center.x) / BOT_SIZE;
      const dy = (pageY - center.y) / BOT_SIZE;
      const distance = Math.max(1, Math.hypot(dx, dy));
      bot.setPointer(dx / distance, dy / distance, 1);
    });
  };

  const letGo = () => bots.current.forEach((bot) => bot?.setPointer(0, 0, 0));

  const follow = (e: GestureResponderEvent) => {
    clearTimeout(glance.current);
    lookAt(e.nativeEvent.pageX, e.nativeEvent.pageY);
  };

  const pick = (index: number) => {
    const center = botCenter(index);
    lookAt(center.x, center.y, index);
    clearTimeout(glance.current);
    glance.current = setTimeout(letGo, GLANCE_DURATION);
    onPick(index);
  };

  return (
    <View
      ref={stage}
      style={[StyleSheet.absoluteFill, styles.container]}
      onLayout={() =>
        stage.current?.measureInWindow((x, y, width, height) => {
          frame.current = { x, y, width, height };
        })
      }
      onStartShouldSetResponder={() => true}
      onResponderGrant={follow}
      onResponderMove={follow}
      onResponderRelease={letGo}
      onResponderTerminate={letGo}
    >
      <Animated.View style={[styles.ring, animatedRing]}>
        {CREW.map((agent, index) => (
          <CrewBot
            key={agent.type}
            ref={(bot) => {
              bots.current[index] = bot;
            }}
            index={index}
            agent={agent}
            progress={progress}
            isDealing={isDealing}
            spin={spin}
            isPicked={picked.includes(index)}
            launched={launched}
            onPress={() => pick(index)}
          />
        ))}
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.center, animatedCenter]}>
        {children}
      </Animated.View>
    </View>
  );
};

interface CrewBotProps {
  ref: React.Ref<BotAvatarHandle>;
  index: number;
  agent: Agent;
  progress: SharedValue<number>;
  isDealing: SharedValue<boolean>;
  spin: SharedValue<number>;
  isPicked: boolean;
  launched: boolean;
  onPress: () => void;
}

const CrewBot = ({
  ref,
  index,
  agent,
  progress,
  isDealing,
  spin,
  isPicked,
  launched,
  onPress,
}: CrewBotProps) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const fan = useSharedValue(0);
  const glow = useSharedValue(0);
  const color = botAvatarPresets[agent.type].color;

  const startPoint = 0;
  const endPoint = (index + 1) * (1 / BOT_COUNT);

  useEffect(() => {
    fan.value = -360 * (index / (BOT_COUNT - 1));
  }, [index, fan]);

  useEffect(() => {
    glow.value = withSpring(isPicked ? 1 : 0, { damping: 14, stiffness: 160 });
  }, [isPicked, glow]);

  useDerivedValue(() => {
    const { x: xValue, y: yValue } = getCircumferencePoint(
      clamp((progress.value * (index + 1)) / BOT_COUNT, startPoint, endPoint),
      RING_RADIUS
    );
    if (y.value === 0) {
      y.value = yValue;
    }
    if (isDealing.value) {
      x.value = xValue;
      y.value = yValue;
      fan.value = withTiming(0, {
        duration: UNFAN_DURATION,
      });
    }
  });

  // The ring spins one way, each bot the other, so they stay upright
  const animatedSlot = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        {
          rotate: fan.value ? `${fan.value}deg` : `-${spin.value * 360}deg`,
        },
      ],
    };
  });

  const animatedGlow = useAnimatedStyle(() => ({
    opacity: glow.value,
    transform: [{ scale: 0.5 + glow.value * 0.5 }],
  }));

  const state = launched ? (isPicked ? "working" : "sleeping") : "default";

  return (
    <Animated.View style={[styles.slot, animatedSlot]}>
      <Animated.View pointerEvents="none" style={[styles.glow, animatedGlow]}>
        <View style={[styles.glowFill, { backgroundColor: color, shadowColor: color }]} />
        <View style={[styles.glowRing, { borderColor: color }]} />
      </Animated.View>
      <BotAvatar
        ref={ref}
        type={agent.type}
        size={BOT_SIZE}
        state={state}
        whirl={state === "working" ? 1 : 0}
        onPress={onPress}
      />
    </Animated.View>
  );
};

/**
 * Get (x, y) coordinates on a circle's circumference.
 * @param {number} progress - Value between 0 and 1 (0 = 0°, 1 = 360°)
 * @param {number} radius - Radius of the circle
 * @returns {{ x: number, y: number }}
 */
function getCircumferencePoint(progress: number, radius: number) {
  "worklet";
  const baseAngle = -Math.PI / 2; // Start from top (-90 degrees)

  const angle = baseAngle + progress * 2 * Math.PI;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  return { x, y };
}

const GLOW_SIZE = BOT_SIZE * 1.25;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  ring: {
    width: RING_DIAMETER,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  slot: {
    width: BOT_SIZE,
    height: BOT_SIZE,
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  glow: {
    position: "absolute",
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    opacity: 0,
  },
  glowFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: GLOW_SIZE / 2,
    opacity: 0.25,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  glowRing: {
    ...StyleSheet.absoluteFill,
    borderRadius: GLOW_SIZE / 2,
    borderWidth: 2,
  },
  center: {
    position: "absolute",
    width: RING_DIAMETER - BOT_SIZE * 1.4,
    alignItems: "center",
    justifyContent: "center",
  },
});
