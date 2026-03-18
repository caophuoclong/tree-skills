import { useState } from 'react';
import { supabase } from '../api/supabase';

interface SignInState {
  isLoading: boolean;
  error: string | null;
}

interface SignInResult extends SignInState {
  signIn: (email: string, password: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Hook for email/password sign-in.
 * Session state is handled automatically by useAuth (onAuthStateChange).
 */
export function useSignIn(): SignInResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setIsLoading(false);

    if (authError) {
      setError(mapAuthError(authError.message));
      return false;
    }

    return true;
  };

  return { isLoading, error, signIn, clearError: () => setError(null) };
}

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'Email hoặc mật khẩu không đúng.';
  if (message.includes('Email not confirmed'))
    return 'Vui lòng xác nhận email trước khi đăng nhập.';
  if (message.includes('Too many requests'))
    return 'Quá nhiều lần thử. Vui lòng đợi vài phút.';
  return 'Đăng nhập thất bại. Vui lòng thử lại.';
}
