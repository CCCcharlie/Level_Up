import React from 'react';
import useGameStore from '../store/useGameStore';
import { CareerOnboarding } from './components/CareerOnboarding';
import  LearningPathFlow  from './components/LearningPathFlow';
import { StarConstellationSkillTree } from './components/StarConstellationSkillTree';
import  EnhancedTaskCenter  from './components/EnhancedTaskCenter';
import  CustomProjectSystem  from './components/CustomProjectSystem';
import DataDashboard from './components/DataDashboard';
import EquipmentSystem from './components/EquipmentSystem';
import { ScrollArea } from './components/ui/scroll-area';


// UI Components

import { SidebarProvider, Sidebar, SidebarContent, SidebarTrigger, SidebarHeader } from './components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Progress } from './components/ui/progress';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Zap, Target, LayoutDashboard, Compass } from 'lucide-react';

export default function App() {
  // 从 Store 获取全局状态
  const { 
    isOnboarded, 
    level, 
    totalExp, 
    careerDirection, 
    userTargetLevel 
  } = useGameStore();

  // 如果未完成引导，显示入站界面
  if (!isOnboarded) {
    return <CareerOnboarding />;
  }

  // 计算当前等级经验百分比 (假设每级 1000 XP)
  const expPercentage = (totalExp % 1000) / 10;


return (
    <SidebarProvider defaultOpen={true}>
      <div className=" dark flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-purple-500/30">

      
        {/* 背景径向渐变 */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(76,29,149,0.15)_0%,transparent_50%)] pointer-events-none" />

        {/* 1. 全局侧边栏 (监控与执行区) */}
        <Sidebar className="border-r border-slate-800 bg-slate-900/40 backdrop-blur-xl">
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

          <SidebarContent>
            <ScrollArea className="h-full px-4 py-6">
              <div className="space-y-8 pb-10">
                {/* 模块间增加间距与阴影区分 */}
                <section className="bg-slate-900/30 rounded-xl p-1 border border-transparent hover:border-slate-800 transition-colors shadow-2xl shadow-black/20">
                  <EnhancedTaskCenter />
                </section>
                <section className="bg-slate-900/30 rounded-xl p-1 shadow-2xl shadow-black/20">
                  <CustomProjectSystem />
                </section>
                <section className="bg-slate-900/30 rounded-xl p-1 shadow-2xl shadow-black/20">
                   <DataDashboard />
                </section>
                <section className="bg-slate-900/30 rounded-xl p-1 shadow-2xl shadow-black/20">
                  <EquipmentSystem />
                </section>
              </div>
            </ScrollArea>
          </SidebarContent>
        </Sidebar>

        {/* 2. 主舞台 (宏观视图区) */}
        <main className="flex-1 flex flex-col relative overflow-hidden h-screen">
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
        </main>
      </div>
    </SidebarProvider>
  );
}