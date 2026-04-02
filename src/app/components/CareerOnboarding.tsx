import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Terminal, Code2, Database, Layout, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useGameStore, TargetLevel } from '../../store/useGameStore'; // 引入重构后的 Store

// 职业方向配置 (PRD Step 1)
const CAREER_DIRECTIONS = [
  { id: 'frontend', title: '前端开发', icon: <Layout />, desc: '构建极致的用户体验与视觉艺术' },
  { id: 'backend', title: '后端架构', icon: <Database />, desc: '设计高并发、分布式的系统脊梁' },
  { id: 'fullstack', title: '全栈独立开发', icon: <Terminal />, desc: '一人分饰多角，实现完整的产品愿景' },
];

// 目标段位配置 (PRD Step 2)
const TARGET_LEVELS: { id: TargetLevel; title: string; desc: string }[] = [
  { id: 'Junior', title: '初级 (Junior)', desc: '掌握核心语法，能够交付标准模块' },
  { id: 'Mid', title: '中级 (Mid)', desc: '理解工程化体系，具备架构拆解能力' },
  { id: 'Senior', title: '高级 (Senior)', desc: '驱动技术变革，主导复杂系统演进' },
];

export function CareerOnboarding() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<string | null>(null);
  const [level, setLevel] = useState<TargetLevel | null>(null);
  const [isAwakening, setIsAwakening] = useState(false);

  const { setTargetLevel } = useGameStore();

  // 最终确认：触发 AI 觉醒动效 (PRD 1.5s 延迟)
  const handleFinalConfirm = (selectedLevel: TargetLevel) => {
    setLevel(selectedLevel);
    setIsAwakening(true);

    setTimeout(() => {
      if (direction) {
        setTargetLevel(direction, selectedLevel);
        // Store 内部会自动设置 isOnboarded: true
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden font-sans">
      {/* 背景动态光晕 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      
      <AnimatePresence mode="wait">
        {/* Step 1: 职业方向选择 */}
        {step === 1 && !isAwakening && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-4xl text-center z-10"
          >
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-8 tracking-wider">
              第一步：定锚你的职业维度
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {CAREER_DIRECTIONS.map((item) => (
                <Card 
                  key={item.id}
                  onClick={() => { setDirection(item.id); setStep(2); }}
                  className="group bg-slate-900/50 border-slate-800 hover:border-blue-500/50 cursor-pointer transition-all duration-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                >
                  <CardContent className="p-8 flex flex-col items-center">
                    <div className="p-4 rounded-2xl bg-slate-800 text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: 目标段位确认 */}
        {step === 2 && !isAwakening && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-4xl text-center z-10"
          >
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8 tracking-wider">
              第二步：锚定进化的终点
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {TARGET_LEVELS.map((item) => (
                <Card 
                  key={item.id}
                  onClick={() => handleFinalConfirm(item.id)}
                  className="group bg-slate-900/50 border-slate-800 hover:border-pink-500/50 cursor-pointer transition-all duration-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.2)]"
                >
                  <CardContent className="p-8">
                    <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm mb-4">{item.desc}</p>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full bg-pink-500 transition-all ${item.id === 'Junior' ? 'w-1/3' : item.id === 'Mid' ? 'w-2/3' : 'w-full'}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setStep(1)} className="text-slate-500 hover:text-white">
              返回重选方向
            </Button>
          </motion.div>
        )}

        {/* AI 觉醒 Loading (PRD 核心动效) */}
        {isAwakening && (
          <motion.div
            key="awakening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="relative mb-8"
            >
              <div className="absolute inset-0 blur-2xl bg-blue-500/20 rounded-full" />
              <Sparkles className="w-24 h-24 text-blue-400 relative z-10" />
            </motion.div>
            
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 300 }}
              className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4"
            />
            
            <p className="text-xl text-blue-100 font-medium tracking-widest animate-pulse">
              AI 正在解析能力缺口，为你点亮专属星盘...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default CareerOnboarding;