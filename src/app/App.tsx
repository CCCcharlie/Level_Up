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
import { 
  Zap, 
  Map, 
  Star, 
  LayoutDashboard, 
  Target, 
  Trophy 
} from 'lucide-react';

function App() {
  // 从 Store 中提取核心状态
  const { 
    isOnboarded, 
    userLevel, 
    totalExp, 
    userTargetLevel,
    addExp,
    trackProgress
  } = useGameStore();

  // 1. 未入站状态守卫：全屏展示引导组件
  if (!isOnboarded) {
    return <CareerOnboarding />;
  }

  // 计算当前等级经验百分比 (假设每级 1000 XP)
  const expPercentage = (totalExp % 1000) / 10;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col font-sans selection:bg-purple-500/30">
      
      {/* 2. 顶部 User Header (控制台顶栏) */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-500/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white uppercase">Level Up</h1>
              <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">AI Agent OS</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* 等级与经验条 */}
            <div className="hidden md:flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Current Level</span>
                <span className="text-sm font-black text-purple-400">LV.{userLevel}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{totalExp % 1000} / 1000 XP</span>
              </div>
              <Progress value={expPercentage} className="h-1.5 w-48 bg-slate-800" />
            </div>

            {/* 目标段位显示 */}
            <div className="flex items-center gap-3 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-xl">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {userTargetLevel || '未定段位'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. 入站后的主界面布局 (Dashboard) */}
      <main className="flex-1 p-6">
        <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-6 lg:grid-cols-12 h-full">
          
          {/* 左侧区域 (占据 60% 宽度 / col-span-7) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Tabs defaultValue="roadmap" className="w-full h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="bg-slate-900 border border-slate-800 p-1">
                  <TabsTrigger value="roadmap" className="data-[state=active]:bg-purple-600">
                    <Map className="mr-2 h-4 w-4" /> 
                    当前跃迁路线
                  </TabsTrigger>
                  <TabsTrigger value="star-chart" className="data-[state=active]:bg-blue-600">
                    <Star className="mr-2 h-4 w-4" /> 
                    全息星盘大盘
                  </TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <LayoutDashboard className="h-3 w-3" />
                  可视化视图
                </div>
              </div>

              <div className="flex-1 bg-slate-900/30 border border-slate-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
                <TabsContent value="roadmap" className="h-full m-0 p-0">
                  <LearningPathFlow currentGoal={userTargetLevel || ''} />
                </TabsContent>
                <TabsContent value="star-chart" className="h-full m-0 p-0">
                  <StarConstellationSkillTree 
                    skillPoints={totalExp} 
                    onSkillPointsChange={(points) => {}} // 逻辑已在 store 中处理
                    onSkillsDataChange={() => {}}
                  />
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* 右侧区域 (占据 40% 宽度 / col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* 任务中心 */}
            <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">任务中心</h2>
              </div>
              <div className="h-[400px] overflow-y-auto">
                <EnhancedTaskCenter 
                  selectedSkill={null} 
                  allSkills={[]} // 建议后续从 store 获取
                  onTaskComplete={(taskId, rewards) => addExp(rewards.xp)} 
                />
              </div>
            </div>

            {/* 项目中心 */}
            <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">深度项目实战</h2>
              </div>
              <div className="h-[400px] overflow-y-auto">
                <CustomProjectSystem 
                  selectedSkill={null} 
                  allSkills={[]} 
                  onProjectComplete={(title, category, score, diff, xp) => addExp(xp)} 
                />
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* 背景装饰（增强科技感） */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent_50%)] pointer-events-none" />
    </div>
  );
}

export default App;