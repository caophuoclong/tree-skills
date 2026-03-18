import { useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../api/supabase';
import { useUserStore } from '../stores/userStore';
import type { ProfileRow } from '../api/supabase/database.types';

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Core auth hook — listens to Supabase session changes.
 * Mount once at app root (_layout.tsx). Populates userStore on sign-in.
 */
export function useAuth(): AuthState {
  const { setUser, logout } = useUserStore();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Load current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        fetchProfile(data.session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // 2. Subscribe to auth state changes (sign in, sign out, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
        logout(); // clear Zustand store on sign out
        setIsLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setProfile(data);
      // Sync Supabase profile → Zustand userStore
      setUser({
        user_id: data.id,
        name: data.name,
        avatar_url: data.avatar_url,
        level: data.level,
        total_xp: data.total_xp,
        current_xp_in_level: data.current_xp_in_level,
        xp_to_next_level: data.xp_to_next_level,
        streak: data.streak,
        best_streak: data.best_streak,
        stamina: data.stamina,
        last_active_date: data.last_active_date,
        last_login_at: new Date().toISOString(),
        onboarding_done: data.onboarding_done,
      });
    }
    setIsLoading(false);
  }

  return {
    session,
    user: session?.user ?? null,
    profile,
    isLoading,
    isAuthenticated: !!session,
  };
}
