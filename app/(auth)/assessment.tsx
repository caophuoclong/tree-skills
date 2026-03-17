import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboarding } from '@/src/business-logic/hooks/useOnboarding';
import { Colors } from '@/src/ui/tokens/colors';
import type { Branch } from '@/src/business-logic/types';

// ─── Branch config ───────────────────────────────────────────────────────────

const BRANCH_COLORS: Record<Branch, string> = {
  career: Colors.career,
  finance: Colors.finance,
  softskills: Colors.softskills,
  wellbeing: Colors.wellbeing,
};

const BRANCH_ICONS: Record<Branch, string> = {
  career: '🚀',
  finance: '💰',
  softskills: '💬',
  wellbeing: '🧘',
};

const BRANCH_TITLES: Record<Branch, string> = {
  career: 'Build my career skills',
  finance: 'Get my finances in order',
  softskills: 'Improve how I communicate',
  wellbeing: 'Feel more mentally balanced',
};

const BRANCH_SUBTITLES: Record<Branch, string> = {
  career: 'Professional growth & expertise',
  finance: 'Budgeting & wealth building',
  softskills: 'Social skills & networking',
  wellbeing: 'Mindfulness & stress management',
};

// ─── Option Card ─────────────────────────────────────────────────────────────

interface OptionCardProps {
  branch: Branch;
  selected: boolean;
  onPress: () => void;
}

function OptionCard({ branch, selected, onPress }: OptionCardProps) {
  const color = BRANCH_COLORS[branch];
  return (
    <TouchableOpacity
      style={[
        styles.optionCard,
        selected && {
          borderWidth: 2,
          borderColor: color,
        },
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      activeOpacity={0.85}
    >
      <View
        style={[
          styles.optionIconCircle,
          { backgroundColor: `${color}26` },
        ]}
      >
        <Text style={styles.optionIcon}>{BRANCH_ICONS[branch]}</Text>
      </View>
      <View style={styles.optionTextCol}>
        <Text style={styles.optionTitle}>{BRANCH_TITLES[branch]}</Text>
        <Text style={styles.optionSubtitle}>{BRANCH_SUBTITLES[branch]}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AssessmentScreen() {
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    canGoBack,
    selectAnswer,
    goBack,
  } = useOnboarding();

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const branches: Branch[] = ['career', 'finance', 'softskills', 'wellbeing'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Header row ────────────────────────────────────── */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={canGoBack ? goBack : undefined}
          activeOpacity={canGoBack ? 0.7 : 1}
        >
          <Ionicons
            name="chevron-back"
            size={20}
            color={canGoBack ? Colors.textSecondary : 'transparent'}
          />
          {canGoBack && (
            <Text style={styles.backText}>Back</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.stepLabel}>
          STEP {currentIndex + 1} OF {totalQuestions}
        </Text>
      </View>

      {/* ── Progress bar ──────────────────────────────────── */}
      <View style={styles.progressTrack}>
        <View
          style={[styles.progressFill, { width: `${progressPercent}%` as any }]}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title ────────────────────────────────────────── */}
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>
            What's your biggest goal{' '}
            <Text style={styles.titleAccent}>right now?</Text>
          </Text>
        </View>
        <Text style={styles.titleSub}>
          Select one to customize your skill tree path.
        </Text>

        {/* ── Options ──────────────────────────────────────── */}
        <View style={styles.optionsContainer}>
          {branches.map((branch) => (
            <OptionCard
              key={branch}
              branch={branch}
              selected={selectedBranch === branch}
              onPress={() => {
                setSelectedBranch(branch);
                selectAnswer(branch);
              }}
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },

  // Loading
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },

  // Header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 60,
  },
  backText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },

  // Progress
  progressTrack: {
    height: 3,
    backgroundColor: Colors.bgElevated,
    marginHorizontal: 20,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 0,
  },
  progressFill: {
    height: 3,
    backgroundColor: Colors.brandPrimary,
    borderRadius: 2,
  },

  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },

  // Title
  titleRow: {
    marginBottom: 8,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  titleAccent: {
    color: Colors.brandPrimary,
  },
  titleSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },

  // Options
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.bgSurface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionIcon: {
    fontSize: 22,
  },
  optionTextCol: {
    flex: 1,
    marginLeft: 14,
    gap: 2,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  optionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
