import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '@/src/ui/tokens/colors';
import { useUserStore } from '@/src/business-logic/stores/userStore';

export function LoginBonusModal() {
  const reward = useUserStore((s) => s.loginBonusReward);
  const setReward = useUserStore((s) => s.setLoginBonusReward);
  const updateXP = useUserStore((s) => s.updateXP);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reward !== null) {
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
  }, [reward, opacityAnim, scaleAnim]);

  const handleClaim = () => {
    if (reward !== null) {
      updateXP(reward);
      setReward(null);
    }
  };

  if (reward === null) return null;

  return (
    <Modal transparent visible={reward !== null} animationType="none">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.glow} />
          <View style={styles.header}>
            <Text style={styles.emoji}>🎁</Text>
            <Text style={styles.title}>Quà tặng hằng ngày!</Text>
            <Text style={styles.subtitle}>
              Chào mừng bạn đã quay trở lại. Hãy nhận phần thưởng để bắt đầu ngày mới!
            </Text>
          </View>

          <View style={styles.rewardCard}>
            <View style={styles.xpCircle}>
              <Text style={styles.xpText}>+{reward}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.claimButton}
            onPress={handleClaim}
            activeOpacity={0.8}
          >
            <Text style={styles.claimButtonText}>NHẬN NGAY</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124,106,247,0.3)',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${Colors.brandPrimary}20`,
    zIndex: -1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  rewardCard: {
    width: '100%',
    aspectRatio: 1,
    maxHeight: 180,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  xpCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${Colors.softskills}20`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.softskills,
    shadowColor: Colors.softskills,
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  xpText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.softskills,
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.softskills,
    marginTop: -4,
  },
  claimButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.brandPrimary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brandPrimary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});
