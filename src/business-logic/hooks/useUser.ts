import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { userService } from '../api/services/userService';
import { useUserStore } from '../stores/userStore';

/**
 * Fetches the current user from the API and syncs into userStore.
 * Mount this once at the app root (e.g. _layout.tsx).
 */
export function useUser() {
  const { setUser, isAuthenticated } = useUserStore();

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userService.getMe(),
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 2,
  });

  // Sync API response → Zustand store
  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  return { user, isLoading, isError, isAuthenticated };
}
