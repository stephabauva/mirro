import React, { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { LinearGradient } from 'expo-linear-gradient';

type Star = {
  left: number;
  top: number;
  size: number;
  opacity: number;
};

function buildStars(count: number, width: number, height: number, seed: number): Star[] {
  let value = seed;
  const next = () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };

  return Array.from({ length: count }, () => ({
    left: next() * width,
    top: next() * height,
    size: 0.8 + next() * 2.6,
    opacity: 0.2 + next() * 0.75,
  }));
}

export function SpaceBackdrop() {
  const { width, height } = useWindowDimensions();
  const sceneWidth = Math.max(width, 1440);
  const sceneHeight = Math.max(height, 980);

  const nearStars = useMemo(() => buildStars(150, sceneWidth, sceneHeight, 7), [sceneHeight, sceneWidth]);
  const farStars = useMemo(() => buildStars(110, sceneWidth, sceneHeight, 17), [sceneHeight, sceneWidth]);

  const drift = useSharedValue(0);
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 26000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 26000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 12000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 12000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [drift, shimmer]);

  const farLayerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * -26 }, { translateY: drift.value * 14 }, { scale: 1.03 + drift.value * 0.015 }],
    opacity: 0.76 + shimmer.value * 0.12,
  }));

  const nearLayerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * 18 }, { translateY: drift.value * -12 }, { scale: 1.01 + drift.value * 0.01 }],
    opacity: 0.88 + shimmer.value * 0.08,
  }));

  const nebulaStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: drift.value * -18 }, { translateY: drift.value * 10 }],
    opacity: 0.48 + shimmer.value * 0.1,
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#02050a', '#070b12', '#05070c', '#02040a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.nebulaLayer, nebulaStyle]}>
        <View style={[styles.nebula, styles.nebulaBlue]} />
        <View style={[styles.nebula, styles.nebulaWhite]} />
        <View style={[styles.nebula, styles.nebulaAmber]} />
        <View style={[styles.nebula, styles.nebulaDust]} />
      </Animated.View>

      <Animated.View style={[styles.starLayer, farLayerStyle]}>
        {farStars.map((star, index) => (
          <View
            key={`far-${index}`}
            style={[
              styles.star,
              {
                left: star.left,
                top: star.top,
                width: star.size,
                height: star.size,
                opacity: star.opacity * 0.7,
              },
            ]}
          />
        ))}
      </Animated.View>

      <Animated.View style={[styles.starLayer, nearLayerStyle]}>
        {nearStars.map((star, index) => (
          <View
            key={`near-${index}`}
            style={[
              styles.star,
              styles.starNear,
              {
                left: star.left,
                top: star.top,
                width: star.size + 0.6,
                height: star.size + 0.6,
                opacity: star.opacity,
              },
            ]}
          />
        ))}
      </Animated.View>

      <LinearGradient
        colors={['rgba(1, 3, 8, 0.82)', 'rgba(2, 5, 12, 0.18)', 'rgba(1, 3, 8, 0.86)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.vignette}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  nebulaLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  nebula: {
    position: 'absolute',
    borderRadius: 999,
  },
  nebulaBlue: {
    left: '4%',
    top: '8%',
    width: 520,
    height: 520,
    backgroundColor: 'rgba(62, 103, 160, 0.12)',
  },
  nebulaWhite: {
    right: '10%',
    top: '12%',
    width: 420,
    height: 420,
    backgroundColor: 'rgba(201, 217, 241, 0.1)',
  },
  nebulaAmber: {
    right: '2%',
    bottom: '8%',
    width: 420,
    height: 420,
    backgroundColor: 'rgba(176, 130, 73, 0.1)',
  },
  nebulaDust: {
    left: '28%',
    bottom: '4%',
    width: 620,
    height: 300,
    backgroundColor: 'rgba(78, 88, 113, 0.08)',
  },
  starLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#f6fbff',
  },
  starNear: {
    backgroundColor: '#ffffff',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
  },
});
