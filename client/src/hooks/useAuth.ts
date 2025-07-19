import { useQuery } from "@tanstack/react-query";

interface User {
  id: number;
  username: string;
  email: string;
  balance: string;
  isAdmin: boolean;
  wingyCoinUserId?: string;
  wingyBalance?: number;
  completedAds?: number;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/user/profile'],
    enabled: !!localStorage.getItem('token'),
    retry: false,
  });

  const isAuthenticated = !!user && !!localStorage.getItem('token');

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
  };
}