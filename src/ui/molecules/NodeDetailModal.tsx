/**
 * NodeDetailModal — Modal sheet for displaying node details
 *
 * Shows node status, title, description, stats, and lock state.
 * Uses NB styling with branch-specific colors.
 */
import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { NeoBrutalAccent, NeoBrutalBox } from '@/src/ui/atoms';
import { useTheme } from '@/src/ui/tokens';
import { Radius, Spacing } from '@/src/ui/tokens/spacing';
import { Ionicons } from '@expo/vector-icons';
import type { SkillNode, NodeStatus } from '@/src/business-logic/types';

const STATUS_LABELS: Record<NodeStatus, string> = {
  locked: 'Đã khóa',
  in_progress: 'Đang học',
  completed: 'Hoàn thành',
};

const getStatusColors = (colors: any): Record<NodeStatus, string> => ({
  locked: colors.textMuted,
  in_progress: colors.brandPrimary,
  completed: colors.success,
});

export interface NodeDetailModalProps {
  node: SkillNode | null;
  branchColor: string;
  visible: boolean;
  onClose: () => void;
}

export function NodeDetailModal({
  node,
  branchColor,
  visible,
  onClose,
}: NodeDetailModalProps) {
  const { colors } = useTheme();
  const STATUS_COLORS = useMemo(() => getStatusColors(colors), [colors]);
  const styles = useMemo(() => createStyles(colors), [colors]);

  if (!node) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={[styles.modalSheet, { borderColor: branchColor }]}
          onPress={() => {}}
        >
          {/* NB accent strip */}
          <View
            style={[
              styles.sheetAccentStrip,
              { backgroundColor: branchColor },
            ]}
          />
          {/* Drag handle */}
          <View style={styles.sheetHandle} />

          {/* Status badge */}
          <View style={styles.modalStatusRow}>
            <NeoBrutalBox
              borderColor={`${STATUS_COLORS[node.status]}60`}
              backgroundColor={`${STATUS_COLORS[node.status]}18`}
              shadowColor={STATUS_COLORS[node.status]}
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderWidth={1.5}
              borderRadius={9999}
              contentStyle={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 5,
              }}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: STATUS_COLORS[node.status] },
                ]}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: 'SpaceGrotesk-Bold',
                  fontWeight: '700',
                  color: STATUS_COLORS[node.status],
                }}
              >
                {STATUS_LABELS[node.status]}
              </Text>
            </NeoBrutalBox>
          </View>

          {/* Node title */}
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
            {node.title}
          </Text>

          {/* Description */}
          <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
            {node.description}
          </Text>

          {/* Stats row */}
          <NeoBrutalBox
            borderColor={`${branchColor}40`}
            backgroundColor={colors.bgElevated}
            shadowColor={branchColor}
            shadowOffsetX={3}
            shadowOffsetY={3}
            borderWidth={1.5}
            borderRadius={12}
            contentStyle={styles.modalStats}
          >
            <View style={styles.statItem}>
              <Ionicons
                name="flash"
                size={14}
                color={colors.brandPrimary}
              />
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                {node.xp_required} XP cần thiết
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: colors.glassBorder },
              ]}
            />
            <View style={styles.statItem}>
              <Ionicons name="list" size={14} color={branchColor} />
              <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                {node.quests_completed}/{node.quests_total} nhiệm vụ
              </Text>
            </View>
          </NeoBrutalBox>

          {/* Locked message */}
          {node.status === 'locked' && (
            <NeoBrutalBox
              borderColor={`${colors.textMuted}40`}
              backgroundColor={colors.bgElevated}
              shadowColor="#000"
              shadowOffsetX={2}
              shadowOffsetY={2}
              borderWidth={1.5}
              borderRadius={10}
              contentStyle={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                gap: 8,
                padding: 12,
              }}
            >
              <Ionicons
                name="lock-closed"
                size={14}
                color={colors.textMuted}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textMuted,
                  flex: 1,
                  lineHeight: 18,
                }}
              >
                Chưa mở khóa — hoàn thành các nút trước để tiếp tục
              </Text>
            </NeoBrutalBox>
          )}

          {/* Close button */}
          <NeoBrutalAccent
            accentColor={`${branchColor}18`}
            strokeColor={branchColor}
            shadowOffsetX={3}
            shadowOffsetY={3}
            borderWidth={2}
            borderRadius={14}
            onPress={onClose}
            contentStyle={{
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'SpaceGrotesk-Bold',
                fontWeight: '700',
                color: branchColor,
              }}
            >
              Đóng
            </Text>
          </NeoBrutalAccent>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.bgElevated,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.xl,
      gap: Spacing.md,
      borderWidth: 2,
      overflow: 'hidden',
    },
    sheetAccentStrip: {
      height: 4,
      marginHorizontal: -Spacing.lg,
      marginBottom: 0,
    },
    sheetHandle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: 'rgba(255,255,255,0.14)',
      alignSelf: 'center',
      marginTop: 12,
    },
    modalStatusRow: {
      flexDirection: 'row',
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: Radius.full,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'SpaceGrotesk-Bold',
      fontWeight: '700',
    },
    modalDesc: {
      lineHeight: 22,
    },
    modalStats: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing.md,
      gap: Spacing.md,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      flex: 1,
    },
    statDivider: {
      width: 1,
      height: 20,
    },
  });
