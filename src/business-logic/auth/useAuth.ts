import type { Session, User } from "@supabase/supabase-js";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";
import type { Tables } from "../api/supabase/database.types";
import { computeLevel } from "../hooks/useXPEngine";
import { useUserStore } from "../stores/userStore";

type ProfileRow = Tables<"profiles">;

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: ProfileRow | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Navigate to login screen and clear auth state.
 * Called when refresh token expires or session is invalid.
 */
function handleAuthFailure() {
  const { logout } = useUserStore.getState();
  logout();
  // Navigate to welcome/login screen
  try {
    router.replace("/(auth)/welcome");
  } catch {
    // Router might not be ready yet, ignore
  }
}

/**
 * Core auth hook — listens to Supabase session changes.
 * Mount once at app root (_layout.tsx). Populates userStore on sign-in.
 */
export function useAuth(): AuthState {
  const { setUser, logout, setAuthLoading, setSessionReady } = useUserStore();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("[useAuth] Starting auth check...");
    setAuthLoading(true);

    // 1. Load current session on mount
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("[useAuth] getSession error:", error.message);
        setSession(null);
        setIsLoading(false);
        setAuthLoading(false);
        handleAuthFailure();
        return;
      }

      setSession(data.session);
      if (data.session?.user) {
        console.log(
          "[useAuth] Session found on mount, user:",
          data.session.user.id,
        );
        fetchProfile(data.session.user.id);
      } else {
        console.log(
          "[useAuth] No session found — redirecting to welcome",
        );
        handleAuthFailure();
      }
    });

    // 2. Subscribe to auth state changes (sign in, sign out, token refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log(
          "[useAuth] Auth state change:",
          event,
          "hasSession:",
          !!newSession,
        );
        setSession(newSession);

        if (event === "SIGNED_OUT") {
          console.log("[useAuth] User signed out");
          setProfile(null);
          logout();
          setIsLoading(false);
          setAuthLoading(false);
          return;
        }

        if (event === "TOKEN_REFRESHED") {
          if (!newSession) {
            console.warn(
              "[useAuth] Token refresh failed — redirecting to login",
            );
            handleAuthFailure();
            return;
          }
          console.log("[useAuth] Token refreshed successfully");
        }

        if (newSession?.user) {
          fetchProfile(newSession.user.id);
        } else if (event !== "INITIAL_SESSION") {
          // Only redirect on non-initial events (INITIAL_SESSION may have null session on first load)
          setProfile(null);
          logout();
          setIsLoading(false);
          setAuthLoading(false);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data && !error) {
      setProfile(data);
      // Recompute level from total_xp to ensure consistency
      const { level, currentXP, xpToNext } = computeLevel(data.total_xp);
      // Sync Supabase profile → Zustand userStore
      const userData = {
        user_id: data.id,
        name: data.name,
        avatar_url: data.avatar_url,
        level,
        total_xp: data.total_xp,
        current_xp_in_level: currentXP,
        xp_to_next_level: xpToNext,
        streak: data.streak,
        best_streak: data.best_streak,
        stamina: data.stamina,
        last_active_date: data.last_active_date,
        last_login_at: new Date().toISOString(),
        onboarding_done: data.onboarding_done,
        primary_branch: data.primary_branch,
      };
      setUser(userData);
      // Mark session as ready for data fetching
      setSessionReady(true);

      // Redirect based on onboarding status
      if (!data.onboarding_done) {
        try {
          router.replace("/(auth)/onboarding");
        } catch {
          // Router might not be ready yet
        }
      } else {
        try {
          router.replace("/(tabs)");
        } catch {
          // Router might not be ready yet
        }
      }
    } else {
      console.error("[useAuth] Failed to fetch profile:", error);
      setAuthLoading(false);
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
