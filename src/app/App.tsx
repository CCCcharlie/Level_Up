import React, { useEffect } from 'react';
import useGameStore from '../store/useGameStore';
import { CareerOnboarding } from './components/CareerOnboarding';
import  LearningPathFlow  from './components/LearningPathFlow';
import { StarConstellationSkillTree } from './components/StarConstellationSkillTree';
import  EnhancedTaskCenter  from './components/EnhancedTaskCenter';
import  CustomProjectSystem  from './components/CustomProjectSystem';
import EquipmentSystem from './components/EquipmentSystem';
import { ScrollArea } from './components/ui/scroll-area';


// UI Components

import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarHeader, SidebarInset } from './components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Progress } from './components/ui/progress';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Compass } from 'lucide-react';
import { ensureUserProfile, supabase } from '../lib/supabase';

export default function App() {
  // 从 Store 获取全局状态
  const {
    fetchUserData,
    isSyncing,
    isOnboarded, 
    level, 
    totalExp, 
    careerDirection, 
    userTargetLevel 
  } = useGameStore();
;
  useEffect(() => {
    void fetchUserData();
  }, [])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        void (async () => {
          if (session?.user) {
            try {
              await ensureUserProfile(session);
            } catch (error) {
              console.error('[App:onAuthStateChange] Failed to ensure user profile:', error);
            }
          }

          await fetchUserData();
        })();
      }

      if (event === 'SIGNED_OUT') {
        void fetchUserData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserData]);

  if (isSyncing) {
    return (
      <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-black text-slate-200">
        <style>
          {`
            @keyframes neural-scan {
              0% { transform: translateY(-120%); opacity: 0; }
              10% { opacity: 0.35; }
              40% { opacity: 0.2; }
              100% { transform: translateY(120%); opacity: 0; }
            }

            @keyframes crt-flicker {
              0%, 18%, 22%, 100% { opacity: 0.12; }
              20% { opacity: 0.05; }
              21% { opacity: 0.16; }
            }
          `}
        </style>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(124,58,237,0.28),transparent_58%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.04)_0,rgba(255,255,255,0.04)_1px,transparent_1px,transparent_3px)]" style={{ animation: 'crt-flicker 2.2s linear infinite' }} />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute left-0 right-0 h-32 bg-gradient-to-b from-cyan-500/0 via-cyan-300/25 to-violet-500/0"
            style={{ animation: 'neural-scan 2.8s linear infinite' }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-violet-500/30 blur-2xl" />
            <div className="absolute -inset-3 rounded-full border border-cyan-300/30 animate-ping" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-violet-400/70 bg-slate-950 shadow-[0_0_45px_rgba(139,92,246,0.55)]">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-300 via-violet-400 to-blue-500" />
            </div>
          </div>

          <p className="px-6 text-center text-[11px] font-mono uppercase tracking-[0.28em] text-cyan-200/90">
            [ SYSTEM INITIALIZING... FETCHING NEURAL DATA ]
          </p>
        </div>
      </div>
    );
  }

  // 如果未完成引导，显示入站界面
  if (!isOnboarded) {
    return <CareerOnboarding />;
  }

  return (
    <div className="dark relative flex h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-200 selection:bg-purple-500/30">
      {/* 背景径向渐变 */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_0%,rgba(76,29,149,0.15)_0%,transparent_50%)]" />

      <SidebarProvider
        defaultOpen={true}
        style={
          {
            '--sidebar-width': '26rem',
            '--sidebar-width-icon': '3.5rem',
          } as React.CSSProperties
        }
      >
        {/* 1. 全局侧边栏 (监控与执行区) */}
        <Sidebar className="relative z-10 border-r border-slate-800 bg-slate-900/40 backdrop-blur-xl">
          <SidebarHeader className="p-6 border-b border-slate-800/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-1 bg-purple-500 rounded-full blur opacity-20 animate-pulse" />
                  <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-purple-500 flex items-center justify-center text-lg font-bold text-white relative">
                    {level}
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white truncate max-w-[120px]">{careerDirection}</h2>
                  <Badge className="text-[10px] h-4 bg-purple-600/20 text-purple-400 border-purple-500/30">
                    {userTargetLevel}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 px-1 font-mono">
                  <span>EXP PROGRESS</span>
                  <span>{totalExp % 1000} / 1000</span>
                </div>
                <Progress value={(totalExp % 1000) / 10} className="h-1.5 bg-slate-800" />
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ScrollArea className="h-full flex-1 px-2 py-4 [&>[data-slot=scroll-area-viewport]>div]:!block">
              <div className="flex flex-col gap-4 pb-24">
                {/* 模块间增加间距与阴影区分 */}
                {/*
                  Root cause: ScrollArea sits inside a flex column; without shrink-0, nested sections can be compressed
                  when viewport height changes, causing internal panels to look truncated.
                */}
                <section className="shrink-0 bg-slate-900/30 rounded-xl p-1 border border-transparent hover:border-slate-800 transition-colors shadow-2xl shadow-black/20">
                  <EnhancedTaskCenter />
                </section>
                <section className="shrink-0 bg-slate-900/30 rounded-xl p-1 shadow-2xl shadow-black/20">
                  <CustomProjectSystem />
                </section>
                <section className="shrink-0 bg-slate-900/30 rounded-xl p-1 shadow-2xl shadow-black/20">
                  <EquipmentSystem />
                </section>
              </div>
            </ScrollArea>
          </SidebarContent>
        </Sidebar>

        {/* 2. 主舞台 (宏观视图区) */}
        <SidebarInset className="relative z-10 flex h-full min-w-0 w-full flex-1 flex-col overflow-hidden transition-all duration-300 ease-in-out md:peer-data-[state=collapsed]:ml-0 md:peer-data-[state=collapsed]:w-full">
          <header className="h-14 border-b border-slate-800/50 flex items-center px-6 bg-slate-950/50 backdrop-blur-sm z-20">
            <SidebarTrigger className="text-slate-400 hover:text-white transition-colors" />
            <div className="ml-4 h-4 w-px bg-slate-800" />
            <div className="ml-4 flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
              <Compass className="w-3 h-3" />
              Neural Navigation System
            </div>
          </header>

          <div className="flex-1 overflow-hidden p-6">
            <Tabs defaultValue="roadmap" className="h-full flex flex-col">
              <TabsList className="bg-slate-900/50 border border-slate-800 w-fit mb-6">
                <TabsTrigger value="roadmap" className="data-[state=active]:bg-purple-600 px-8">路线图</TabsTrigger>
                <TabsTrigger value="star-chart" className="data-[state=active]:bg-blue-600 px-8">全息星盘</TabsTrigger>
              </TabsList>

              <Card className="flex-1 bg-slate-900/20 border-slate-800 backdrop-blur-sm relative overflow-hidden">
                <TabsContent value="roadmap" className="m-0 h-full">
                  <LearningPathFlow />
                </TabsContent>
                <TabsContent value="star-chart" className="m-0 h-full">
                  <StarConstellationSkillTree />
                </TabsContent>
              </Card>
            </Tabs>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}