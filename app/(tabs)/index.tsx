import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuestManager } from '@/src/business-logic/hooks/useQuestManager';
import { useGrowthStreak } from '@/src/business-logic/hooks/useGrowthStreak';
import { useStaminaSystem } from '@/src/business-logic/hooks/useStaminaSystem';
import { useSkillTreeStore } from '@/src/business-logic/stores/skillTreeStore';
import { useUserStore } from '@/src/business-logic/stores/userStore';
import { getDemoNodes } from '@/src/business-logic/data/skill-tree-nodes';
import { Colors } from '@/src/ui/tokens/colors';
import type { Branch } from '@/src/business-logic/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function useBranchProgress() {
  const { nodes } = useSkillTreeStore();
  const branches: Branch[] = ['career', 'finance', 'softskills', 'wellbeing'];
  return branches.map((branch) => {
    const branchNodes = nodes.filter((n) => n.branch === branch);
    if (branchNodes.length === 0) return { branch, percent: 0 };
    const completed = branchNodes.filter((n) => n.status === 'completed').length;
    return { branch, percent: Math.round((completed / branchNodes.length) * 100) };
  });
}

const BRANCH_COLORS: Record<string, string> = {
  career: Colors.career,
  finance: Colors.finance,
  softskills: Colors.softskills,
  wellbeing: Colors.wellbeing,
};

// ─── Progress Ring ────────────────────────────────────────────────────────────

interface ProgressRingProps {
  percent: number;
  color: string;
  label: string;
}

