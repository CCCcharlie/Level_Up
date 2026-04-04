'use client';

import useGameStore, { type Task } from '../../store/useGameStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Target, Zap } from 'lucide-react';
interface EnhancedTaskCenterProps {
  selectedSkill?: any;
  allSkills?: any[];
  onTaskComplete?: (taskId: string, rewards: { xp: number; skillPoints: number }) => void;
}

export default function EnhancedTaskCenter({
  selectedSkill,
  allSkills,
  onTaskComplete,
}: EnhancedTaskCenterProps) {
  const { dynamicRoadmap, activeRoadmapNodeId } = useGameStore();

  const activeNode = dynamicRoadmap.find((node) => node.id === activeRoadmapNodeId);

  const renderTaskLabel = (task: Task) => task.title;

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
      {/* PRD 要求的 Header */}
      <div className="border-b border-slate-700 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/5">
            当前攻克节点
          </Badge>
          <h2 className="text-2xl font-bold text-slate-100">{activeNode.title}</h2>
        </div>
        <p className="text-[13px] text-amber-400/90 flex items-start gap-2 leading-relaxed">          <span className="font-medium">直击痛点：</span>
          {activeNode.focus}
        </p>
      </div>

      {/* 节点专属任务列表 */}
      <div>
        <h3 className="text-lg font-medium text-slate-200 mb-4">
          本节点专属任务 ({activeNode.tasks.length})
        </h3>

        <div className="grid gap-3">
          {activeNode.tasks.map((task, index) => (
        <Card key={index} className="group p-3 border-slate-800 bg-slate-950/40 hover:border-amber-500/30 transition-all duration-300">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-sm bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-500 group-hover:text-amber-400 transition-colors">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-300 group-hover:text-slate-100 transition-colors">{renderTaskLabel(task)}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline" className="border-slate-700 text-[10px] text-slate-300">
                  {task.type}
                </Badge>
                {task.subTasks?.length ? (
                  <Badge variant="outline" className="border-amber-500/40 text-[10px] text-amber-300">
                    {task.subTasks.length} sub tasks
                  </Badge>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5 mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                <Zap className="w-2.5 h-2.5 text-amber-500" />
                <span className="text-[10px] text-slate-500 font-mono">+15 XP REWARD</span>
              </div>
            </div>
          </div>
        </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
