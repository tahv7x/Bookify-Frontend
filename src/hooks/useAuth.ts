import { useState } from 'react';

interface AuthUser {
  id?: number;
  nom?: string;
  nomComplet?: string;
  prenom?: string;
  role?: string;
  Role?: string;
  [key: string]: unknown;
}

interface UseAuthReturn {
  user: AuthUser | null;
  userName: string;
  isProvider: boolean;
  token: string | null;
  isLoggedIn: boolean;
}

function parseUser(): AuthUser | null {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr) as AuthUser;
    }
  } catch { /* ignore */ }
  return null;
}

export function useAuth(): UseAuthReturn {
  const [user] = useState<AuthUser | null>(() => parseUser());
  const [token] = useState<string | null>(() => localStorage.getItem('token'));

  const userName = user?.nomComplet || user?.nom || user?.prenom || '';
  const isProvider = user?.role === 'PRESTATAIRE' || user?.role === 'PROVIDER'
                  || user?.Role === 'PRESTATAIRE' || user?.Role === 'PROVIDER';
  const isLoggedIn = !!token && !!user;

  return { user, userName, isProvider, token, isLoggedIn };
}
