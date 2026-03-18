/**
 * XPShimmerBar — animated XP progress bar with shimmer effect
 *
 * A thin progress bar that loops a white shimmer highlight across
 * the filled portion, giving a satisfying "live" feel to XP tracking.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';

export interface XPShimmerBarProps {
  /** 0–100 fill percentage */
  percent: number;
  /** Fill color */
  color: string;
}

export function XPShimmerBar({ percent, color }: XPShimmerBarProps) {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 2,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 2],
    outputRange: [-120, 120],
  });

  const clamp = Math.min(100, Math.max(0, percent));

  return (
    <View style={styles.track}>
      {/* Filled portion */}
      <View
        style={[
          styles.fill,
          { width: `${clamp}%` as any, backgroundColor: color },
        ]}
      />
      {/* Shimmer — clipped to fill width */}
      <Animated.View
        style={[styles.shimmerClip, { width: `${clamp}%` as any }]}
      >
        <Animated.View
          style={[
            styles.shimmerBeam,
            { transform: [{ translateX }, { skewX: '-20deg' }] },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = {
  track: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 3,
    overflow: 'hidden' as const,
    marginTop: 8,
  },
  fill: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  shimmerClip: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden' as const,
    borderRadius: 3,
  },
  shimmerBeam: {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
};
