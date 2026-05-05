import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedImage = Animated.createAnimatedComponent(Image);
const GALAXY_PLATE = require('../../assets/images/home-galaxy-plate.jpg');

export function HomeGalaxyBackdrop() {
  const { width } = useWindowDimensions();
  const drift = useSharedValue(0);
  const pulse = useSharedValue(0);

  React.useEffect(() => {
    drift.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 62000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 62000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 36000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 36000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [drift, pulse]);

  const horizontalRange = Math.max(32, Math.min(112, width * 0.06));

  const galaxyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [horizontalRange * 0.35, horizontalRange * -1]) },
      { translateY: interpolate(drift.value, [0, 1], [22, 44]) },
      { scale: 1.14 + pulse.value * 0.02 },
    ],
    opacity: 1,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(drift.value, [0, 1], [horizontalRange * -0.25, horizontalRange * 0.45]) },
      { translateY: interpolate(drift.value, [0, 1], [36, 20]) },
      { scale: 1.22 + pulse.value * 0.015 },
    ],
    opacity: 0.46 + pulse.value * 0.05,
  }));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.baseFill} />

      <AnimatedImage
        source={GALAXY_PLATE}
        contentFit="cover"
        transition={0}
        cachePolicy="memory-disk"
        blurRadius={28}
        style={[styles.imageLayer, glowStyle]}
      />

      <AnimatedImage
        source={GALAXY_PLATE}
        contentFit="cover"
        transition={0}
        cachePolicy="memory-disk"
        style={[styles.imageLayer, galaxyStyle]}
      />

      <View pointerEvents="none" style={styles.tint} />

      <LinearGradient
        colors={['rgba(1, 4, 10, 0.6)', 'rgba(1, 4, 10, 0.08)', 'rgba(1, 4, 10, 0.56)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.verticalVignette}
      />
      <LinearGradient
        colors={['rgba(1, 4, 10, 0.42)', 'rgba(1, 4, 10, 0.02)', 'rgba(1, 4, 10, 0.42)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.horizontalVignette}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  baseFill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#03050a',
  },
  imageLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 12, 0.015)',
  },
  verticalVignette: {
    ...StyleSheet.absoluteFillObject,
  },
  horizontalVignette: {
    ...StyleSheet.absoluteFillObject,
  },
});
