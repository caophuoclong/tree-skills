import { useState } from 'react';
import { supabase } from '../api/supabase';

interface SignUpResult {
  isLoading: boolean;
  error: string | null;
  needsEmailConfirmation: boolean;
  signUp: (email: string, password: string, name: string) => Promise<boolean>;
  clearError: () => void;
}

/**
 * Hook for email/password sign-up.
 * Creates auth user + profile row (via DB trigger).
 * Passes `name` via user_metadata so the trigger can use it.
 */
export function useSignUp(): SignUpResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  const signUp = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { name: name.trim() }, // passed to handle_new_user trigger
      },
    });

    setIsLoading(false);

    if (authError) {
      setError(mapSignUpError(authError.message));
      return false;
    }

    // Supabase returns a session immediately if email confirmation is disabled
    // If confirmation is required, data.session will be null
    if (!data.session) {
      setNeedsEmailConfirmation(true);
    }

    return true;
  };

  return {
    isLoading,
    error,
    needsEmailConfirmation,
    signUp,
    clearError: () => setError(null),
  };
}

function mapSignUpError(message: string): string {
  if (message.includes('already registered') || message.includes('already been registered'))
    return 'Email này đã được sử dụng. Vui lòng đăng nhập.';
  if (message.includes('Password should be'))
    return 'Mật khẩu phải có ít nhất 6 ký tự.';
  if (message.includes('Invalid email'))
    return 'Địa chỉ email không hợp lệ.';
  return 'Đăng ký thất bại. Vui lòng thử lại.';
}