function ProgressRing({ percent, color, label }: ProgressRingProps) {
  return (
    <View style={styles.ringWrapper}>
      <View
        style={[
          styles.ring,
          {
            borderColor: color,
            shadowColor: color,
            backgroundColor: `${color}10`, // Subtle fill
          },
          percent > 50 && {
            shadowOpacity: 0.6,
            shadowRadius: 10,
          }
        ]}
      >
        <Text style={[styles.ringPercent, { color, fontWeight: '800' }]}>{percent}%</Text>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { user } = useUserStore();
  const { quests } = useQuestManager();
  const { streak } = useGrowthStreak();
  const { stamina } = useStaminaSystem();
  const { nodes, setNodes } = useSkillTreeStore();
  const [notifVisible, setNotifVisible] = React.useState(false);
  const branchProgress = useBranchProgress();

  // Seed demo progress data so rings display realistic values immediately
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes(getDemoNodes());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const name = user?.name ?? 'Alex Kim';
  const level = user?.level ?? 4;
  const currentXP = user?.current_xp_in_level ?? 1240;
  const targetXP = user?.xp_to_next_level ?? 1500;
  const checkDailyLogin = useUserStore((s) => s.checkDailyLogin);

  useEffect(() => {
    checkDailyLogin();
  }, [checkDailyLogin]);

  const xpPercent = (currentXP / targetXP) * 100;
  const pendingCount = quests.filter((q) => q.completed_at === null).length;

  const careerPct = branchProgress.find((b) => b.branch === 'career')?.percent ?? 0;
  const financePct = branchProgress.find((b) => b.branch === 'finance')?.percent ?? 0;
  const softskillsPct = branchProgress.find((b) => b.branch === 'softskills')?.percent ?? 0;
  const wellbeingPct = branchProgress.find((b) => b.branch === 'wellbeing')?.percent ?? 0;

  // Mock notifications
  const notifications = [
    { id: 1, title: 'Chuỗi mới!', body: 'Bạn đã đạt chuỗi 3 ngày liên tiếp. Tiếp tục phát huy nhé!', time: '2h trước', icon: 'flame', color: Colors.warning },
    { id: 2, title: 'Nhiệm vụ mới', body: '3 nhiệm vụ Sự nghiệp đã được làm mới.', time: '5h trước', icon: 'flash', color: Colors.career },
    { id: 3, title: 'Nhắc nhở', body: 'Đừng quên check-in tâm trạng hôm nay.', time: '1 ngày trước', icon: 'happy', color: Colors.wellbeing },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
              </View>
              <View style={styles.avatarMeta}>
                <Text style={styles.levelLabel}>CẤP {level}</Text>
                <Text style={styles.userName}>{name}</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setNotifVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => Alert.alert('Cài đặt', 'Tính năng đang được phát triển.')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── LIFE SKILLS section ─────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>KỸ NĂNG SỐNG</Text>

          <View style={styles.bentoRow}>
            {/* Left card: 2x2 progress rings */}
            <View style={[styles.bentoCard, styles.bentoCardLeft]}>
              <View style={styles.ringsGrid}>
                <ProgressRing percent={careerPct} color={Colors.career} label="Sự nghiệp" />
                <ProgressRing percent={financePct} color={Colors.finance} label="Tài chính" />
                <ProgressRing percent={softskillsPct} color={Colors.softskills} label="Kỹ năng" />
                <ProgressRing percent={wellbeingPct} color={Colors.wellbeing} label="Sức khỏe" />
              </View>
            </View>

            {/* Right column */}
            <View style={styles.bentoRight}>
              {/* Streak card */}
              <View style={[styles.bentoCard, styles.bentoCardSmall, { borderColor: `${Colors.warning}40` }]}>
                <View style={[styles.accentBar, { backgroundColor: Colors.warning }]} />
                <Text style={styles.streakFire}>🔥</Text>
                <Text style={styles.streakNumber}>{streak || 12}</Text>
                <Text style={styles.streakLabel}>CHUỖI NGÀY</Text>
              </View>

              {/* Mental Energy card */}
              <View style={[styles.bentoCard, styles.bentoCardSmall, { borderColor: `${Colors.finance}40` }]}>
                <View style={[styles.accentBar, { backgroundColor: Colors.finance }]} />
                <Text style={styles.energyLabel}>⚡ NĂNG LƯỢNG TINH THẦN</Text>
                <View style={styles.energyBarTrack}>
                  <View
                    style={[
                      styles.energyBarFill,
                      { width: `${stamina}%` as any, backgroundColor: stamina < 30 ? Colors.danger : stamina < 70 ? Colors.warning : Colors.finance },
                    ]}
                  />
                </View>
                <View style={styles.energyInfoRow}>
                  <Text style={styles.energyLabelSmall}>THỂ LỰC</Text>
                  <Text style={[styles.energyPercent, { color: stamina < 30 ? Colors.danger : stamina < 70 ? Colors.warning : Colors.finance }]}>{stamina}%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Second bento row */}
          <View style={styles.bentoRow2}>
            {/* Quests card */}
            <View style={[styles.bentoCard, styles.bentoCard2Left]}>
              <Text style={styles.card2Label}>NHIỆM VỤ</Text>
              <Text style={styles.card2Number}>{pendingCount || 3}</Text>
              <Text style={styles.card2Sub}>Đang chờ</Text>
              <View style={styles.dotRow}>
                <View style={[styles.dot, { backgroundColor: Colors.career }]} />
                <View style={[styles.dot, { backgroundColor: Colors.finance }]} />
                <View style={[styles.dot, { backgroundColor: Colors.wellbeing }]} />
              </View>
            </View>

            {/* Experience card */}
            <View style={[styles.bentoCard, styles.bentoCard2Right, { borderColor: `${Colors.brandPrimary}40` }]}>
              <View style={[styles.accentBar, { backgroundColor: Colors.brandPrimary }]} />
              <View style={styles.xpHeaderRow}>
                <Text style={styles.card2Label}>KINH NGHIỆM</Text>
                <View style={styles.levelPill}>
                  <Text style={styles.levelPillText}>CẤP {level}</Text>
                </View>
              </View>
              <Text style={styles.xpValue}>
                {currentXP.toLocaleString()} / {targetXP.toLocaleString()} XP
              </Text>
              <Text style={styles.xpNextLabel}>TIẾP THEO: CẤP {level + 1}</Text>
              <View style={styles.xpBarTrack}>
                <View
                  style={[styles.xpBarFill, { width: `${xpPercent}%` as any }]}
                />
              </View>
              <Text style={styles.xpUntilLabel}>
                Còn {targetXP - currentXP} XP nữa để lên cấp
              </Text>
            </View>
          </View>
        </View>

        {/* ── Suggested banner ────────────────────────────────── */}
        <TouchableOpacity
          style={styles.suggestedBanner}
          onPress={() => router.push('/(tabs)/quests')}
          activeOpacity={0.9}
        >
          <View style={styles.suggestedLeft}>
            <Text style={styles.suggestedStar}>✦</Text>
            <View style={styles.suggestedText}>
              <Text style={styles.suggestedTitle}>Gợi ý: Networking</Text>
              <Text style={styles.suggestedSub}>
                Kết nối với 2 người hướng dẫn để nhận +50 XP
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* ── Today's Quests Preview (E4/B2) ─────────────────── */}
        <View style={styles.questPreviewSection}>
          <View style={styles.questPreviewHeader}>
            <Text style={styles.sectionLabel}>NHIỆM VỤ HÔM NAY</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/quests')}>
              <Text style={styles.viewAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          {quests.slice(0, 3).map((quest) => (
            <TouchableOpacity
              key={quest.quest_id}
              style={styles.miniQuestCard}
              onPress={() => router.push(`/quest/${quest.quest_id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.miniQuestContent}>
                <View style={[styles.miniQuestDot, { backgroundColor: BRANCH_COLORS[quest.branch] ?? Colors.brandPrimary }]} />
                <Text style={styles.miniQuestTitle} numberOfLines={1}>{quest.title}</Text>
              </View>
              <View style={styles.miniQuestXP}>
                <Text style={styles.miniQuestXPText}>+{quest.xp_reward} XP</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* ── Notification Center Modal (E7) ───────────────── */}
      <Modal
        visible={notifVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotifVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setNotifVisible(false)}
        >
          <View style={styles.notifContent}>
            <View style={styles.notifHeader}>
              <Text style={styles.notifHeaderTitle}>Thông báo</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Ionicons name="close-circle" size={28} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.map((notif) => (
                <View key={notif.id} style={styles.notifItem}>
                  <View style={[styles.notifIcon, { backgroundColor: `${notif.color}20` }]}>
                    <Ionicons name={notif.icon as any} size={20} color={notif.color} />
                  </View>
                  <View style={styles.notifText}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifBody}>{notif.body}</Text>
                    <Text style={styles.notifTime}>{notif.time}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bgBase,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.bgSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  avatarInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.brandPrimary,
  },
  avatarMeta: {
    gap: 2,
  },
  levelLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.brandPrimary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Section
  section: {
    marginTop: 0,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // Bento row 1
  bentoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  bentoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Glass transparency
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden', // For accent bar
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  bentoCardLeft: {
    flex: 1.4,
  },
  bentoRight: {
    flex: 1,
    gap: 12,
  },
  bentoCardSmall: {
    flex: 1,
    padding: 12,
  },

  // Progress rings grid
  ringsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  ringWrapper: {
    alignItems: 'center',
    width: '46%',
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  ringPercent: {
    fontSize: 15,
    fontWeight: '700',
  },
  ringLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },

  // Streak card
  streakFire: {
    fontSize: 22,
  },
  streakNumber: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 34,
  },
  streakLabel: {
    fontSize: 9,
    fontWeight: '700', // Stronger hierarchy
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // Energy card
  energyLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  energyBarTrack: {
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  energyBarFill: {
    height: 4,
    backgroundColor: Colors.finance,
    borderRadius: 2,
  },
  energyPercent: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.finance,
  },
  energyInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  energyLabelSmall: {
    fontSize: 8,
    fontWeight: '600',
    color: Colors.textMuted,
  },

  // Bento row 2
  bentoRow2: {
    flexDirection: 'row',
    gap: 12,
  },
  bentoCard2Left: {
    flex: 1,
  },
  bentoCard2Right: {
    flex: 1.6,
  },

  // Quests card
  card2Label: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  card2Number: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 36,
  },
  card2Sub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // XP card
  xpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  levelPill: {
    backgroundColor: Colors.brandPrimary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  xpValue: {
    fontSize: 16, // Larger for Clash Display effect
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  xpNextLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  xpBarTrack: {
    height: 4,
    backgroundColor: Colors.bgElevated,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  xpBarFill: {
    height: 4,
    backgroundColor: Colors.brandPrimary,
    borderRadius: 2,
  },
  xpUntilLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 4,
  },

  // Suggested banner
  suggestedBanner: {
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.brandPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  suggestedStar: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  suggestedText: {
    flex: 1,
  },
  suggestedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  suggestedSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  // Quests Preview
  questPreviewSection: {
    marginTop: 24,
  },
  questPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.brandPrimary,
    marginBottom: 8,
  },
  miniQuestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgSurface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  miniQuestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  miniQuestDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  miniQuestTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    flex: 1,
  },
  miniQuestXP: {
    backgroundColor: 'rgba(251,191,36,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  miniQuestXPText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.softskills,
  },

  // Bottom
  bottomSpacer: {
    height: 100,
  },
  // Modal / Notifications
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  notifContent: {
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  notifHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  notifItem: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: {
    flex: 1,
    gap: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  notifBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
