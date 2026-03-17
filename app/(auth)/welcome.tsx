import { router } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/src/ui/tokens/colors';

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Center content ─────────────────────────────── */}
      <View style={styles.centerContent}>
        {/* Radial glow */}
        <View style={styles.glowOrb} />

        {/* App icon */}
        <View style={styles.appIcon}>
          <Text style={styles.appIconEmoji}>🌿</Text>
        </View>

        {/* Title + subtitle */}
        <Text style={styles.title}>Life Skill Tree</Text>
        <Text style={styles.subtitle}>Grow your skills. Level up your life.</Text>
      </View>

      {/* ── Buttons ────────────────────────────────────── */}
      <View style={styles.buttonsSection}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryBtnText}>I already have an account</Text>
        </TouchableOpacity>

        <Text style={styles.socialProof}>
          Join 10,000+ Gen Z building real skills
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },

  // Center content
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  glowOrb: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124,106,247,0.12)',
  },
  appIcon: {
    width: 64,
    height: 64,
    backgroundColor: Colors.bgElevated,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  appIconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Buttons section
  buttonsSection: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  primaryBtn: {
    backgroundColor: Colors.brandPrimary,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.brandPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 16,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtnText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  socialProof: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
});
