'use client';

import { motion } from 'framer-motion';
import useGameStore from '../../store/useGameStore'; // 请确认您的 store 路径
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Target, Flame, CheckCircle, PlayCircle } from 'lucide-react';

const LearningPathFlow = () => {
  const {
    dynamicRoadmap,
    activeRoadmapNodeId,
    setActiveRoadmapNode,
    setTargetLevel, // 用于空状态快速切换
  } = useGameStore();

  // 空状态（首次进入时提示用户生成路线）
  if (dynamicRoadmap.length === 0) {
    return (
      <Card className="p-12 text-center bg-slate-900/60 border border-slate-700">
        <Target className="w-12 h-12 mx-auto mb-6 text-slate-400" />
        <h3 className="text-2xl font-bold text-slate-200 mb-3">您的等级驱动路线图待生成</h3>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          请选择目标等级，AI 将为您生成专属「痛点驱动」的学习航线
        </p>
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => setTargetLevel('Junior')}>
            Junior 路线
          </Button>
          <Button variant="outline" onClick={() => setTargetLevel('Mid')}>
            Mid 路线
          </Button>
          <Button variant="outline" onClick={() => setTargetLevel('Senior')}>
            Senior 路线
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="relative pl-10 border-l-[3px] border-slate-600/80 space-y-14 py-8">
      {dynamicRoadmap.map((node, index) => {
        const isActive = node.id === activeRoadmapNodeId;

        // 状态图标与样式映射
        const statusConfig = {
          locked: { icon: <Target className="w-6 h-6" />, color: 'text-slate-400', bg: 'bg-slate-800' },
          active: { icon: <Flame className="w-6 h-6" />, color: 'text-orange-400', bg: 'bg-orange-900/30' },
          completed: { icon: <CheckCircle className="w-6 h-6" />, color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
        }[node.status];

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
            className="relative flex items-start gap-8 cursor-pointer group"
            onClick={() => setActiveRoadmapNode(node.id)}
          >
            {/* 地铁站式左侧圆点 + 连线 */}
            <div className="absolute -left-[13px] top-3 z-10">
              <div
                className={`w-8 h-8 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${statusConfig.bg} ${
                  isActive ? 'border-orange-400 ring-4 ring-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.6)] scale-110' : 'border-slate-600'
                }`}
              >
                <span className={statusConfig.color}>{statusConfig.icon}</span>
              </div>
            </div>

            {/* 节点卡片 */}
            <Card
              className={`flex-1 p-6 transition-all duration-300 group-hover:border-slate-400 ${
                isActive
                  ? 'border-orange-400 bg-gradient-to-r from-orange-900/10 to-transparent shadow-[0_0_25px_rgba(249,115,22,0.5)] ring-2 ring-orange-400/50'
                  : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              {/* 标题 + 步骤编号 */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-slate-100 group-hover:text-orange-300 transition-colors">
                  {node.title}
                </h3>
                <span className="text-xs font-mono bg-slate-800 text-slate-400 px-3 py-1 rounded-full">
                  STEP {index + 1}
                </span>
              </div>

              {/* 核心痛点 Badge（重点强调） */}
              <Badge
                variant="outline"
                className="mb-5 border-red-500/60 text-red-400 hover:bg-red-900/20 text-sm px-4 py-1 flex items-center gap-2 w-fit"
              >
                <Flame className="w-4 h-4" />
                面试常考点 / 核心痛点
              </Badge>

              {/* focus 描述 */}
              <p className="text-slate-300 leading-relaxed text-[15px] mb-6">
                {node.focus}
              </p>

              {/* 关联任务 */}
              <div className="text-xs text-slate-400">
                <span className="uppercase tracking-widest">关联任务 ({node.tasks.length})</span>
                <ul className="mt-3 grid grid-cols-1 gap-y-2">
                  {node.tasks.map((task, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-slate-400 rounded-full" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 正在跃迁提示（仅 active 节点显示） */}
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 flex items-center gap-3 text-orange-400 text-sm font-medium border-t border-orange-400/30 pt-4"
                >
                  <PlayCircle className="w-5 h-5 animate-pulse" />
                  <span>正在跃迁 · 当前攻克节点</span>
                </motion.div>
              )}
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LearningPathFlow;
