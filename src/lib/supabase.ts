/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// 初始化 Supabase 客户端
// 环境变量占位：使用 .env.local 配置真实值
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://rwszbrkwoolnuhyzdiqg.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'hdjMzCG6xBFtzu1G';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function ensureUserProfile(session: any) {
  if (!session?.user?.id) {
    return null;
  }

  const now = new Date().toISOString();
  const metadata = session.user.user_metadata ?? {};

  const payload = {
    id: session.user.id,
    email: session.user.email ?? '',
    display_name: metadata.display_name ?? metadata.full_name ?? null,
    avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('users')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .maybeSingle();

  if (error) {
    console.error('Ensure user profile error:', error);
    throw error;
  }

  return data;
}

// 辅助函数：使用 Google OAuth 登录
export async function signInWithGoogle() {
  try {
    // 获取当前页面的完整URL作为重定向地址
    // 这样可以确保登录后返回到用户当前所在的页面
    const currentUrl = window.location.origin + window.location.pathname + window.location.search;
    
    console.log('[signInWithGoogle] Initiating Google OAuth with redirect to:', currentUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: currentUrl,
        // 可选：添加queryParams以跟踪来源
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('[signInWithGoogle] Google signin error:', error);
      throw error;
    }

    console.log('[signInWithGoogle] OAuth initiated successfully');
    return data;
  } catch (err) {
    console.error('[signInWithGoogle] Failed to sign in with Google:', err);
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

// 辅助函数：检查是否有有效的认证会话
export async function hasValidSession(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch (error) {
    console.error('[hasValidSession] Error checking session:', error);
    return false;
  }
}

// 辅助函数：检查本地缓存中是否有onboarding数据
export function hasOnboardingDataInCache(): boolean {
  try {
    const storedState = localStorage.getItem('game-store');
    if (!storedState) {
      return false;
    }
    
    const parsed = JSON.parse(storedState);
    const state = parsed.state;
    
    // 检查是否有onboarding相关的数据
    return Boolean(
      state?.isOnboarded || 
      state?.careerDirection ||
      (state?.dynamicRoadmap && Array.isArray(state.dynamicRoadmap) && state.dynamicRoadmap.length > 0)
    );
  } catch (error) {
    console.error('[hasOnboardingDataInCache] Error parsing cache:', error);
    return false;
  }
}

// 辅助函数：获取缓存的认证状态（同步，用于快速检查）
export function getCachedAuthStatus(): { hasSession: boolean; hasOnboarding: boolean } {
  const hasSession = (() => {
    try {
      // Supabase会在localStorage中存储auth token
      const keys = Object.keys(localStorage);
      return keys.some(key => key.startsWith('sb-') && key.includes('auth-token'));
    } catch {
      return false;
    }
  })();
  
  const hasOnboarding = hasOnboardingDataInCache();
  
  return { hasSession, hasOnboarding };
}
