import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, Dimensions } from 'react-native';
import { useTheme } from '@/src/ui/tokens';

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 15;
const ANIMATION_DURATION = 1500;

interface Particle {
  id: number;
  translateX: Animated.Value;
  translateY: Animated.Value;
  opacity: Animated.Value;
  rotation: Animated.Value;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

interface Props {
  visible: boolean;
}

export function ConfettiOverlay({ visible }: Props) {
  const { colors } = useTheme();
  const particlesRef = useRef<Particle[]>([]);

  const colorPalette = useMemo(() => [
    colors.brandPrimary, // #7C6AF7
    colors.warning,      // typically #FBBF24
    colors.softskills,   // typically #F472B6
    colors.success,      // typically #34D399
  ], [colors]);

  // Initialize particles
  useEffect(() => {
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      id: i,
      translateX: new Animated.Value(0),
      translateY: new Animated.Value(0),
      opacity: new Animated.Value(1),
      rotation: new Animated.Value(0),
      color: colorPalette[i % colorPalette.length],
      size: 6 + Math.random() * 8, // 6-14px
      angle: (i / PARTICLE_COUNT) * Math.PI * 2,
      speed: 80 + Math.random() * 120, // random speed
    }));
  }, [colorPalette]);

  useEffect(() => {
    if (!visible) return;

    const animations = particlesRef.current.map((particle) => {
      // Reset values
      particle.translateX.setValue(0);
      particle.translateY.setValue(0);
      particle.opacity.setValue(1);
      particle.rotation.setValue(0);

      const distance = particle.speed;
      const radians = particle.angle + (Math.random() - 0.5) * 0.4;
      const endX = Math.cos(radians) * distance;
      const endY = Math.sin(radians) * distance - 100; // bias upward

      return Animated.sequence([
        Animated.parallel([
          Animated.timing(particle.translateX, {
            toValue: endX,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(particle.translateY, {
            toValue: endY,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(particle.rotation, {
            toValue: Math.random() * 720,
            duration: ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(particle.opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.stagger(50, animations).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        overflow: 'hidden',
      }}
    >
      {particlesRef.current.map((particle) => (
        <Animated.View
          key={particle.id}
          style={{
            position: 'absolute',
            left: width / 2 - particle.size / 2,
            top: height / 2 - particle.size / 2,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: 4,
            transform: [
              { translateX: particle.translateX },
              { translateY: particle.translateY },
              { rotate: particle.rotation.interpolate({
                inputRange: [0, 360],
                outputRange: ['0deg', '360deg'],
              }) },
            ],
            opacity: particle.opacity,
          }}
        />
      ))}
    </View>
  );
}
