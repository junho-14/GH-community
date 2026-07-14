import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

/**
 * AuthProvider 컴포넌트
 *
 * Props:
 * @param {node} children - 하위 컴포넌트 [Required]
 *
 * Example usage:
 * <AuthProvider><App /></AuthProvider>
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    let cancelled = false;

    supabase
      .from('gh_users')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled) setProfile(data);
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  const signUp = async ({ email, password, nickname, profileImageFile }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname } },
    });
    if (error) throw error;

    // 이메일 인증이 필요한 경우 세션이 없어 스토리지 업로드가 불가능하므로,
    // 세션이 즉시 발급된 경우에만 프로필 이미지를 업로드한다. (프로필 행 자체는 DB 트리거가 생성)
    const userId = data.user?.id;
    if (userId && data.session && profileImageFile) {
      const filePath = `profiles/${userId}-${Date.now()}-${profileImageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('gh-images')
        .upload(filePath, profileImageFile);
      if (!uploadError) {
        const profileImageUrl = supabase.storage.from('gh-images').getPublicUrl(filePath).data.publicUrl;
        await supabase.from('gh_users').update({ profile_image_url: profileImageUrl }).eq('id', userId);
      }
    }

    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user: session?.user ?? null,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth는 AuthProvider 내부에서 사용해야 합니다.');
  return context;
}
