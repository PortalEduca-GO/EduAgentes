import { useAuthContext } from '../components/auth/AuthProvider';

export const useAuth = () => {
  return useAuthContext();
};
