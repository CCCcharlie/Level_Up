'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore'; // 确保路径正确
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Target, Flame, CheckCircle, PlayCircle, Rocket } from 'lucide-react';

const LearningPathFlow = () => {
  const {
    dynamicRoadmap,
    userTargetLevel,
    setTargetLevel,
  } = useGameStore();

  // 空状态处理 (PRD 3.2)
  if (!dynamicRoadmap || dynamicRoadmap.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900/20">
        <Rocket className="w-16 h-16 text-slate-700 mb-6 animate-bounce" />
        <h3 className="text-xl font-bold text-slate-300 mb-2">学习航线尚未校准</h3>
        <p className="text-slate-500 mb-6 max-w-xs">请在引导系统或下方快速选择一个目标，AI 将为您生成专属路线图。</p>
        <div className="flex gap-3">
          {(['Junior', 'Mid', 'Senior'] as const).map((lvl) => (
            <Button key={lvl} variant="outline" size="sm" onClick={() => setTargetLevel('默认', lvl)} className="border-slate-700 hover:border-purple-500">
              {lvl} 模式
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative pl-10 py-10 overflow-y-auto h-full custom-scrollbar">
      {/* 核心特效：左侧流光连线 */}
      <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-slate-800">
        <motion.div 
          animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute w-full h-32 bg-gradient-to-b from-transparent via-purple-500 to-transparent"
        />
      </div>

      <div className="space-y-12">
        {dynamicRoadmap.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            {/* 地铁站式节点圆标 */}
            <div className={`absolute -left-[35px] top-1 w-6 h-6 rounded-full z-20 border-4 border-slate-950 flex items-center justify-center ${
              node.status === 'completed' ? 'bg-emerald-500' : 
              node.status === 'current' ? 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]' : 'bg-slate-700'
            }`}>
              {node.status === 'completed' && <CheckCircle className="w-3 h-3 text-white" />}
            </div>

            <Card className={`p-6 border-slate-800 bg-slate-900/40 backdrop-blur-md transition-all duration-500 hover:border-purple-500/50 ${
              node.status === 'current' ? 'border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.1)]' : ''
            }`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-tighter border-slate-700">
                    Step {index + 1} · {node.status}
                  </Badge>
                  <h4 className="text-lg font-bold text-white leading-none">{node.label}</h4>
                </div>
                {node.status === 'current' && <Flame className="w-5 h-5 text-orange-500 animate-pulse" />}
              </div>
              
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                {node.description}
              </p>

              {node.status === 'current' && (
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-purple-400 font-mono flex items-center gap-2 uppercase tracking-widest">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                    正在同步进化数据...
                  </span>
                  <Badge className="bg-purple-600 text-[10px]">{node.requiredXP} XP</Badge>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LearningPathFlow;
