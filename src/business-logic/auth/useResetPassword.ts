import { useState } from 'react';
import { supabase } from '../api/supabase';

interface ResetPasswordResult {
  isLoading: boolean;
  error: string | null;
  sent: boolean;
  sendResetEmail: (email: string) => Promise<boolean>;
}

/**
 * Hook for password reset via email link.
 */
export function useResetPassword(): ResetPasswordResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const sendResetEmail = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo: 'lifeskills://reset-password' } // deep link scheme
    );

    setIsLoading(false);

    if (authError) {
      setError('Gửi email thất bại. Kiểm tra lại địa chỉ email.');
      return false;
    }

    setSent(true);
    return true;
  };

  return { isLoading, error, sent, sendResetEmail };
}
