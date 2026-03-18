import { useCallback } from 'react';
import { useCustomSkillTreeStore } from '@/src/business-logic/stores/customSkillTreeStore';
import { useSkillTreeStore } from '@/src/business-logic/stores/skillTreeStore';

export function useSkillBuilderEditor() {
  const { currentDraft, addCluster, removeCluster, confirmDraft, discardDraft } = useCustomSkillTreeStore();
  const { nodes, setNodes } = useSkillTreeStore();

  const getTotalSkills = useCallback(() => {
    if (!currentDraft) return 0;
    return currentDraft.clusters.reduce((s, c) => s + c.skills.length, 0);
  }, [currentDraft]);

  const getTotalQuests = useCallback(() => {
    if (!currentDraft) return 0;
    return currentDraft.clusters.reduce((s, c) => s + c.skills.reduce((q, sk) => q + sk.quests.length, 0), 0);
  }, [currentDraft]);

  const handleConfirmDraft = useCallback(
    (onSuccess: () => void) => {
      confirmDraft((_nodeIds, draft) => {
        const newNodes = draft.clusters.flatMap((cluster) =>
          cluster.skills.map((skill) => ({
            node_id: `custom_${skill.id}`,
            branch: skill.branch,
            tier: cluster.tier,
            title: skill.title,
            description: skill.description || `Lộ trình: ${draft.goal}`,
            status: 'locked' as const,
            xp_required: skill.duration_weeks === 1 ? 50 : 100,
            quests_total: skill.quests.length,
            quests_completed: 0,
          })),
        );
        setNodes([...nodes, ...newNodes]);
      });
      onSuccess();
    },
    [confirmDraft, nodes, setNodes],
  );

  return {
    currentDraft,
    addCluster,
    removeCluster,
    discardDraft,
    handleConfirmDraft,
    getTotalSkills,
    getTotalQuests,
  };
}
