import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isMockMode, MOCK_USER, mockDelay } from '@/utils/mockMode';

type MockUser = {
  id: string;
  email: string;
  name: string;
  username?: string;
  bio?: string;
  website?: string;
  profilePictureUrl?: string;
} | null;

type AuthSession = {
  token: string;
  user: NonNullable<MockUser>;
  expiresAt: number;
};

type MockAuthContextType = {
  user: MockUser | undefined;
  isPending: boolean;
  isAnonymous: boolean;
  error: Error | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<NonNullable<MockUser>>) => Promise<void>;
};

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'invoque_auth_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | undefined>(undefined);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
        
        if (storedSession) {
          const session: AuthSession = JSON.parse(storedSession);
          
          if (session.user && session.token && session.expiresAt > Date.now()) {
            console.log('[Auth] Restoring valid session');
            setUser(session.user);
          } else {
            console.log('[Auth] Session expired or invalid, clearing');
            localStorage.removeItem(AUTH_STORAGE_KEY);
            setUser(null);
          }
        } else {
          console.log('[Auth] No session found, defaulting to unauthenticated');
          setUser(null);
        }
      } catch (err) {
        console.error('[Auth] Failed to restore session:', err);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setUser(null);
      } finally {
        setIsPending(false);
      }
    };

    restoreSession();
  }, []);

  const login = async () => {
    setIsPending(true);
    setError(null);
    try {
      await mockDelay();
      
      const session: AuthSession = {
        token: `mock_jwt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        user: MOCK_USER,
        expiresAt: Date.now() + SESSION_DURATION
      };

      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setUser(MOCK_USER);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const logout = async () => {
    setIsPending(true);
    try {
      await mockDelay();
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsPending(false);
    }
  };

  const updateProfile = async (data: Partial<NonNullable<MockUser>>) => {
    // Don't set global pending state to avoid full app reload/flicker, 
    // let the component handle its own loading state
    try {
      await mockDelay();
      
      if (!user) throw new Error('No user logged in');
      
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      
      // Update local storage
      const storedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedSession) {
        const session = JSON.parse(storedSession);
        session.user = updatedUser;
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      }
    } catch (err) {
      console.error('Update profile failed:', err);
      throw err;
    }
  };

  const isAnonymous = user === null;

  return (
    <MockAuthContext.Provider value={{ user, isPending, isAnonymous, error, login, logout, updateProfile }}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth(params?: { requireAuth?: boolean }) {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within MockAuthProvider');
  }

  return context;
}
