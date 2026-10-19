import { botAvatarPresets } from "@/components/bot-avatars";
import { CrewRing } from "@/components/crew-ring";
import { CREW, CREW_SIZE } from "@/constants/crew";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function Index() {
  const { bottom } = useSafeAreaInsets();
  const [picked, setPicked] = useState<number[]>([]);
  const [launched, setLaunched] = useState(false);

  const focused = picked.length ? CREW[picked[picked.length - 1]] : undefined;
  const ready = picked.length === CREW_SIZE;

  const pick = (index: number) => {
    if (launched) return;
    if (picked.includes(index)) {
      Haptics.selectionAsync();
      setPicked(picked.filter((i) => i !== index));
    } else if (ready) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.selectionAsync();
      setPicked([...picked, index]);
    }
  };

  const onButtonPress = () => {
    if (launched) {
      setLaunched(false);
      setPicked([]);
    } else if (ready) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setLaunched(true);
    }
  };

  const buttonLabel = launched
    ? "Change crew"
    : ready
      ? "Start building"
      : `Pick ${CREW_SIZE - picked.length} more`;

  return (
    <View style={styles.container}>
      <AnimatedLinearGradient
        entering={FadeIn.delay(2500).duration(1000)}
        colors={["#1B1638", "#08080C"]}
        style={StyleSheet.absoluteFill}
      />
      <CrewRing picked={picked} launched={launched} onPick={pick}>
        <Animated.View
          key={launched ? "launched" : (focused?.type ?? "empty")}
          entering={FadeInDown.duration(300)}
          exiting={FadeOut.duration(150)}
          style={styles.centerLabel}
        >
          {launched ? (
            <>
              <Text style={styles.centerTitle}>{CREW_SIZE} agents</Text>
              <Text style={styles.centerRole}>working</Text>
            </>
          ) : focused ? (
            <>
              <Text style={styles.centerTitle}>{botAvatarPresets[focused.type].label}</Text>
              <Text style={styles.centerRole}>{focused.role}</Text>
            </>
          ) : (
            <Text style={styles.centerRole}>Tap a bot</Text>
          )}
        </Animated.View>
      </CrewRing>
      <Animated.View
        entering={FadeInUp.delay(2200).duration(1000)}
        pointerEvents="box-none"
        style={[styles.bottomContainer, { paddingBottom: bottom }]}
      >
        <Animated.Text
          key={launched ? "on-it" : "pick"}
          entering={FadeInDown.duration(400)}
          style={styles.mainText}
        >
          {launched ? "Your crew is on it.\nGo grab a coffee." : "Pick three agents\nto build your next app"}
        </Animated.Text>
        <Pressable
          onPress={onButtonPress}
          style={[styles.button, ready || launched ? styles.buttonReady : styles.buttonIdle]}
        >
          <Text style={[styles.buttonText, (ready || launched) && styles.buttonTextReady]}>
            {buttonLabel}
          </Text>
        </Pressable>
        <Text style={styles.subText}>
          {launched ? "The rest are taking a nap" : "Drag around. They're watching"}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08080C",
  },
  centerLabel: {
    alignItems: "center",
  },
  centerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
  },
  centerRole: {
    color: "#FFFFFF",
    opacity: 0.55,
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  mainText: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "500",
    textAlign: "center",
  },
  button: {
    width: 200,
    height: 48,
    borderRadius: 24,
    marginTop: 28,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIdle: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.14)",
  },
  buttonReady: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  buttonTextReady: {
    color: "#08080C",
  },
  subText: {
    color: "#FFFFFF",
    fontSize: 13,
    textAlign: "center",
    opacity: 0.45,
    marginBottom: 24,
  },
});
