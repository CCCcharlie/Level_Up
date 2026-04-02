import React from 'react';
import useGameStore from '../store/useGameStore';
import { CareerOnboarding } from './components/CareerOnboarding';
import  LearningPathFlow  from './components/LearningPathFlow';
import { StarConstellationSkillTree } from './components/StarConstellationSkillTree';
import  EnhancedTaskCenter  from './components/EnhancedTaskCenter';
import  CustomProjectSystem  from './components/CustomProjectSystem';

// UI Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Card } from './components/ui/card';
import { Sparkles, Trophy, Zap, Target, MousePointer2 } from 'lucide-react';

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
    // 整体背景应用径向渐变 (Sci-Fi 风格)
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-purple-500/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(76,29,149,0.15)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="container mx-auto px-4 py-6 max-w-[1600px] relative z-10">
        
        {/* --- 顶部全局经验条与状态 (PRD 3.3) --- */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 bg-purple-500 rounded-full blur opacity-25 animate-pulse" />
              <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-purple-500 flex items-center justify-center text-xl font-bold text-white relative">
                {level}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white tracking-tight">职业进化：{careerDirection}</h1>
                <Badge className="bg-purple-600/20 text-purple-400 border-purple-500/30">{userTargetLevel}</Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> {totalExp} XP</span>
                <span className="flex items-center gap-1"><Target className="w-3 h-3 text-blue-400" /> 下一级: {1000 - (totalExp % 1000)} XP</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-xs mb-1 px-1 text-slate-500">
              <span>等级进度</span>
              <span>{(totalExp % 1000) / 10}%</span>
            </div>
            <Progress value={(totalExp % 1000) / 10} className="h-2 bg-slate-800" />
          </div>
        </header>

        {/* --- 双维控制台布局 (PRD 3.2) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 左侧核心区 (7/12 宽度) - 宏观视图 */}
          <div className="lg:col-span-7 space-y-6">
            <Tabs defaultValue="roadmap" className="w-full">
              <div className="flex items-center justify-between mb-4 bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-fit">
                <TabsList className="bg-transparent border-0">
                  <TabsTrigger 
                    value="roadmap" 
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white px-6 transition-all"
                  >
                    动态路线图
                  </TabsTrigger>
                  <TabsTrigger 
                    value="star-chart"
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6 transition-all"
                  >
                    全息星盘
                  </TabsTrigger>
                </TabsList>
              </div>

              <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-sm overflow-hidden h-[700px] relative">
                <TabsContent value="roadmap" className="m-0 h-full">
                  <LearningPathFlow />
                </TabsContent>
                <TabsContent value="star-chart" className="m-0 h-full">
                  < StarConstellationSkillTree  />
                </TabsContent>
              </Card>
            </Tabs>
          </div>

          {/* 右侧执行区 (5/12 宽度) - 微观执行 */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* 任务中心 */}
            <section className="flex-1 min-h-0">
              <div className="flex items-center gap-2 mb-3 px-2">
                <MousePointer2 className="w-4 h-4 text-purple-400" />
                <h2 className="text-lg font-semibold text-slate-200 uppercase tracking-widest">任务中心</h2>
              </div>
              <div className="h-[400px] overflow-hidden">
                <EnhancedTaskCenter />
              </div>
            </section>

            {/* 项目系统 */}
            <section className="flex-1 min-h-0">
              <div className="flex items-center gap-2 mb-3 px-2">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <h2 className="text-lg font-semibold text-slate-200 uppercase tracking-widest">项目实战系统</h2>
              </div>
              <div className="h-[274px] overflow-hidden">
                <CustomProjectSystem />
              </div>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}