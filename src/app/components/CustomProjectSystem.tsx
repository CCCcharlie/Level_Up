'use client';

import useGameStore from '../../store/useGameStore';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Lightbulb, ArrowRight } from 'lucide-react';

// 兼容 IntegratedSkillSystem 传递的 props
interface CustomProjectSystemProps {
  selectedSkill?: any;
  allSkills?: any[];
  onProjectComplete?: (
    projectTitle: string,
    category: string,
    aiScore: number,
    difficulty: string,
    xp: number,
    sp: number,
    skillsUsed: string[]
  ) => void;
}

const CustomProjectSystem = ({
  selectedSkill,
  allSkills,
  onProjectComplete,
}: CustomProjectSystemProps) => {
  const { dynamicRoadmap, activeRoadmapNodeId } = useGameStore();

  const activeNode = dynamicRoadmap.find((node) => node.id === activeRoadmapNodeId);

  if (!activeNode) {
    return (
      <Card className="p-10 text-center bg-slate-900/60 border border-slate-700">
        <Lightbulb className="w-12 h-12 mx-auto mb-6 text-slate-400" />
        <h3 className="text-xl font-semibold text-slate-200 mb-2">实战项目推荐待生成</h3>
        <p className="text-slate-400">请选择路线图中的节点以获取个性化项目建议</p>
      </Card>
    );
  }

  // 根据节点 focus 动态推荐实战项目
  const getRecommendedProject = (focus: string): string => {
    if (focus.includes('性能调优')) 
      return '实现一个支持百万数据渲染的高性能虚拟列表表格组件（使用 react-window + TanStack Table）';
    if (focus.includes('组件库')) 
      return '从零实现一个可配置的 Modal 组件库，包含动画、拖拽、焦点管理等高级特性';
    if (focus.includes('微前端')) 
      return '基于 Module Federation 搭建一个多应用微前端 Dashboard 系统';
    if (focus.includes('Git')) 
      return '构建一个支持多人协作的 Git 可视化工作流工具';
    if (focus.includes('高并发')) 
      return '设计并实现一个高并发秒杀抢购系统前端（包含倒计时、防刷、实时更新）';
    return '基于当前节点痛点，设计一个综合实战项目，包含状态管理、性能优化与工程化实践';
  };

  const recommendedProject = getRecommendedProject(activeNode.focus);

  // 与 IntegratedSkillSystem 的项目完成流程联动
  const handleProjectCompleteClick = () => {
    if (onProjectComplete) {
      onProjectComplete(
        activeNode.title,
        '实战项目',
        85,
        'Medium',
        120,
        8,
        ['react', 'typescript', activeNode.title.toLowerCase()]
      );
    }
  };

  return (
    <Card className="p-8 border-orange-400/30 bg-gradient-to-br from-slate-900 to-slate-950">
      <Badge variant="outline" className="mb-4 border-orange-400 text-orange-400">
        AI 推荐实战项目
      </Badge>

      <h3 className="text-2xl font-bold text-slate-100 mb-4">针对「{activeNode.title}」的实战项目</h3>
      
      <p className="text-slate-300 leading-relaxed mb-6">{recommendedProject}</p>

      <div className="flex items-center gap-2 text-xs text-orange-400 border-t border-orange-400/30 pt-4">
        <ArrowRight className="w-4 h-4" />
        完成该项目可显著提升对应节点熟练度，并获得大量经验值
      </div>

      {/* 项目完成按钮（与原有装备系统联动） */}
      {onProjectComplete && (
        <button
          onClick={handleProjectCompleteClick}
          className="mt-6 w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
        >
          标记项目已完成
        </button>
      )}
    </Card>
  );
};

export default CustomProjectSystem;