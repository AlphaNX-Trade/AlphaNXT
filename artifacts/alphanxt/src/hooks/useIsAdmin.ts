import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail } from '@/lib/adminConfig';

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return isAdminEmail(user?.email);
}
