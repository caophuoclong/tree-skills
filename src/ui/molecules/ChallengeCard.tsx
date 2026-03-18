import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/src/ui/tokens';
import { useChallengeStore } from '@/src/business-logic/stores/challengeStore';
import type { Challenge } from '@/src/business-logic/data/challenge-library';

const BRANCH_COLORS: Record<string, string> = {
  career: '#4DA8FF',
  finance: '#34D399',
  softskills: '#FBBF24',
  wellbeing: '#F472B6',
};

interface Props {
  challenge: Challenge;
}

export function ChallengeCard({ challenge }: Props) {
  const { colors } = useTheme();
  const {
    activeChallenges,
    progress,
    joinChallenge,
    leaveChallenge,
    isCompleted,
    isExpired,
  } = useChallengeStore();

  const isJoined = activeChallenges.includes(challenge.id);
  const current = progress[challenge.id] ?? 0;
  const pct = Math.min((current / challenge.targetCount) * 100, 100);
  const expired = isExpired(challenge.id);
  const completed = isCompleted(challenge.id);
  const branchColor = BRANCH_COLORS[challenge.branch] ?? colors.brandPrimary;

  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(challenge.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
  );

  return (
    <View style={[styles.wrapper, { opacity: expired && !completed ? 0.5 : 1 }]}>
      {/* NB hard shadow */}
      <View style={[styles.shadow, { backgroundColor: colors.textPrimary }]} />
      <View
        style={[
          styles.card,
          { backgroundColor: colors.bgSurface, borderColor: colors.textPrimary },
        ]}
      >
        {/* Branch accent bar */}
        <View style={[styles.accentBar, { backgroundColor: branchColor }]} />

        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: colors.textPrimary,
                fontFamily: 'SpaceGrotesk-Bold',
              },
            ]}
          >
            {challenge.title}
          </Text>
          <Text
            style={[
              styles.desc,
              {
                color: colors.textSecondary,
                fontFamily: 'SpaceGrotesk-Regular',
              },
            ]}
          >
            {challenge.description}
          </Text>

          {/* Progress bar */}
          <View
            style={[
              styles.barBg,
              {
                backgroundColor: colors.bgElevated,
                borderColor: colors.textPrimary,
              },
            ]}
          >
            <View
              style={[
                styles.barFill,
                { width: `${pct}%` as any, backgroundColor: branchColor },
              ]}
            />
          </View>
          <Text
            style={[
              styles.progressLabel,
              {
                color: colors.textMuted,
                fontFamily: 'SpaceMono-Bold',
              },
            ]}
          >
            {current}/{challenge.targetCount} quests
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            {expired ? (
              <Text
                style={[
                  styles.endedLabel,
                  {
                    color: colors.textMuted,
                    fontFamily: 'SpaceGrotesk-Regular',
                  },
                ]}
              >
                Ended
              </Text>
            ) : completed ? (
              <Text
                style={[
                  styles.doneLabel,
                  { color: colors.success, fontFamily: 'SpaceGrotesk-Bold' },
                ]}
              >
                ✓ Complete!
              </Text>
            ) : (
              <Text
                style={[
                  styles.daysLeft,
                  {
                    color: colors.textMuted,
                    fontFamily: 'SpaceGrotesk-Regular',
                  },
                ]}
              >
                {daysLeft}d left
              </Text>
            )}

            {!expired && !completed && (
              <TouchableOpacity
                style={[
                  styles.joinBtn,
                  {
                    backgroundColor: isJoined
                      ? colors.bgElevated
                      : branchColor,
                    borderColor: colors.textPrimary,
                  },
                ]}
                onPress={() =>
                  isJoined
                    ? leaveChallenge(challenge.id)
                    : joinChallenge(challenge.id)
                }
              >
                <View
                  style={[
                    styles.joinShadow,
                    { backgroundColor: colors.textPrimary },
                  ]}
                />
                <Text
                  style={[
                    styles.joinBtnText,
                    {
                      color: isJoined ? colors.textPrimary : '#fff',
                      fontFamily: 'SpaceGrotesk-Bold',
                    },
                  ]}
                >
                  {isJoined ? 'Leave' : 'Join'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'relative', width: 260, marginRight: 14 },
  shadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    borderRadius: 14,
  },
  card: { borderWidth: 2, borderRadius: 14, overflow: 'hidden' },
  accentBar: { height: 4, width: '100%' },
  content: { padding: 14, gap: 8 },
  title: { fontSize: 15 },
  desc: { fontSize: 12, lineHeight: 17 },
  barBg: { height: 10, borderRadius: 5, borderWidth: 1.5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  progressLabel: { fontSize: 11 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  daysLeft: { fontSize: 12 },
  endedLabel: { fontSize: 12 },
  doneLabel: { fontSize: 13 },
  joinBtn: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    position: 'relative',
  },
  joinShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderRadius: 8,
    zIndex: -1,
  },
  joinBtnText: { fontSize: 13 },
});
