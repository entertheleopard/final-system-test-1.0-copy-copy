import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase';
import { Session, User } from '@supabase/supabase-js';

type AuthContextType = {
  user: any | null;
  session: Session | null;
  loading: boolean;
  isPending: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = (u: User | null) => {
    if (!u) return null;
    return {
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.email?.split('@')[0],
      username: u.user_metadata?.username || u.email?.split('@')[0],
      profilePictureUrl: u.user_metadata?.avatar_url,
    };
  };

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(mapUser(session?.user ?? null));
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(mapUser(session?.user ?? null));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (email: string, password: string) => {
    return supabase.auth.signInWithPassword({ email, password });
  };

  const signup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (data.user) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        username: email.split("@")[0],
        full_name: email.split("@")[0],
      });
    }

    return { data, error };
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/auth/update-password',
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isPending: loading,
      login,
      signup,
      logout,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (options?: { requireAuth?: boolean }) => {
  const context = useContext(AuthContext);
  // We can't use useNavigate here safely because AuthProvider might be outside Router in some setups,
  // but in our App.tsx, AuthProvider wraps App which contains Router.
  // However, useAuth might be used in components.
  // To be safe, we'll handle redirection in the components or a wrapper, 
  // but for convenience we can try to use it if available.
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
