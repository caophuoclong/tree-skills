import { useCallback } from 'react';
import { useUserStore } from '../stores/userStore';
import type { Branch } from '../types';

export type StaminaStatus = 'ok' | 'warning' | 'debuff' | 'gate';

export interface StaminaInfo {
  status: StaminaStatus;
  stamina: number;
  xpMultiplier: number;
  isGated: (branch: Branch) => boolean;
  canComplete: (branch: Branch) => boolean;
  onQuestComplete: (branch: Branch) => void;
  onQuestFail: () => void;
  recoverStamina: (amount: number) => void;
}

const STAMINA_DRAIN_CAREER_FINANCE = 10;
const STAMINA_DRAIN_WELLBEING = -8; // wellbeing restores stamina
const STAMINA_FAIL_PENALTY = 5;
const STAMINA_WELLBEING_RESTORE = 15;

function getStatus(stamina: number): StaminaStatus {
  if (stamina === 0) return 'gate';
  if (stamina < 30) return 'debuff';
  if (stamina < 60) return 'warning';
  return 'ok';
}

function getXPMultiplier(status: StaminaStatus): number {
  switch (status) {
    case 'gate':
      return 0;
    case 'debuff':
      return 0.5;
    case 'warning':
      return 0.75;
    case 'ok':
      return 1;
  }
}

export function useStaminaSystem(): StaminaInfo {
  const { user, updateStamina } = useUserStore();

  const stamina = user?.stamina ?? 100;
  const status = getStatus(stamina);
  const xpMultiplier = getXPMultiplier(status);

  const isGated = useCallback(
    (branch: Branch): boolean => {
      const gatedBranches: Branch[] = ['career', 'finance'];
      return status === 'gate' && gatedBranches.includes(branch);
    },
    [status],
  );

  const canComplete = useCallback(
    (branch: Branch): boolean => {
      return !isGated(branch);
    },
    [isGated],
  );

  const onQuestComplete = useCallback(
    (branch: Branch) => {
      const isWellbeing = branch === 'wellbeing';
      const delta = isWellbeing ? -STAMINA_DRAIN_WELLBEING : STAMINA_DRAIN_CAREER_FINANCE;
      updateStamina(stamina - delta);
    },
    [stamina, updateStamina],
  );

  const onQuestFail = useCallback(() => {
    updateStamina(stamina - STAMINA_FAIL_PENALTY);
  }, [stamina, updateStamina]);

  const recoverStamina = useCallback(
    (amount: number) => {
      updateStamina(stamina + (amount ?? STAMINA_WELLBEING_RESTORE));
    },
    [stamina, updateStamina],
  );

  return {
    status,
    stamina,
    xpMultiplier,
    isGated,
    canComplete,
    onQuestComplete,
    onQuestFail,
    recoverStamina,
  };
}
