/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端
// 环境变量占位：使用 .env.local 配置真实值
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://rwszbrkwoolnuhyzdiqg.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'hdjMzCG6xBFtzu1G';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 辅助函数：使用 Google OAuth 登录
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error('Google signin error:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Failed to sign in with Google:', err);
    throw err;
  }
}

// 辅助函数：获取当前会话
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Get session error:', error);
      return null;
    }

    return session;
  } catch (err) {
    console.error('Failed to get session:', err);
    return null;
  }
}

// 辅助函数：登出
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  } catch (err) {
    console.error('Failed to sign out:', err);
    throw err;
  }
}

// 辅助函数：观察认证状态变化
export function onAuthStateChange(callback: (session: any) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session);
  });

  return subscription;
}
