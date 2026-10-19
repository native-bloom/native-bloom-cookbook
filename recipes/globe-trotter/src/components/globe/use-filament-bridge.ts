import { useEffect } from "react";
import { useFilamentContext } from "react-native-filament";
import { runOnUI, type SharedValue as ReanimatedSharedValue } from "react-native-reanimated";
import { useSharedValue, type ISharedValue as FilamentSharedValue } from "react-native-worklets-core";

/**
 * Mirrors a Reanimated shared value into Filament's worklet context, so the
 * render loop can read gesture state without touching React.
 */
export function useFilamentBridge<T>(
  reanimatedValue: ReanimatedSharedValue<T>,
  initialValue: T
): FilamentSharedValue<T> {
  const filamentValue = useSharedValue(initialValue);
  const { workletContext } = useFilamentContext();

  useEffect(() => {
    const listenerId = Math.floor(Math.random() * 1_000_000);
    const forward = workletContext.createRunAsync((value: T) => {
      "worklet";
      filamentValue.value = value;
    });

    runOnUI(() => {
      "worklet";
      reanimatedValue.addListener(listenerId, forward);
    })();

    return () => {
      runOnUI(() => {
        "worklet";
        reanimatedValue.removeListener(listenerId);
      })();
    };
  }, [filamentValue, reanimatedValue, workletContext]);

  return filamentValue;
}
