import { useState } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../api/supabase';
import { useUserStore } from '../stores/userStore';
import { queryClient } from '../api/query-client';

interface SignOutResult {
  isLoading: boolean;
  signOut: () => Promise<void>;
}

/**
 * Hook for signing out.
 * Clears Supabase session, Zustand stores, TanStack Query cache, and AsyncStorage.
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

    // 3. Clear AsyncStorage (Supabase session data)
    try {
      const keys = await AsyncStorage.getAllKeys();
      const supabaseKeys = keys.filter(k => k.startsWith('sb-'));
      if (supabaseKeys.length > 0) {
        await AsyncStorage.multiRemove(supabaseKeys);
      }
    } catch (e) {
      console.warn('[useSignOut] Failed to clear AsyncStorage:', e);
    }

    setIsLoading(false);

    // 4. Redirect to auth
    router.replace('/(auth)/login');
  };

  return { isLoading, signOut };
}
