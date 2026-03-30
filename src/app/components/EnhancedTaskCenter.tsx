'use client';

import useGameStore from '../../store/useGameStore';   // 正确相对路径
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Target } from 'lucide-react';

const EnhancedTaskCenter = () => {
  const { dynamicRoadmap, activeRoadmapNodeId } = useGameStore();

  const activeNode = dynamicRoadmap.find((node) => node.id === activeRoadmapNodeId);

  if (!activeNode) {
    return (
      <Card className="p-10 text-center bg-slate-900/60 border border-slate-700">
        <Target className="w-12 h-12 mx-auto mb-6 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-200 mb-2">任务中心待激活</h3>
        <p className="text-slate-400">请在左侧「学习路线图」中选择一个战略节点</p>
        <p className="text-sm text-slate-500 mt-2">系统将自动生成针对性任务</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 当前攻克节点 Header */}
      <div className="border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Badge 
            variant="secondary" 
            className="bg-orange-900/30 text-orange-400 border-orange-400/50"
          >
            当前攻克节点
          </Badge>
          <h2 className="text-2xl font-bold text-slate-100">{activeNode.title}</h2>
        </div>
        <p className="text-sm text-red-400 flex items-center gap-2">
          <span className="font-medium">直击痛点：</span>
          {activeNode.focus}
        </p>
      </div>

      {/* 任务列表 */}
      <div>
        <h3 className="text-lg font-medium text-slate-200 mb-4 flex items-center gap-2">
          推荐任务清单
          <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-slate-400">
            ({activeNode.tasks.length})
          </span>
        </h3>

        <div className="grid gap-3">
          {activeNode.tasks.map((task, index) => (
            <Card 
              key={index} 
              className="p-4 border-slate-700 hover:border-slate-500 transition-colors flex items-start gap-4"
            >
              <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-400 mt-0.5">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-slate-200 leading-relaxed">{task}</p>
                <p className="text-xs text-slate-500 mt-1">完成可获得经验值 +15 XP</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedTaskCenter;
