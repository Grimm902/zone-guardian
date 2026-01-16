import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, Profile, UserRole } from '@/types/auth';
import { logger } from '@/lib/logger';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching profile', error);
        return null;
      }

      return data as Profile | null;
    } catch (error) {
      logger.error('Error fetching profile', error);
      return null;
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      if (profileData) {
        setProfile(profileData);
        setRole(profileData.role);
      }
    }
  };

  const loadProfile = useCallback(
    async (userId: string, setLoadingState: boolean = true): Promise<void> => {
      try {
        const profileData = await fetchProfile(userId);
        if (profileData) {
          setProfile(profileData);
          setRole(profileData.role);
        }
      } catch (error) {
        logger.error('Error loading profile', error);
      } finally {
        if (setLoadingState) {
          setLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    let mounted = true;
    let hasInitialized = false;

    // Check for existing session first
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadProfile(session.user.id, true);
        } else {
          setLoading(false);
        }
      } catch (error) {
        logger.error('Error initializing auth', error);
        if (mounted) {
          setLoading(false);
        }
      } finally {
        hasInitialized = true;
      }
    };

    // Set up auth state listener (will fire after initialization)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Skip handling if we haven't initialized yet (let initializeAuth handle it)
      if (!hasInitialized) {
        return;
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Don't set loading state for subsequent auth changes
        await loadProfile(session.user.id, false);
      } else {
        setProfile(null);
        setRole(null);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ? (error as Error) : null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error ? (error as Error) : null };
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setRole(null);
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error: error ? (error as Error) : null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error: error ? (error as Error) : null };
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'full_name' | 'phone'>>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

    if (!error) {
      await refreshProfile();
    }

    return { error: error ? (error as Error) : null };
  };

  const value: AuthContextType = {
    session,
    user,
    profile,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
