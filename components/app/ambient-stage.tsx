import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type Props = {
  accent: string;
  glow: string;
};

export function AmbientStage({ accent, glow }: Props) {
  const drift = useSharedValue(0);

  React.useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 4200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [drift]);

  const animatedOrb = useAnimatedStyle(() => ({
    opacity: 0.65 + drift.value * 0.2,
    transform: [{ translateY: drift.value * -18 }, { scale: 1 + drift.value * 0.04 }],
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.backdrop, { backgroundColor: '#090b12' }]} />
      <Animated.View
        style={[
          styles.orb,
          styles.orbLeft,
          animatedOrb,
          {
            backgroundColor: glow,
            borderColor: accent,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbRight,
          animatedOrb,
          {
            backgroundColor: `${accent}22`,
            borderColor: `${accent}55`,
          },
        ]}
      />
      <View style={styles.grid} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 999,
    borderWidth: 1,
  },
  orbLeft: {
    left: -70,
    top: 80,
  },
  orbRight: {
    right: -40,
    bottom: 120,
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    opacity: 0.18,
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
