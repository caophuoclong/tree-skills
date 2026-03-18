import { useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../api/supabase';
import { useUserStore } from '../stores/userStore';
import { queryClient } from '../api/query-client';

interface SignOutResult {
  isLoading: boolean;
  signOut: () => Promise<void>;
}

/**
 * Hook for signing out.
 * Clears Supabase session, Zustand stores, and TanStack Query cache.
 */
export function useSignOut(): SignOutResult {
  const [isLoading, setIsLoading] = useState(false);
  const { logout } = useUserStore();

  const signOut = async () => {
    setIsLoading(true);

    // 1. Sign out from Supabase
    await supabase.auth.signOut();

    // 2. Clear all app state
    logout();                         // clears userStore
    queryClient.clear();              // clears all TanStack Query cache

    setIsLoading(false);

    // 3. Redirect to auth
    router.replace('/(auth)/login');
  };

  return { isLoading, signOut };
}
