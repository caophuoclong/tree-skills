import React, { useEffect, useRef, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../business-logic/stores/userStore';
import { useTheme } from '../tokens';


const { width } = Dimensions.get('window');

export function LevelUpModal() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { levelUpReward, setLevelUpReward } = useUserStore();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (levelUpReward) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [levelUpReward, scaleAnim, opacityAnim]);

  if (!levelUpReward) return null;

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLevelUpReward(null);
    });
  };

  return (
    <Modal transparent visible={!!levelUpReward} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Decorative elements */}
          <View style={styles.sparkleContainer}>
             <Ionicons name="sparkles" size={80} color={colors.softskills} style={styles.bgSparkle} />
          </View>

          <View style={styles.iconCircle}>
            <Ionicons name="trophy" size={50} color="#FFFFFF" />
          </View>

          <Text style={styles.congratsText}>CHÚC MỪNG!</Text>
          <Text style={styles.levelText}>BẠN ĐÃ ĐẠT CẤP {levelUpReward.level}</Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.messageText}>{levelUpReward.message}</Text>
          
          <View style={styles.unlockCard}>
            <Ionicons name="lock-open" size={20} color={colors.finance} />
            <Text style={styles.unlockText}>{levelUpReward.unlocks}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>TIẾP TỤC HÀNH TRÌNH</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
    backgroundColor: colors.bgSurface,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  sparkleContainer: {
    position: 'absolute',
    top: -40,
    zIndex: -1,
  },
  bgSparkle: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.brandPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  congratsText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.brandGlow,
    letterSpacing: 4,
    marginBottom: 8,
  },
  levelText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  unlockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  unlockText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk-SemiBold', fontWeight: '600',
    color: colors.finance,
  },
  button: {
    width: '100%',
    height: 60,
    backgroundColor: colors.brandPrimary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
